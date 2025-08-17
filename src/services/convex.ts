import type {
  WeatherStation,
  WeatherData,
  ConvexWeatherReading,
} from '../types/weather';

// Note: This is a mock implementation of Convex API
// In a real implementation, you would use the Convex client
class ConvexApiService {
  // private readonly convexUrl = import.meta.env.VITE_CONVEX_URL || '';

  async getStations(): Promise<WeatherStation[]> {
    try {
      // Mock implementation - replace with actual Convex query
      const mockStations: WeatherStation[] = [
        {
          id: '1',
          name: 'Backyard Weather Station',
          macAddress: '8C:4F:00:02:EC:A7',
          apiKey: import.meta.env.VITE_ECOWITT_API_KEY || '',
          applicationKey: import.meta.env.VITE_ECOWITT_APPLICATION_KEY || '',
          location: 'Backyard',
          description: 'Main weather monitoring station',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
      ];

      return mockStations;
    } catch (error) {
      console.error('Error fetching stations from Convex:', error);
      return [];
    }
  }

  async addStation(
    station: Omit<WeatherStation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WeatherStation> {
    try {
      // Mock implementation - replace with actual Convex mutation
      const newStation: WeatherStation = {
        ...station,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Adding station to Convex:', newStation);
      return newStation;
    } catch (error) {
      console.error('Error adding station to Convex:', error);
      throw new Error('Failed to add station');
    }
  }

  async updateStation(
    stationId: string,
    updates: Partial<WeatherStation>
  ): Promise<WeatherStation> {
    try {
      // Mock implementation - replace with actual Convex mutation
      const updatedStation: WeatherStation = {
        id: stationId,
        name: updates.name || 'Updated Station',
        macAddress: updates.macAddress || '',
        apiKey: updates.apiKey || '',
        applicationKey: updates.applicationKey || '',
        location: updates.location,
        description: updates.description,
        isActive: updates.isActive ?? true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };

      console.log('Updating station in Convex:', updatedStation);
      return updatedStation;
    } catch (error) {
      console.error('Error updating station in Convex:', error);
      throw new Error('Failed to update station');
    }
  }

  async removeStation(stationId: string): Promise<void> {
    try {
      // Mock implementation - replace with actual Convex mutation
      console.log('Removing station from Convex:', stationId);
    } catch (error) {
      console.error('Error removing station from Convex:', error);
      throw new Error('Failed to remove station');
    }
  }

  async saveWeatherReading(
    stationId: string,
    weatherData: WeatherData
  ): Promise<void> {
    try {
      // Mock implementation - replace with actual Convex mutation
      const reading: ConvexWeatherReading = {
        _id: Date.now().toString(),
        stationId,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        pressure: weatherData.pressure,
        windSpeed: weatherData.windSpeed,
        windDirection: weatherData.windDirection,
        windGust: weatherData.windGust,
        rainfall: weatherData.rainfall,
        solarRadiation: weatherData.solarRadiation,
        uvIndex: weatherData.uvIndex,
        dewPoint: weatherData.dewPoint,
        feelsLike: weatherData.feelsLike,
        batteryLevel: weatherData.batteryLevel,
        signalStrength: weatherData.signalStrength,
        _creationTime: Date.now(),
      };

      console.log('Saving weather reading to Convex:', reading);
    } catch (error) {
      console.error('Error saving weather reading to Convex:', error);
      throw new Error('Failed to save weather reading');
    }
  }

  async getWeatherHistory(
    stationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WeatherData[]> {
    try {
      // Mock implementation - replace with actual Convex query
      console.log('Fetching weather history from Convex:', {
        stationId,
        startDate,
        endDate,
      });
      return [];
    } catch (error) {
      console.error('Error fetching weather history from Convex:', error);
      return [];
    }
  }

  async getLatestReading(stationId: string): Promise<WeatherData | null> {
    try {
      // Mock implementation - replace with actual Convex query
      console.log('Fetching latest reading from Convex:', stationId);
      return null;
    } catch (error) {
      console.error('Error fetching latest reading from Convex:', error);
      return null;
    }
  }

  // Helper method to convert Convex station to app station (currently unused)
  // private convertConvexStation(
  //   convexStation: ConvexWeatherStation
  // ): WeatherStation {
  //   return {
  //     id: convexStation._id,
  //     name: convexStation.name,
  //     macAddress: convexStation.macAddress,
  //     apiKey: convexStation.apiKey,
  //     applicationKey: convexStation.applicationKey,
  //     location: convexStation.location,
  //     description: convexStation.description,
  //     isActive: convexStation.isActive,
  //     createdAt: new Date(convexStation._creationTime),
  //     updatedAt: new Date(convexStation._creationTime),
  //   };
  // }

  // Helper method to convert Convex reading to app weather data (currently unused)
  // private convertConvexReading(
  //   convexReading: ConvexWeatherReading
  // ): WeatherData {
  //   return {
  //     stationId: convexReading.stationId,
  //     timestamp: new Date(convexReading._creationTime),
  //     temperature: convexReading.temperature,
  //     humidity: convexReading.humidity,
  //     pressure: convexReading.pressure,
  //     windSpeed: convexReading.windSpeed,
  //     windDirection: convexReading.windDirection,
  //     windGust: convexReading.windGust,
  //     rainfall: convexReading.rainfall,
  //     solarRadiation: convexReading.solarRadiation,
  //     uvIndex: convexReading.uvIndex,
  //     dewPoint: convexReading.dewPoint,
  //     feelsLike: convexReading.feelsLike,
  //     batteryLevel: convexReading.batteryLevel,
  //     signalStrength: convexReading.signalStrength,
  //   };
  // }
}

export const convexApi = new ConvexApiService();
