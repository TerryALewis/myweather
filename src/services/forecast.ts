import axios from 'axios';

export interface ForecastDay {
  date: string;
  dayName: string;
  icon: string;
  condition: string;
  high: number;
  low: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

class ForecastService {
  private readonly baseUrl = 'https://api.weather.gov';

  /**
   * Get weather forecast for a location using National Weather Service API
   * @param lat Latitude
   * @param lon Longitude
   * @returns Promise<ForecastDay[]>
   */
  async getForecast(lat: number, lon: number): Promise<ForecastDay[]> {
    try {
      console.log('🌦️ Fetching forecast for location:', { lat, lon });

      // First, get the grid point info for the coordinates
      const pointsResponse = await axios.get(
        `${this.baseUrl}/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
        {
          headers: {
            'User-Agent': 'MyWeather PWA (your-email@example.com)',
          },
          timeout: 10000,
        }
      );

      const { gridId, gridX, gridY } = pointsResponse.data.properties;
      console.log('📍 Grid point:', { gridId, gridX, gridY });

      // Get the forecast using the grid coordinates
      const forecastResponse = await axios.get(
        `${this.baseUrl}/gridpoints/${gridId}/${gridX},${gridY}/forecast`,
        {
          headers: {
            'User-Agent': 'MyWeather PWA (your-email@example.com)',
          },
          timeout: 10000,
        }
      );

      const periods = forecastResponse.data.properties.periods;
      console.log('📅 Raw forecast periods:', periods.length);

      // Process the forecast data
      const forecast: ForecastDay[] = [];
      const processedDates = new Set<string>();

      for (const period of periods) {
        const date = new Date(period.startTime);
        const dateKey = date.toDateString();

        // Skip if we already processed this date
        if (processedDates.has(dateKey)) continue;

        // Find corresponding night period for low temperature
        const nightPeriod = periods.find((p: any) => {
          const pDate = new Date(p.startTime);
          return (
            pDate.toDateString() === dateKey &&
            !p.isDaytime &&
            p.name.toLowerCase().includes('night')
          );
        });

        const forecastDay: ForecastDay = {
          date: date.toISOString().split('T')[0],
          dayName: this.formatDayName(date),
          icon: this.getWeatherEmoji(
            period.shortForecast || period.detailedForecast
          ),
          condition: this.cleanCondition(period.shortForecast || 'Unknown'),
          high: period.isDaytime
            ? period.temperature
            : nightPeriod?.temperature || period.temperature,
          low: nightPeriod?.temperature || period.temperature - 10, // Fallback estimation
          humidity: period.relativeHumidity?.value,
          windSpeed: this.parseWindSpeed(period.windSpeed),
          precipitation: period.probabilityOfPrecipitation?.value,
        };

        // If this is a daytime period, use it as the high
        if (period.isDaytime) {
          forecastDay.high = period.temperature;
        } else if (nightPeriod) {
          // Find the corresponding day period for high temperature
          const dayPeriod = periods.find((p: any) => {
            const pDate = new Date(p.startTime);
            return pDate.toDateString() === dateKey && p.isDaytime;
          });
          if (dayPeriod) {
            forecastDay.high = dayPeriod.temperature;
          }
        }

        forecast.push(forecastDay);
        processedDates.add(dateKey);

        // Limit to 7 days
        if (forecast.length >= 7) break;
      }

      console.log('✅ Processed forecast:', forecast.length, 'days');
      return forecast;
    } catch (error) {
      console.error('❌ Error fetching forecast:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Weather forecast not available for this location');
        }
        throw new Error(
          `Weather service error: ${error.response?.status || error.message}`
        );
      }
      throw new Error('Failed to fetch weather forecast');
    }
  }

  /**
   * Get location coordinates from the first active weather station
   * This is a fallback method when geolocation is not available
   */
  async getLocationFromWeatherStation(): Promise<Location | null> {
    // For now, return a default location (you can customize this)
    // In a real implementation, you might store coordinates with each station
    return {
      latitude: 36.1627, // Nashville, TN (example)
      longitude: -86.7816,
    };
  }

  /**
   * Get user's current location using geolocation API
   */
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          reject(new Error('Unable to get current location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  private formatDayName(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  }

  private getWeatherEmoji(condition: string): string {
    const lower = condition.toLowerCase();

    if (lower.includes('sunny') || lower.includes('clear')) return '☀️';
    if (lower.includes('partly cloudy') || lower.includes('partly sunny'))
      return '⛅';
    if (lower.includes('cloudy') || lower.includes('overcast')) return '☁️';
    if (lower.includes('rain') || lower.includes('shower')) return '🌧️';
    if (lower.includes('storm') || lower.includes('thunder')) return '⛈️';
    if (lower.includes('snow') || lower.includes('blizzard')) return '❄️';
    if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
    if (lower.includes('wind')) return '💨';
    if (lower.includes('hot')) return '🔥';
    if (lower.includes('cold')) return '🥶';

    return '🌤️'; // Default
  }

  private cleanCondition(condition: string): string {
    // Remove common NWS abbreviations and clean up
    return condition
      .replace(/\b(mph|°F|°C)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseWindSpeed(windSpeed: string): number | undefined {
    if (!windSpeed) return undefined;
    const match = windSpeed.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }
}

export const forecastService = new ForecastService();
