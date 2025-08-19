import type { WeatherData } from '../types/weather';
import { ecowittApi } from './ecowitt';

interface HistoricalDataPoint {
  timestamp: Date;
  value: number;
}

interface UserSettings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windUnit: 'ms' | 'kmh' | 'mph' | 'knots';
  pressureUnit: 'hpa' | 'inhg' | 'mmhg';
}

export type MetricType =
  | 'temperature'
  | 'humidity'
  | 'pressure'
  | 'windSpeed'
  | 'rainfall';

class HistoricalDataService {
  // Get real historical data from Ecowitt API for the last 24 hours
  async getHistoricalData(
    stationId: string,
    apiKey: string,
    applicationKey: string,
    metricType: MetricType,
    userSettings: UserSettings
  ): Promise<HistoricalDataPoint[]> {
    try {
      // Calculate 24 hours ago
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

      console.log(
        '🔄 Fetching real historical data from Ecowitt API for metric:',
        metricType
      );

      const historicalData = await ecowittApi.getHistoricalData(
        stationId,
        apiKey,
        applicationKey,
        startTime,
        endTime,
        metricType // Pass the metric type to get specific data
      );

      console.log('📊 Received historical data points:', historicalData.length);

      // Extract the specific metric values
      return historicalData.map((item) => ({
        timestamp: item.timestamp,
        value: this.extractMetricValue(item, metricType),
      }));
    } catch (error) {
      console.warn(
        '⚠️ Failed to fetch real historical data, falling back to generated data:',
        error
      );
      // Fallback to generated data if API fails
      return [];
    }
  }

  private extractMetricValue(
    item: {
      timestamp: Date;
      temperature: number;
      humidity: number;
      pressure: number;
      windSpeed: number;
      rainfall: number;
    },
    metricType: MetricType
  ): number {
    switch (metricType) {
      case 'temperature':
        return item.temperature;
      case 'humidity':
        return item.humidity;
      case 'pressure':
        return item.pressure;
      case 'windSpeed':
        return item.windSpeed;
      case 'rainfall':
        return item.rainfall;
      default:
        return 0;
    }
  }

  // Generate mock historical data for the last 24 hours (fallback method)
  generateHistoricalData(
    currentData: WeatherData,
    metricType: MetricType,
    userSettings: UserSettings
  ): HistoricalDataPoint[] {
    try {
      if (!currentData) {
        console.warn('No current data provided for historical generation');
        return [];
      }

      const data: HistoricalDataPoint[] = [];
      const now = new Date();
      const hoursBack = 24;

      // Get current value based on metric type
      let currentValue: number;
      switch (metricType) {
        case 'temperature':
          currentValue = currentData.temperature || 70;
          break;
        case 'humidity':
          currentValue = currentData.humidity || 50;
          break;
        case 'pressure':
          currentValue = currentData.pressure || 29.92;
          break;
        case 'windSpeed':
          currentValue = currentData.windSpeed || 5;
          break;
        case 'rainfall':
          currentValue = currentData.rainfall || 0;
          break;
        default:
          currentValue = 0;
      }

      // Ensure we have a valid number
      if (isNaN(currentValue) || !isFinite(currentValue)) {
        console.warn(`Invalid current value for ${metricType}:`, currentValue);
        currentValue = 0;
      }

      // Generate data points for each hour
      for (let i = hoursBack; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        let value: number;

        // Generate realistic variations based on metric type
        switch (metricType) {
          case 'temperature':
            value = this.generateTemperatureVariation(
              currentValue,
              i,
              hoursBack
            );
            break;
          case 'humidity':
            value = this.generateHumidityVariation(currentValue, i, hoursBack);
            break;
          case 'pressure':
            value = this.generatePressureVariation(currentValue, i, hoursBack);
            break;
          case 'windSpeed':
            value = this.generateWindSpeedVariation(currentValue, i, hoursBack);
            break;
          case 'rainfall':
            value = this.generateRainfallVariation(currentValue, i, hoursBack);
            break;
          default:
            value = currentValue;
        }

        data.push({ timestamp, value });
      }

      return data;
    } catch (error) {
      console.error('Error generating historical data:', error);
      return [];
    }
  }

  private generateTemperatureVariation(
    current: number,
    hoursBack: number,
    totalHours: number
  ): number {
    // Daily temperature cycle - cooler at night, warmer during day
    const cyclePosition = (hoursBack / totalHours) * 2 * Math.PI;
    const dailyCycle = Math.sin(cyclePosition + Math.PI / 2) * 5; // ±5 degree variation

    // Random noise
    const noise = (Math.random() - 0.5) * 2; // ±1 degree random variation

    // Gradual trend (slight warming/cooling trend)
    const trend = (totalHours - hoursBack) * 0.1; // 0.1 degree per hour trend

    return Math.max(0, current + dailyCycle + noise + trend);
  }

  private generateHumidityVariation(
    current: number,
    hoursBack: number,
    totalHours: number
  ): number {
    // Humidity tends to be higher at night, lower during day
    const cyclePosition = (hoursBack / totalHours) * 2 * Math.PI;
    const dailyCycle = Math.sin(cyclePosition) * 10; // ±10% variation

    // Random noise
    const noise = (Math.random() - 0.5) * 5; // ±2.5% random variation

    const value = current + dailyCycle + noise;
    return Math.max(0, Math.min(100, value)); // Clamp between 0-100%
  }

  private generatePressureVariation(
    current: number,
    hoursBack: number,
    totalHours: number
  ): number {
    // Pressure changes are usually gradual
    const trend = (Math.random() - 0.5) * 0.5; // Slight trend
    const noise = (Math.random() - 0.5) * 0.3; // Small random variations

    return Math.max(0, current + trend + noise);
  }

  private generateWindSpeedVariation(
    current: number,
    hoursBack: number,
    totalHours: number
  ): number {
    // Wind can be quite variable
    const gust = Math.random() < 0.1 ? Math.random() * current * 0.5 : 0; // 10% chance of gust
    const noise = (Math.random() - 0.5) * current * 0.3; // ±30% variation

    return Math.max(0, current + gust + noise);
  }

  private generateRainfallVariation(
    current: number,
    hoursBack: number,
    totalHours: number
  ): number {
    // Rainfall is cumulative, so it should increase or stay the same
    if (current === 0) {
      // No rain, occasionally add small amounts
      return Math.random() < 0.05 ? Math.random() * 0.1 : 0;
    }

    // If there's current rainfall, generate a realistic accumulation pattern
    const rainChance = Math.random();
    if (rainChance < 0.3) {
      // 30% chance of additional rain
      return current - Math.random() * current * 0.3; // Previous accumulation
    }

    return current - Math.random() * current * 0.5; // Previous accumulation
  }

  // Get the appropriate unit for display
  getDisplayUnit(metricType: MetricType, userSettings: UserSettings): string {
    switch (metricType) {
      case 'temperature':
        return userSettings.temperatureUnit === 'celsius' ? '°C' : '°F';
      case 'humidity':
        return '%';
      case 'pressure':
        switch (userSettings.pressureUnit) {
          case 'hpa':
            return 'hPa';
          case 'inhg':
            return 'inHg';
          case 'mmhg':
            return 'mmHg';
          default:
            return 'hPa';
        }
      case 'windSpeed':
        switch (userSettings.windUnit) {
          case 'ms':
            return 'm/s';
          case 'kmh':
            return 'km/h';
          case 'mph':
            return 'mph';
          case 'knots':
            return 'knots';
          default:
            return 'mph';
        }
      case 'rainfall':
        return 'in'; // Always inches for now
      default:
        return '';
    }
  }

  // Get metric title and icon
  getMetricInfo(metricType: MetricType): {
    title: string;
    icon: string;
    color: string;
  } {
    switch (metricType) {
      case 'temperature':
        return {
          title: 'Temperature',
          icon: '🌡️',
          color: '#FF8C00', // Sunset Orange
        };
      case 'humidity':
        return {
          title: 'Humidity',
          icon: '💧',
          color: '#6495ED', // Rain Blue
        };
      case 'pressure':
        return {
          title: 'Pressure',
          icon: '📊',
          color: '#4A90E2', // Ocean Blue
        };
      case 'windSpeed':
        return {
          title: 'Wind Speed',
          icon: '🌬️',
          color: '#87CEEB', // Sky Blue
        };
      case 'rainfall':
        return {
          title: 'Rainfall',
          icon: '🌧️',
          color: '#708090', // Storm Gray
        };
      default:
        return {
          title: 'Weather Data',
          icon: '📊',
          color: '#4A90E2',
        };
    }
  }
}

export const historicalDataService = new HistoricalDataService();
