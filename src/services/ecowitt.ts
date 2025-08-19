import axios from 'axios';
import type { WeatherData, EcowittApiResponse } from '../types/weather';

interface UserSettings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windUnit: 'ms' | 'kmh' | 'mph' | 'knots';
  pressureUnit: 'hpa' | 'inhg' | 'mmhg';
}

class EcowittApiService {
  private readonly baseUrl = 'https://api.ecowitt.net/api/v3';

  // Get user's unit preferences from localStorage
  private getUserSettings(): UserSettings {
    try {
      const savedSettings = localStorage.getItem('myweather-app-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return {
          temperatureUnit: parsed.temperatureUnit || 'fahrenheit',
          windUnit: parsed.windUnit || 'mph',
          pressureUnit: parsed.pressureUnit || 'inhg',
        };
      }
    } catch (error) {
      console.warn('Could not load user settings, using defaults:', error);
    }

    // Default to imperial units
    return {
      temperatureUnit: 'fahrenheit',
      windUnit: 'mph',
      pressureUnit: 'inhg',
    };
  }

  // Map user preferences to Ecowitt API unit IDs
  private getEcowittUnitIds(settings: UserSettings) {
    const unitIds = {
      temp_unitid: settings.temperatureUnit === 'celsius' ? 1 : 2, // 1=Celsius, 2=Fahrenheit
      pressure_unitid: 4, // We'll keep as hPa and convert as needed
      wind_speed_unitid: 6, // We'll keep as m/s and convert as needed
      rainfall_unitid: 12, // We'll keep as mm and convert as needed
      solar_irradiance_unitid: 16, // W/m² (standard)
    };

    // Adjust pressure unit if we want to get it directly from API
    if (settings.pressureUnit === 'inhg') {
      unitIds.pressure_unitid = 5; // inHg
    } else if (settings.pressureUnit === 'mmhg') {
      unitIds.pressure_unitid = 6; // mmHg
    }

    return unitIds;
  }

  async getStationData(
    macAddress: string,
    apiKey: string,
    applicationKey: string
  ): Promise<WeatherData> {
    try {
      const userSettings = this.getUserSettings();
      const unitIds = this.getEcowittUnitIds(userSettings);

      const params = {
        application_key: applicationKey,
        api_key: apiKey,
        mac: macAddress,
        call_back: 'all',
        ...unitIds,
      };

      console.log('🔑 API Debug Info:', {
        macAddress,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        applicationKeyPresent: !!applicationKey,
        applicationKeyLength: applicationKey?.length || 0,
        apiKeyStart: apiKey?.substring(0, 4) + '...',
        applicationKeyStart: applicationKey?.substring(0, 4) + '...',
        userSettings,
        unitIds,
      });

      console.log('Ecowitt API Request:', {
        url: `${this.baseUrl}/device/real_time`,
        params: {
          ...params,
          api_key: apiKey ? '***' : 'MISSING',
          application_key: applicationKey ? '***' : 'MISSING',
        },
      });

      const response = await axios.get<EcowittApiResponse>(
        `${this.baseUrl}/device/real_time`,
        { params }
      );

      console.log('📡 Ecowitt API Response Status:', response.status);
      console.log('📡 Ecowitt API Response Data:', response.data);

      if (response.data.code !== 0) {
        console.error('❌ Ecowitt API Error Code:', response.data.code);
        console.error('❌ Ecowitt API Error Message:', response.data.msg);
        throw new Error(`Ecowitt API Error: ${response.data.msg}`);
      }

      return this.parseWeatherData(
        response.data.data,
        macAddress,
        userSettings
      );
    } catch (error) {
      console.error('💥 Error in getStationData:', error);
      if (axios.isAxiosError(error)) {
        console.error('🔗 Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.data) {
          // If there's a structured error response from Ecowitt
          const errorData = error.response.data;
          if (errorData.msg) {
            throw new Error(`Ecowitt API Error: ${errorData.msg}`);
          }
        }

        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    }
  }

  private parseWeatherData(
    data: any,
    stationId: string,
    userSettings: UserSettings
  ): WeatherData {
    console.log('🏷️ Parsing weather data:', data); // Debug: log full data structure
    console.log('👤 Using user settings:', userSettings); // Debug: log user settings

    const outdoor = data.outdoor || {};
    const rainfall = data.rainfall_piezo || {};
    const solarAndUvi = data.solar_and_uvi || {};
    const battery = data.battery || [];
    const wind = data.wind || [];
    const pressureData = data.pressure || [];

    // Extract station name from various possible fields
    const stationName =
      data.device_name ||
      data.station_name ||
      data.name ||
      data.device?.name ||
      data.station?.name ||
      undefined;

    console.log('🏷️ Extracted station name:', stationName); // Debug: log station name

    // Get raw values from API (in the units we requested)
    const tempRaw = parseFloat(outdoor.temperature?.value || '0');
    const humidityRaw = parseFloat(outdoor.humidity?.value || '0');
    const pressureRaw = parseFloat(pressureData?.absolute?.value || '0');
    const windSpeedRaw = parseFloat(wind?.wind_speed?.value || '0');
    const rainfallRaw = parseFloat(rainfall.daily?.value || '0');

    // Convert units based on user preferences
    const temp = this.convertTemperature(tempRaw, userSettings.temperatureUnit);
    const humidity = humidityRaw; // Humidity stays the same (percentage)
    const pressure = this.convertPressure(
      pressureRaw,
      userSettings.pressureUnit
    );
    const windSpeed = this.convertWindSpeed(
      windSpeedRaw,
      userSettings.windUnit
    );
    const rainfallConverted = this.mmToInches(rainfallRaw); // Always convert to inches for now

    // Calculate dew point and feels like in the user's preferred temperature unit
    const tempForCalculations =
      userSettings.temperatureUnit === 'fahrenheit'
        ? this.fahrenheitToCelsius(temp)
        : temp;
    const windSpeedForCalculations = this.convertWindSpeedForCalculations(
      windSpeed,
      userSettings.windUnit
    );

    const dewPointCelsius = this.calculateDewPoint(
      tempForCalculations,
      humidity
    );
    const feelsLikeCelsius = this.calculateFeelsLike(
      tempForCalculations,
      humidity,
      windSpeedForCalculations
    );

    const dewPoint =
      userSettings.temperatureUnit === 'fahrenheit'
        ? this.celsiusToFahrenheit(dewPointCelsius)
        : dewPointCelsius;
    const feelsLike =
      userSettings.temperatureUnit === 'fahrenheit'
        ? this.celsiusToFahrenheit(feelsLikeCelsius)
        : feelsLikeCelsius;

    // Get battery level (average of all batteries)
    const batteryLevel =
      battery.length > 0
        ? battery.reduce(
            (sum: number, b: any) => sum + parseFloat(b.percentage || '0'),
            0
          ) / battery.length
        : undefined;

    return {
      stationId,
      stationName,
      timestamp: new Date(),
      temperature: temp,
      humidity,
      pressure,
      windSpeed,
      windDirection: parseFloat(outdoor.wind?.wind_direction?.value || '0'),
      windGust: this.convertWindSpeed(
        parseFloat(outdoor.wind?.wind_gust?.value || '0'),
        userSettings.windUnit
      ),
      rainfall: rainfallConverted,
      solarRadiation: parseFloat(solarAndUvi.solar?.value || '0') || undefined,
      uvIndex: parseFloat(solarAndUvi.uvi?.value || '0') || undefined,
      dewPoint,
      feelsLike,
      batteryLevel,
      signalStrength: undefined, // Not provided by Ecowitt API
    };
  }

  private calculateDewPoint(temperature: number, humidity: number): number {
    // Magnus formula for dew point calculation
    const a = 17.27;
    const b = 237.7;
    const alpha =
      (a * temperature) / (b + temperature) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  }

  private calculateFeelsLike(
    temperature: number,
    humidity: number,
    windSpeed: number
  ): number {
    // Simplified feels like calculation
    if (temperature >= 27) {
      // Heat index calculation for hot weather
      const c1 = -8.78469475556;
      const c2 = 1.61139411;
      const c3 = 2.33854883889;
      const c4 = -0.14611605;
      const c5 = -0.012308094;
      const c6 = -0.0164248277778;
      const c7 = 0.002211732;
      const c8 = 0.00072546;
      const c9 = -0.000003582;

      const rh = humidity;
      const t = temperature;

      return (
        c1 +
        c2 * t +
        c3 * rh +
        c4 * t * rh +
        c5 * t * t +
        c6 * rh * rh +
        c7 * t * t * rh +
        c8 * t * rh * rh +
        c9 * t * t * rh * rh
      );
    } else if (temperature <= 10 && windSpeed > 1.39) {
      // Wind chill calculation for cold weather
      return (
        13.12 +
        0.6215 * temperature -
        11.37 * Math.pow(windSpeed * 3.6, 0.16) +
        0.3965 * temperature * Math.pow(windSpeed * 3.6, 0.16)
      );
    }

    // No adjustment needed
    return temperature;
  }

  // Unit conversion methods
  private convertTemperature(
    value: number,
    unit: 'celsius' | 'fahrenheit'
  ): number {
    // If API returned in the requested unit, return as-is
    return value;
  }

  private convertPressure(
    value: number,
    unit: 'hpa' | 'inhg' | 'mmhg'
  ): number {
    // If API returned in the requested unit, return as-is
    // Note: We're currently always requesting hPa from API, so convert if needed
    switch (unit) {
      case 'hpa':
        return value;
      case 'inhg':
        return value * 0.02953; // hPa to inHg
      case 'mmhg':
        return value * 0.750062; // hPa to mmHg
      default:
        return value;
    }
  }

  private convertWindSpeed(
    value: number,
    unit: 'ms' | 'kmh' | 'mph' | 'knots'
  ): number {
    // API always returns m/s, so convert to user's preferred unit
    switch (unit) {
      case 'ms':
        return value;
      case 'kmh':
        return value * 3.6; // m/s to km/h
      case 'mph':
        return value * 2.237; // m/s to mph
      case 'knots':
        return value * 1.944; // m/s to knots
      default:
        return value;
    }
  }

  private convertWindSpeedForCalculations(
    value: number,
    fromUnit: 'ms' | 'kmh' | 'mph' | 'knots'
  ): number {
    // Convert back to m/s for calculations
    switch (fromUnit) {
      case 'ms':
        return value;
      case 'kmh':
        return value / 3.6;
      case 'mph':
        return value / 2.237;
      case 'knots':
        return value / 1.944;
      default:
        return value;
    }
  }

  private celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  private fahrenheitToCelsius(fahrenheit: number): number {
    return ((fahrenheit - 32) * 5) / 9;
  }

  private msToMph(ms: number): number {
    return ms * 2.237; // 1 m/s = 2.237 mph
  }

  private mmToInches(mm: number): number {
    return mm * 0.0393701; // 1 mm = 0.0393701 inches
  }

  async validateApiCredentials(
    macAddress: string,
    apiKey: string,
    applicationKey: string
  ): Promise<boolean> {
    try {
      await this.getStationData(macAddress, apiKey, applicationKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const ecowittApi = new EcowittApiService();
