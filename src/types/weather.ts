// Weather Station Types
export interface WeatherStation {
  id: string;
  name: string;
  macAddress: string;
  apiKey: string;
  applicationKey: string;
  location?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Weather Data Types
export interface WeatherData {
  stationId: string;
  stationName?: string; // Station name from Ecowitt API
  timestamp: Date;
  temperature: number; // °C
  humidity: number; // %
  pressure: number; // hPa
  windSpeed: number; // m/s
  windDirection: number; // degrees
  windGust: number; // m/s
  rainfall: number; // mm (daily)
  rainfallWeekly?: number; // mm
  rainfallMonthly?: number; // mm
  rainfallYearly?: number; // mm
  solarRadiation?: number; // W/m²
  uvIndex?: number;
  dewPoint?: number; // °C
  feelsLike?: number; // °C
  batteryLevel?: number; // %
  signalStrength?: number; // %
}

// Ecowitt API Response Types
export interface EcowittApiResponse {
  code: number;
  msg: string;
  time: string;
  data: EcowittWeatherData;
}

export interface EcowittWeatherData {
  // Device/Station information
  device_name?: string;
  station_name?: string;
  device_id?: string;
  model?: string;
  outdoor: {
    temperature: {
      value: string;
      unit: string;
    };
    humidity: {
      value: string;
      unit: string;
    };
    pressure: {
      absolute: {
        value: string;
        unit: string;
      };
      relative: {
        value: string;
        unit: string;
      };
    };
    wind: {
      wind_speed: {
        value: string;
        unit: string;
      };
      wind_direction: {
        value: string;
        unit: string;
      };
      wind_gust: {
        value: string;
        unit: string;
      };
    };
  };
  rainfall: {
    daily: {
      value: string;
      unit: string;
    };
    weekly: {
      value: string;
      unit: string;
    };
    monthly: {
      value: string;
      unit: string;
    };
    yearly: {
      value: string;
      unit: string;
    };
    rate: {
      value: string;
      unit: string;
    };
  };
  solar_and_uvi: {
    solar: {
      value: string;
      unit: string;
    };
    uvi: {
      value: string;
      unit: string;
    };
  };
  battery: Array<{
    id: string;
    voltage: string;
    percentage: string;
  }>;
}

// UI Types
export interface WeatherCardData {
  icon: string;
  title: string;
  value: string;
  unit: string;
  color: string;
  emoji: string;
}

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
}

export interface WeatherAlert {
  id: string;
  stationId: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// Form Types
export interface AddStationForm {
  name: string;
  macAddress: string;
  apiKey: string;
  applicationKey: string;
  location: string;
  description: string;
}

// API Response Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Convex Database Types
export interface ConvexWeatherStation {
  _id: string;
  name: string;
  macAddress: string;
  apiKey: string;
  applicationKey: string;
  location?: string;
  description?: string;
  isActive: boolean;
  _creationTime: number;
}

export interface ConvexWeatherReading {
  _id: string;
  stationId: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  rainfall: number;
  solarRadiation?: number;
  uvIndex?: number;
  dewPoint?: number;
  feelsLike?: number;
  batteryLevel?: number;
  signalStrength?: number;
  _creationTime: number;
}
