import axios from 'axios';
import type { WeatherData, EcowittApiResponse } from '../types/weather';

class EcowittApiService {
  private readonly baseUrl = 'https://api.ecowitt.net/api/v3';

  async getStationData(
    macAddress: string,
    apiKey: string,
    applicationKey: string
  ): Promise<WeatherData> {
    try {
      const params = {
        application_key: applicationKey,
        api_key: apiKey,
        mac: macAddress,
        call_back: 'all',
        temp_unitid: 1, // Celsius (we'll convert to Fahrenheit in code)
        pressure_unitid: 4, // Hg
        wind_speed_unitid: 6, // m/s (we'll convert to mph in code)
        rainfall_unitid: 12, // mm (we'll convert to inches in code)
        solar_irradiance_unitid: 16, // W/m²
      };

      console.log('🔑 API Debug Info:', {
        macAddress,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        applicationKeyPresent: !!applicationKey,
        applicationKeyLength: applicationKey?.length || 0,
        apiKeyStart: apiKey?.substring(0, 4) + '...',
        applicationKeyStart: applicationKey?.substring(0, 4) + '...',
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

      return this.parseWeatherData(response.data.data, macAddress);
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

  private parseWeatherData(data: any, stationId: string): WeatherData {
    console.log('🏷️ Parsing weather data:', data); // Debug: log full data structure
    
    const outdoor = data.outdoor || {};
    const rainfall = data.rainfall_piezo || {};
    const solarAndUvi = data.solar_and_uvi || {};
    const battery = data.battery || [];
    const wind = data.wind || [];
    const pressureData = data.pressure || [];

    // Extract station name from various possible fields
    const stationName = data.device_name || 
                       data.station_name || 
                       data.name || 
                       data.device?.name ||
                       data.station?.name ||
                       undefined;

    console.log('🏷️ Extracted station name:', stationName); // Debug: log station name

    // Get raw values (likely still in metric units)
    const tempRaw = parseFloat(outdoor.temperature?.value || '0');
    const humidityRaw = parseFloat(outdoor.humidity?.value || '0');
    const pressureRaw = parseFloat(pressureData?.absolute?.value || '0');
    //const pressureRaw = parseFloat(outdoor.pressure?.absolute?.value || '0');
    const windSpeedRaw = parseFloat(wind?.wind_speed?.value || '0');
    //const windSpeedRaw = parseFloat(outdoor.wind?.wind_speed?.value || '0');
    const rainfallRaw = parseFloat(rainfall.daily?.value || '0');

    // Convert units to imperial
    const temp = this.celsiusToFahrenheit(tempRaw);
    const humidity = humidityRaw; // Humidity stays the same
    const pressure = pressureRaw; // Keep hPa
    const windSpeed = this.msToMph(windSpeedRaw);
    const rainfallConverted = this.mmToInches(rainfallRaw);

    // Calculate dew point and feels like in Fahrenheit
    const dewPoint = this.celsiusToFahrenheit(
      this.calculateDewPoint(tempRaw, humidity)
    );
    const feelsLike = this.celsiusToFahrenheit(
      this.calculateFeelsLike(tempRaw, humidity, windSpeedRaw)
    );

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
      windGust: this.msToMph(parseFloat(outdoor.wind?.wind_gust?.value || '0')),
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
  private celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
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
