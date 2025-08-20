<template>
  <div class="dashboard-container">
    <!-- Top Section: Current Weather Data -->
    <section class="current-weather-section">
      <div class="section-header">
        <h1>🌤️ Current Weather</h1>
        <p class="section-subtitle">
          Real-time data from your Ecowitt weather station
        </p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading"></div>
        <p>Loading weather data...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <span class="weather-emoji">⚠️</span>
          {{ error }}
        </div>
        <button @click="refreshData" class="btn btn-primary">
          <span class="weather-emoji">🔄</span>
          Try Again
        </button>
      </div>

      <div v-else-if="!hasStations" class="no-stations-container">
        <div class="no-stations-message">
          <span class="weather-icon">📡</span>
          <h2>No Weather Stations</h2>
          <p>Add your first Ecowitt weather station to get started!</p>
          <router-link to="/stations" class="btn btn-primary">
            <span class="weather-emoji">➕</span>
            Add Weather Station
          </router-link>
        </div>
      </div>

      <div v-else class="current-weather-content">
        <!-- Main Weather Display -->
        <div
          class="main-weather-card clickable"
          @click="showMetricChart('temperature')"
          title="Click to view 24-hour temperature history"
        >
          <div v-if="primaryWeatherData" class="primary-weather">
            <div class="temperature-display">
              <span class="temperature">{{
                primaryWeatherData.temperature.toFixed(0)
              }}</span>
              <span class="temperature-unit">{{ temperatureUnit }}</span>
              <div class="chart-indicator">📈</div>
            </div>
            <div class="weather-info">
              <h3>{{ primaryStationName }}</h3>
              <p class="conditions">
                {{ getWeatherCondition(primaryWeatherData) }}
              </p>
              <p class="feels-like">
                Feels like {{ primaryWeatherData.feelsLike?.toFixed(0)
                }}{{ temperatureUnit }}
              </p>
              <p class="last-updated">
                <span class="weather-emoji">🕒</span>
                Updated {{ formatRelativeTime(primaryWeatherData.timestamp) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Weather Metrics Grid -->
        <div v-if="!showChart" class="weather-metrics-grid">
          <div
            class="metric-card clickable"
            @click="showMetricChart('humidity')"
            title="Click to view 24-hour history"
          >
            <span class="metric-icon">💧</span>
            <div class="metric-info">
              <span class="metric-label">Humidity</span>
              <span class="metric-value"
                >{{ primaryWeatherData?.humidity.toFixed(0) }}%</span
              >
            </div>
            <div class="chart-indicator">📈</div>
          </div>
          <div
            class="metric-card clickable"
            @click="showMetricChart('windSpeed')"
            title="Click to view 24-hour history"
          >
            <span class="metric-icon">🌬️</span>
            <div class="metric-info">
              <span class="metric-label">Wind</span>
              <span class="metric-value">{{ getWindDescription() }}</span>
            </div>
            <div class="chart-indicator">📈</div>
          </div>
          <div
            class="metric-card clickable"
            @click="showMetricChart('pressure')"
            title="Click to view 24-hour history"
          >
            <span class="metric-icon">📊</span>
            <div class="metric-info">
              <span class="metric-label">Pressure</span>
              <span class="metric-value"
                >{{ primaryWeatherData?.pressure.toFixed(2) }}
                {{ pressureUnit }}</span
              >
            </div>
            <div class="chart-indicator">📈</div>
          </div>
          <div
            class="metric-card rainfall-card clickable"
            @click="showMetricChart('rainfall')"
            title="Click to view 24-hour history"
          >
            <span class="metric-icon">🌧️</span>
            <div class="metric-info">
              <span class="metric-label">Rainfall</span>
              <div class="rainfall-values">
                <div class="rainfall-item">
                  <span class="rainfall-period">Today</span>
                  <span class="rainfall-amount"
                    >{{
                      primaryWeatherData?.rainfall?.toFixed(2) || '0.00'
                    }}
                    in</span
                  >
                </div>
                <div class="rainfall-item">
                  <span class="rainfall-period">Week</span>
                  <span class="rainfall-amount"
                    >{{
                      primaryWeatherData?.rainfallWeekly?.toFixed(2) || '0.00'
                    }}
                    in</span
                  >
                </div>
                <div class="rainfall-item">
                  <span class="rainfall-period">Month</span>
                  <span class="rainfall-amount"
                    >{{
                      primaryWeatherData?.rainfallMonthly?.toFixed(2) || '0.00'
                    }}
                    in</span
                  >
                </div>
                <div class="rainfall-item">
                  <span class="rainfall-period">Year</span>
                  <span class="rainfall-amount"
                    >{{
                      primaryWeatherData?.rainfallYearly?.toFixed(2) || '0.00'
                    }}
                    in</span
                  >
                </div>
              </div>
            </div>
            <div class="chart-indicator">📈</div>
          </div>
          <div v-if="primaryWeatherData?.uvIndex" class="metric-card">
            <span class="metric-icon">☀️</span>
            <div class="metric-info">
              <span class="metric-label">UV Index</span>
              <span class="metric-value">{{
                primaryWeatherData.uvIndex.toFixed(0)
              }}</span>
            </div>
          </div>
          <div v-if="primaryWeatherData?.batteryLevel" class="metric-card">
            <span class="metric-icon">🔋</span>
            <div class="metric-info">
              <span class="metric-label">Battery</span>
              <span class="metric-value"
                >{{ primaryWeatherData.batteryLevel.toFixed(0) }}%</span
              >
            </div>
          </div>
        </div>

        <!-- Weather Chart Display -->
        <div v-if="showChart && chartData" class="chart-container">
          <WeatherChart
            :title="chartInfo.title"
            :icon="chartInfo.icon"
            :unit="chartUnit"
            :color="chartInfo.color"
            :data="chartData"
            :current-value="currentChartValue"
            :time-period="chartTimePeriod"
            @close="closeChart"
          />
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button
            @click="refreshAllData"
            class="btn btn-secondary"
            :disabled="loading"
          >
            <span class="weather-emoji">🔄</span>
            Refresh Data
          </button>
          <router-link to="/stations" class="btn btn-primary">
            <span class="weather-emoji">⚙️</span>
            Manage Stations
          </router-link>
        </div>
      </div>
    </section>

    <!-- Middle Section: 7-Day Forecast -->
    <section class="forecast-section">
      <div class="section-header">
        <h2>7-Day Forecast</h2>
        <p class="section-subtitle">
          Weather prediction for the next week{{
            forecastLocation ? ` for ${forecastLocation}` : ''
          }}
        </p>
      </div>

      <div class="forecast-content">
        <div v-if="forecastLoading" class="loading-container">
          <div class="loading"></div>
          <p>Loading forecast data...</p>
        </div>

        <div v-else-if="forecastError" class="error-container">
          <div class="error-message">
            <span class="weather-emoji">⚠️</span>
            {{ forecastError }}
          </div>
        </div>

        <div v-else-if="forecastData.length > 0" class="forecast-grid">
          <div
            v-for="day in forecastData"
            :key="day.date"
            class="forecast-card"
          >
            <div class="day-name">{{ day.dayName }}</div>
            <div class="month-date">{{ formatMonthDate(day.date) }}</div>
            <div class="weather-icon">{{ day.icon }}</div>
            <div class="condition">{{ day.condition }}</div>
            <div class="temperatures">
              <span class="high"
                >{{ convertForecastTemp(day.high)
                }}{{ temperatureUnit.charAt(1) }}</span
              >
              <span class="low"
                >{{ convertForecastTemp(day.low)
                }}{{ temperatureUnit.charAt(1) }}</span
              >
            </div>
          </div>
        </div>

        <div v-else class="coming-soon">
          <span class="weather-icon">�</span>
          <h3>Weather Forecast Coming Soon!</h3>
          <p>
            We're working on integrating weather forecast data from the National
            Weather Service.
          </p>
        </div>
      </div>
    </section>

    <!-- Bottom Section: Weather Map -->
    <section class="weather-map-section">
      <div class="section-header">
        <h2>🗺️ Weather Map</h2>
        <p class="section-subtitle">
          Regional weather conditions within 500 miles
        </p>
      </div>

      <div class="weather-map-content">
        <div v-if="mapLoading" class="loading-container">
          <div class="loading"></div>
          <p>Loading weather map...</p>
        </div>

        <div v-else-if="mapError" class="error-container">
          <div class="error-message">
            <span class="weather-emoji">⚠️</span>
            {{ mapError }}
          </div>
        </div>

        <div v-else-if="weatherMapUrl" class="weather-map-container">
          <div class="map-header">
            <h4>🌦️ Interactive Weather Map</h4>
            <p>Real-time weather conditions and forecast</p>
          </div>
          <div class="radar-container">
            <img
              :src="weatherMapUrl"
              class="weather-radar-image"
              alt="Weather Radar"
              @error="handleMapError"
              @load="handleMapLoad"
            />
          </div>
          <div class="map-footer">
            <p class="map-source">Source: National Weather Service</p>
            <button @click="refreshWeatherMap" class="btn btn-sm">
              <span class="weather-emoji">🔄</span>
              Refresh Map
            </button>
          </div>
        </div>

        <div v-else class="interactive-map-fallback">
          <div class="map-header">
            <h4>🌦️ Interactive Weather Map</h4>
            <p>Click to view detailed weather radar and conditions</p>
          </div>
          <div class="map-links">
            <a
              href="https://radar.weather.gov/"
              target="_blank"
              class="btn btn-primary"
            >
              <span class="weather-emoji">🗺️</span>
              View NOAA Radar
            </a>
            <a
              href="https://weather.com/weather/radar/interactive"
              target="_blank"
              class="btn btn-secondary"
            >
              <span class="weather-emoji">⛈️</span>
              Weather.com Radar
            </a>
          </div>
          <button @click="refreshWeatherMap" class="btn btn-outline">
            <span class="weather-emoji">🔄</span>
            Try Loading Radar Again
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useWeatherStore } from '../stores/weather';
import { forecastService, type ForecastDay } from '../services/forecast';
import { historicalDataService, type MetricType } from '../services/historical';
import type { WeatherData } from '../types/weather';
import WeatherChart from '../components/WeatherChart.vue';

const weatherStore = useWeatherStore();

// Reactive state for forecast and map
const forecastLoading = ref(false);
const forecastError = ref<string | null>(null);
const forecastData = ref<ForecastDay[]>([]);
const forecastLocation = ref<string | null>(null);

const mapLoading = ref(false);
const mapError = ref<string | null>(null);
const weatherMapUrl = ref<string | null>(null);

// User settings for unit display
const userSettings = ref({
  temperatureUnit: 'fahrenheit' as 'celsius' | 'fahrenheit',
  windUnit: 'mph' as 'ms' | 'kmh' | 'mph' | 'knots',
  pressureUnit: 'inhg' as 'hpa' | 'inhg' | 'mmhg',
});

// Chart state
const showChart = ref(false);
const currentMetricType = ref<MetricType | null>(null);
const chartData = ref<Array<{ timestamp: Date; value: number }>>([]);
const chartInfo = ref<{ title: string; icon: string; color: string }>({
  title: '',
  icon: '',
  color: '',
});
const chartUnit = ref('');
const currentChartValue = ref('');

// Computed properties for current weather
const loading = computed(() => weatherStore.loading);
const error = computed(() => weatherStore.error);
const hasStations = computed(() => weatherStore.hasStations);
const activeStations = computed(() => weatherStore.activeStations);

// Primary weather data (from first active station)
const primaryWeatherData = computed((): WeatherData | null => {
  if (!activeStations.value || activeStations.value.length === 0) return null;
  const firstStation = activeStations.value[0];
  const data = weatherStore.getStationData(firstStation.id);
  console.log('🌧️ Dashboard - Primary weather data:', data);
  if (data) {
    console.log('🌧️ Dashboard - Rainfall data:', {
      daily: data.rainfall,
      weekly: data.rainfallWeekly,
      monthly: data.rainfallMonthly,
      yearly: data.rainfallYearly,
    });
  }
  return data;
});

const primaryStationName = computed((): string => {
  if (!activeStations.value || activeStations.value.length === 0) return '';
  const firstStation = activeStations.value[0];
  const weatherData = weatherStore.getStationData(firstStation.id);
  return weatherData?.stationName || firstStation.name || 'Weather Station';
});

// Computed properties for unit labels
const temperatureUnit = computed(() => {
  return userSettings.value.temperatureUnit === 'celsius' ? '°C' : '°F';
});

const windSpeedUnit = computed(() => {
  switch (userSettings.value.windUnit) {
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
});

const pressureUnit = computed(() => {
  switch (userSettings.value.pressureUnit) {
    case 'hpa':
      return 'hPa';
    case 'inhg':
      return 'inHg';
    case 'mmhg':
      return 'mmHg';
    default:
      return 'inHg';
  }
});

// Chart time period based on metric type
const chartTimePeriod = computed(() => {
  if (currentMetricType.value === 'rainfall') {
    return 'This week';
  }
  return 'Last 24 hours';
});

// Auto-refresh interval
let refreshInterval: number | null = null;

onMounted(async () => {
  loadUserSettings();

  try {
    await refreshData();
  } catch (error) {
    console.error('Error loading weather data:', error);
  }

  try {
    await loadForecastData();
  } catch (error) {
    console.error('Error loading forecast data:', error);
  }

  try {
    await loadWeatherMap();
  } catch (error) {
    console.error('Error loading weather map:', error);
  }

  // Set up auto-refresh every 5 minutes
  refreshInterval = window.setInterval(
    async () => {
      try {
        await refreshAllData();
      } catch (error) {
        console.error('Error during auto-refresh:', error);
      }
    },
    5 * 60 * 1000
  );
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Methods
function loadUserSettings() {
  try {
    const savedSettings = localStorage.getItem('myweather-app-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      userSettings.value = {
        temperatureUnit: parsed.temperatureUnit || 'fahrenheit',
        windUnit: parsed.windUnit || 'mph',
        pressureUnit: parsed.pressureUnit || 'inhg',
      };
    }
  } catch (error) {
    console.warn('Could not load user settings:', error);
  }
}

async function refreshData() {
  await weatherStore.loadStations();
  if (weatherStore.hasStations) {
    await weatherStore.fetchAllStationsData();
  }
}

async function refreshAllData() {
  await weatherStore.fetchAllStationsData();
}

function getWeatherCondition(weatherData: WeatherData): string {
  if (!weatherData) return 'Unknown';

  // Simple condition logic based on weather data
  if (weatherData.rainfall > 0.1) {
    return 'Rainy';
  } else if (weatherData.windSpeed > 15) {
    return 'Windy';
  } else if (weatherData.humidity > 80) {
    return 'Humid';
  } else if (weatherData.temperature > 80) {
    return 'Hot';
  } else if (weatherData.temperature < 40) {
    return 'Cold';
  } else {
    return 'Fair';
  }
}

function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function formatMonthDate(dateString: string): string {
  // Show the date as provided by the forecast data
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getUTCDate();
  console.log('formatMonthdate dateString: ', dateString);
  console.log('formatMonthDate month/day: ', month + '/' + day)
  return `${month} ${day}`;
}

function convertForecastTemp(tempF: number): number {
  // National Weather Service always returns Fahrenheit
  // Convert to Celsius if user prefers Celsius
  if (userSettings.value.temperatureUnit === 'celsius') {
    return Math.round(((tempF - 32) * 5) / 9);
  }
  return Math.round(tempF);
}

function getWindDirection(degrees: number): string {
  // Convert wind direction degrees to compass direction
  if (degrees < 0 || degrees > 360) return 'N/A';

  const directions = [
    'North',
    'North-Northeast',
    'Northeast',
    'East-Northeast',
    'East',
    'East-Southeast',
    'Southeast',
    'South-Southeast',
    'South',
    'South-Southwest',
    'Southwest',
    'West-Southwest',
    'West',
    'West-Northwest',
    'Northwest',
    'North-Northwest',
  ];

  // Each direction covers 22.5 degrees (360 / 16)
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function getWindDescription(): string {
  if (!primaryWeatherData.value) return 'No wind data';

  const speed = primaryWeatherData.value.windSpeed.toFixed(1);
  const direction = getWindDirection(
    primaryWeatherData.value.windDirection || 0
  );
  const unit = windSpeedUnit.value;

  // Handle calm winds
  if (primaryWeatherData.value.windSpeed < 0.5) {
    return 'Calm';
  }

  return `${speed} ${unit} (${direction.toLowerCase()})`;
}

// Get location name from coordinates using reverse geocoding
async function getLocationName(lat: number, lon: number): Promise<string> {
  try {
    // Use a free reverse geocoding service to get location name
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );

    if (response.ok) {
      const data = await response.json();
      // Try to get city and state, fallback to locality or administrative area
      const city = data.city || data.locality || data.principalSubdivision;
      const state = data.principalSubdivisionCode || data.principalSubdivision;

      if (city && state) {
        return `${city}, ${state}`;
      } else if (city) {
        return city;
      } else if (data.locality) {
        return data.locality;
      }
    }
  } catch (error) {
    console.warn('Could not get location name:', error);
  }

  // Fallback to coordinates
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

// Forecast data loading
async function loadForecastData() {
  try {
    forecastLoading.value = true;
    forecastError.value = null;

    console.log('🌦️ Loading forecast data...');

    // Try to get user's current location first
    let location;
    try {
      location = await forecastService.getCurrentLocation();
      console.log('📍 Using current location:', location);
    } catch (locationError) {
      console.warn(
        '⚠️ Could not get current location, using fallback:',
        locationError
      );
      location = await forecastService.getLocationFromWeatherStation();
      if (!location) {
        throw new Error('Unable to determine location for forecast');
      }
      console.log('📍 Using fallback location:', location);
    }

    // Fetch forecast data
    const forecast = await forecastService.getForecast(
      location.latitude,
      location.longitude
    );
    // Map day names: Today, Tomorrow, then weekday names, and ensure dates are sequential from today
    // Use local time for date calculations
    // Use local time for date calculations, ensure correct local date by setting time to noon
    // Use local time for date calculations, ensure correct local date for Today tile
    const now = new Date();
    //now.setHours(12, 0, 0, 0); // Avoid timezone offset issues
    forecastData.value = forecast.map((day, idx) => {
      // Calculate the correct local date for each tile
      
      const dateObj = new Date(now.getTime() + idx * 24 * 60 * 60 * 1000);
      let dayName = '';
      if (idx === 0) {
        dayName = 'Today';
      } else if (idx === 1) {
        dayName = 'Tomorrow';
      } else {
        dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      }
      // Format date as YYYY-MM-DD for consistency with forecast API
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dayNum = String(dateObj.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${dayNum}`;
      console.log('formattedDate in 7-day Forecast: ', formattedDate);
      return { ...day, dayName, date: formattedDate };
    });

    // Get and store the location name for display
    const locationName = await getLocationName(
      location.latitude,
      location.longitude
    );
    forecastLocation.value = locationName;

    console.log(
      '✅ Forecast loaded successfully:',
      forecast.length,
      'days',
      'for',
      locationName
    );
    forecastLoading.value = false;
  } catch (error) {
    console.error('❌ Error loading forecast data:', error);
    forecastError.value =
      error instanceof Error ? error.message : 'Failed to load forecast data';
    forecastLoading.value = false;
  }
}

// Weather map loading with embedded iframe approach
async function loadWeatherMap() {
  try {
    mapLoading.value = true;
    mapError.value = null;

    console.log('🗺️ Loading weather map...');

    // Try to get user's current location first
    let location;
    try {
      location = await forecastService.getCurrentLocation();
    } catch (locationError) {
      console.warn('⚠️ Could not get current location for map, using fallback');
      location = await forecastService.getLocationFromWeatherStation();
      if (!location) {
        // Use default location (Nashville, TN area)
        location = { latitude: 36.1627, longitude: -86.7816 };
      }
    }

    // Use an embedded weather radar that works reliably
    const radarSite = getNearestRadarSite(
      location.latitude,
      location.longitude
    );

    // Use the working CONUS radar that covers the entire continental US
    // This provides a reliable weather map showing regional patterns
    weatherMapUrl.value = `https://radar.weather.gov/ridge/standard/CONUS-LARGE_loop.gif?${Date.now()}`;

    console.log(
      '✅ Weather map loaded with CONUS radar for location:',
      location
    );
    mapLoading.value = false;
  } catch (error) {
    console.error('❌ Error loading weather map:', error);
    mapError.value =
      error instanceof Error ? error.message : 'Failed to load weather map';
    mapLoading.value = false;
  }
}

// Map event handlers
function handleMapError() {
  console.error('❌ Weather radar image failed to load');
  mapError.value = 'Weather radar image could not be loaded';
  // Clear the current URL to show fallback options
  weatherMapUrl.value = null;
}

function handleMapLoad() {
  console.log('✅ Weather radar image loaded successfully');
  // Clear any previous errors
  mapError.value = null;
}

// Refresh weather map
async function refreshWeatherMap() {
  await loadWeatherMap();
}

// Helper function to find nearest NOAA radar site
function getNearestRadarSite(lat: number, lon: number): string {
  // Comprehensive database of NOAA radar sites covering the US
  // Each radar covers approximately 460 miles diameter (230 mile radius)
  const radarSites: {
    [key: string]: { lat: number; lon: number; code: string };
  } = {
    // Southeast Region
    KOHX: { lat: 36.25, lon: -86.56, code: 'OHX' }, // Nashville, TN
    KBMX: { lat: 33.17, lon: -86.77, code: 'BMX' }, // Birmingham, AL
    KGWX: { lat: 33.9, lon: -88.33, code: 'GWX' }, // Columbus, MS
    KMRX: { lat: 36.17, lon: -83.4, code: 'MRX' }, // Knoxville, TN
    KNQA: { lat: 35.34, lon: -89.87, code: 'NQA' }, // Memphis, TN
    KPAH: { lat: 37.07, lon: -88.77, code: 'PAH' }, // Paducah, KY
    KHTX: { lat: 34.93, lon: -86.08, code: 'HTX' }, // Huntsville, AL
    KEOX: { lat: 31.46, lon: -85.46, code: 'EOX' }, // Fort Rucker, AL
    KTLH: { lat: 30.4, lon: -84.33, code: 'TLH' }, // Tallahassee, FL
    KTBW: { lat: 27.71, lon: -82.4, code: 'TBW' }, // Tampa, FL
    KMLB: { lat: 28.11, lon: -80.65, code: 'MLB' }, // Melbourne, FL
    KAMX: { lat: 25.61, lon: -80.41, code: 'AMX' }, // Miami, FL
    KJAX: { lat: 30.48, lon: -81.7, code: 'JAX' }, // Jacksonville, FL

    // Northeast Region
    KOKX: { lat: 40.87, lon: -72.86, code: 'OKX' }, // New York, NY
    KBOX: { lat: 41.96, lon: -71.14, code: 'BOX' }, // Boston, MA
    KBGM: { lat: 42.2, lon: -75.98, code: 'BGM' }, // Binghamton, NY
    KBUF: { lat: 42.95, lon: -78.74, code: 'BUF' }, // Buffalo, NY
    KCXX: { lat: 44.51, lon: -73.17, code: 'CXX' }, // Burlington, VT
    KENX: { lat: 42.59, lon: -74.06, code: 'ENX' }, // Albany, NY

    // Midwest Region
    KILX: { lat: 40.15, lon: -89.34, code: 'ILX' }, // Lincoln, IL
    KIWX: { lat: 41.36, lon: -85.7, code: 'IWX' }, // North Webster, IN
    KLOT: { lat: 41.6, lon: -88.08, code: 'LOT' }, // Chicago, IL
    KMKX: { lat: 42.97, lon: -88.55, code: 'MKX' }, // Milwaukee, WI
    KDTX: { lat: 42.7, lon: -83.47, code: 'DTX' }, // Detroit, MI
    KGRR: { lat: 42.89, lon: -85.54, code: 'GRR' }, // Grand Rapids, MI

    // Texas Region
    KFWS: { lat: 32.57, lon: -97.3, code: 'FWS' }, // Dallas/Fort Worth, TX
    KEWX: { lat: 29.7, lon: -98.03, code: 'EWX' }, // Austin/San Antonio, TX
    KHGX: { lat: 29.47, lon: -95.08, code: 'HGX' }, // Houston, TX
    KCRP: { lat: 27.78, lon: -97.51, code: 'CRP' }, // Corpus Christi, TX
    KBRO: { lat: 25.92, lon: -97.42, code: 'BRO' }, // Brownsville, TX
    KEPZ: { lat: 31.87, lon: -106.7, code: 'EPZ' }, // El Paso, TX

    // West Region
    KPHX: { lat: 33.45, lon: -112.07, code: 'PHX' }, // Phoenix, AZ
    KYUX: { lat: 32.5, lon: -114.66, code: 'YUX' }, // Yuma, AZ
    KEMX: { lat: 31.89, lon: -110.63, code: 'EMX' }, // Tucson, AZ
    KNKX: { lat: 32.92, lon: -117.04, code: 'NKX' }, // San Diego, CA
    KSOX: { lat: 33.82, lon: -117.64, code: 'SOX' }, // Santa Ana Mountains, CA
    KVTX: { lat: 34.41, lon: -119.18, code: 'VTX' }, // Los Angeles, CA
    KHNX: { lat: 36.31, lon: -119.63, code: 'HNX' }, // San Joaquin Valley, CA
    KMUX: { lat: 37.16, lon: -121.9, code: 'MUX' }, // San Francisco, CA

    // Pacific Northwest
    KATX: { lat: 48.19, lon: -122.5, code: 'ATX' }, // Seattle, WA
    KRTX: { lat: 45.71, lon: -122.97, code: 'RTX' }, // Portland, OR
    KPDT: { lat: 45.69, lon: -118.85, code: 'PDT' }, // Pendleton, OR

    // Great Plains
    KOAX: { lat: 41.32, lon: -96.37, code: 'OAX' }, // Omaha, NE
    KUEX: { lat: 40.32, lon: -98.44, code: 'UEX' }, // Hastings, NE
    KGLD: { lat: 39.37, lon: -101.7, code: 'GLD' }, // Goodland, KS
    KICT: { lat: 37.65, lon: -97.44, code: 'ICT' }, // Wichita, KS
    KINX: { lat: 36.18, lon: -95.56, code: 'INX' }, // Tulsa, OK
    KTLX: { lat: 35.33, lon: -97.28, code: 'TLX' }, // Oklahoma City, OK
  };

  let nearest = 'OHX'; // Default to Nashville
  let minDistance = Infinity;

  for (const [id, site] of Object.entries(radarSites)) {
    const distance = Math.sqrt(
      Math.pow(lat - site.lat, 2) + Math.pow(lon - site.lon, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = site.code;
    }
  }

  return nearest;
}

// Chart Methods
async function showMetricChart(metricType: MetricType) {
  try {
    if (!primaryWeatherData.value) return;

    // Get the primary station details for API credentials
    const primaryStation = activeStations.value?.[0];
    if (!primaryStation) {
      console.warn('No primary station found for historical data');
      return;
    }

    currentMetricType.value = metricType;
    chartInfo.value = historicalDataService.getMetricInfo(metricType);
    chartUnit.value = historicalDataService.getDisplayUnit(
      metricType,
      userSettings.value
    );

    // Get current value for display
    switch (metricType) {
      case 'temperature':
        currentChartValue.value =
          primaryWeatherData.value.temperature.toFixed(0);
        break;
      case 'humidity':
        currentChartValue.value = primaryWeatherData.value.humidity.toFixed(0);
        break;
      case 'windSpeed':
        currentChartValue.value = primaryWeatherData.value.windSpeed.toFixed(1);
        break;
      case 'pressure':
        currentChartValue.value = primaryWeatherData.value.pressure.toFixed(2);
        break;
      case 'rainfall':
        currentChartValue.value = primaryWeatherData.value.rainfall.toFixed(2);
        break;
      default:
        currentChartValue.value = '0';
    }

    // Try to get real historical data from Ecowitt API
    console.log('🔄 Attempting to load real historical data...');
    let historicalData = await historicalDataService.getHistoricalData(
      primaryStation.macAddress,
      primaryStation.apiKey,
      primaryStation.applicationKey,
      metricType,
      userSettings.value
    );

    // If real data is empty or failed, fall back to generated data
    if (historicalData.length === 0) {
      console.log(
        '📊 No real historical data available, generating mock data...'
      );
      historicalData = historicalDataService.generateHistoricalData(
        primaryWeatherData.value,
        metricType,
        userSettings.value
      );
    } else {
      console.log(
        '✅ Successfully loaded real historical data:',
        historicalData.length,
        'points'
      );
    }

    chartData.value = historicalData;
    showChart.value = true;
  } catch (error) {
    console.error('Error showing metric chart:', error);
    // Reset chart state on error
    showChart.value = false;
    currentMetricType.value = null;
    chartData.value = [];
  }
}

function closeChart() {
  showChart.value = false;
  currentMetricType.value = null;
  chartData.value = [];
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Section Headers */
.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h1 {
  font-size: 3rem;
  margin: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-header h2 {
  font-size: 2.5rem;
  margin: 0;
  color: var(--primary-color);
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--text-color);
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
}

/* Current Weather Section */
.current-weather-section {
  background: linear-gradient(
    135deg,
    rgba(135, 206, 235, 0.1),
    rgba(255, 255, 255, 0.9)
  );
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--shadow-color);
}

.main-weather-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px var(--shadow-color);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  position: relative;
}

.main-weather-card.clickable {
  cursor: pointer;
  border: 1px solid rgba(74, 144, 226, 0.1);
}

.main-weather-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(74, 144, 226, 0.2);
  border-color: rgba(74, 144, 226, 0.3);
}

.primary-weather {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.temperature-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  position: relative;
}

.temperature {
  font-size: 4rem;
  font-weight: 700;
  color: var(--primary-color);
}

.temperature-unit {
  font-size: 2rem;
  color: var(--text-color);
  opacity: 0.7;
}

.weather-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.conditions {
  font-size: 1.2rem;
  color: var(--secondary-color);
  margin: 0.5rem 0;
  font-weight: 600;
}

.feels-like {
  font-size: 1rem;
  color: var(--text-color);
  margin: 0.5rem 0;
}

.last-updated {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  margin: 1rem 0 0 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Weather Metrics Grid */
.weather-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 10px var(--shadow-color);
  transition: transform 0.2s ease;
  position: relative;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-card.clickable {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(74, 144, 226, 0.1);
}

.metric-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(74, 144, 226, 0.2);
  border-color: rgba(74, 144, 226, 0.3);
}

.chart-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.8rem;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.temperature-display .chart-indicator {
  top: 0;
  right: -20px;
  font-size: 1rem;
}

.metric-card.clickable:hover .chart-indicator,
.main-weather-card.clickable:hover .chart-indicator {
  opacity: 1;
}

.chart-container {
  margin-top: 2rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Forecast Section */
.forecast-section {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.1),
    rgba(255, 255, 255, 0.9)
  );
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--shadow-color);
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.forecast-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px var(--shadow-color);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.forecast-card:hover {
  transform: translateY(-2px);
}

.day-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.month-date {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.6;
  margin-bottom: 0.5rem;
  font-weight: 400;
}

.weather-icon {
  font-size: 2.5rem;
  margin: 0.5rem 0;
}

.condition {
  font-size: 0.9rem;
  color: var(--secondary-color);
  margin: 0.5rem 0;
}

.temperatures {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 1rem;
}

.high {
  font-weight: 700;
  color: var(--sunset-orange);
}

.low {
  color: var(--text-color);
  opacity: 0.7;
}

/* Weather Map Section */
.weather-map-section {
  background: linear-gradient(
    135deg,
    rgba(74, 144, 226, 0.1),
    rgba(255, 255, 255, 0.9)
  );
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--shadow-color);
}

.weather-map-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.map-header {
  padding: 1.5rem;
  text-align: center;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
}

.map-header h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.map-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.radar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  min-height: 600px;
  position: relative;
}

.weather-radar-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.weather-map-frame {
  width: 100%;
  height: 500px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.map-footer {
  padding: 1rem 1.5rem;
  background: rgba(248, 249, 250, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.map-source {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

.weather-map-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.interactive-map-fallback {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-color);
  text-align: center;
  padding: 2rem;
}

.interactive-map-fallback .map-header {
  background: none;
  color: var(--text-color);
  padding: 0 0 1.5rem 0;
}

.interactive-map-fallback .map-header h4 {
  color: var(--primary-color);
  font-size: 1.5rem;
}

.map-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 1.5rem 0;
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  margin-top: 1rem;
}

.btn-outline:hover {
  background: var(--primary-color);
  color: white;
}

/* Common States */
.loading-container,
.error-container,
.no-stations-container,
.coming-soon {
  text-align: center;
  padding: 3rem 2rem;
}

.loading {
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #ffe6e6;
  color: #d63031;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.no-stations-message h2,
.coming-soon h3 {
  color: var(--text-color);
  margin: 1rem 0;
}

.coming-soon .weather-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 0.5rem;
    gap: 1.5rem;
  }

  .section-header h1 {
    font-size: 2.5rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .current-weather-section,
  .forecast-section,
  .weather-map-section {
    padding: 1.5rem;
  }

  .primary-weather {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .temperature {
    font-size: 3rem;
  }

  .weather-metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .forecast-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .weather-map-container {
    height: auto;
  }

  .radar-container {
    min-height: 400px;
  }

  .weather-map-frame {
    height: 400px;
  }

  .map-footer {
    flex-direction: column;
    text-align: center;
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .section-header h1 {
    font-size: 2rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .weather-metrics-grid {
    grid-template-columns: 1fr;
  }

  .forecast-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Rainfall card specific styles */
.rainfall-card .metric-info {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.rainfall-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
  width: 100%;
}

.rainfall-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  background: rgba(74, 144, 226, 0.05);
  border-radius: 8px;
  min-width: 0;
  border: 1px solid rgba(74, 144, 226, 0.1);
}

.rainfall-period {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
  font-weight: 500;
  margin-bottom: 2px;
}

.rainfall-amount {
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .rainfall-values {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .rainfall-item {
    padding: 3px;
  }

  .rainfall-period {
    font-size: 0.7rem;
  }

  .rainfall-amount {
    font-size: 0.75rem;
  }
}
</style>
