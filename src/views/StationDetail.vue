<template>
  <div class="station-detail-container">
    <div v-if="loading" class="loading-container">
      <div class="loading"></div>
      <p>Loading station details...</p>
    </div>

    <div v-else-if="!station" class="error-container">
      <div class="error-message">
        <span class="weather-emoji">❌</span>
        Station not found
      </div>
      <router-link to="/stations" class="btn btn-primary">
        <span class="weather-emoji">🔙</span>
        Back to Stations
      </router-link>
    </div>

    <div v-else class="station-detail">
      <!-- Station Header -->
      <div class="station-header">
        <div class="header-content">
          <div class="station-info">
            <h1>{{ station.name }}</h1>
            <p v-if="station.location" class="station-location">
              <span class="weather-emoji">📍</span>
              {{ station.location }}
            </p>
            <p class="station-mac">
              <span class="weather-emoji">🏷️</span>
              {{ station.macAddress }}
            </p>
          </div>
          <div class="station-status">
            <span
              class="status-badge"
              :class="{ active: station.isActive, inactive: !station.isActive }"
            >
              {{ station.isActive ? '🟢 Active' : '🔴 Inactive' }}
            </span>
          </div>
        </div>

        <div class="header-actions">
          <button
            @click="refreshData"
            class="btn btn-secondary"
            :disabled="refreshing"
          >
            <span class="weather-emoji">🔄</span>
            {{ refreshing ? 'Refreshing...' : 'Refresh Data' }}
          </button>
          <router-link to="/stations" class="btn btn-primary">
            <span class="weather-emoji">🔙</span>
            Back to Stations
          </router-link>
        </div>
      </div>

      <!-- Station Description -->
      <div v-if="station.description" class="station-description">
        <h3>📝 Description</h3>
        <p>{{ station.description }}</p>
      </div>

      <!-- Current Weather Data -->
      <div v-if="currentWeather" class="current-weather">
        <h2>🌤️ Current Weather</h2>
        <div class="weather-grid">
          <div class="weather-metric primary">
            <div class="metric-icon">🌡️</div>
            <div class="metric-content">
              <div class="metric-value">
                {{ currentWeather.temperature.toFixed(1) }}°C
              </div>
              <div class="metric-label">Temperature</div>
              <div v-if="currentWeather.feelsLike" class="metric-detail">
                Feels like {{ currentWeather.feelsLike.toFixed(1) }}°C
              </div>
            </div>
          </div>

          <div class="weather-metric primary">
            <div class="metric-icon">💧</div>
            <div class="metric-content">
              <div class="metric-value">
                {{ currentWeather.humidity.toFixed(0) }}%
              </div>
              <div class="metric-label">Humidity</div>
              <div v-if="currentWeather.dewPoint" class="metric-detail">
                Dew point {{ currentWeather.dewPoint.toFixed(1) }}°C
              </div>
            </div>
          </div>

          <div class="weather-metric">
            <div class="metric-icon">🌬️</div>
            <div class="metric-content">
              <div class="metric-value">
                {{ currentWeather.windSpeed.toFixed(1) }} m/s
              </div>
              <div class="metric-label">Wind Speed</div>
              <div class="metric-detail">
                {{ getWindDirection(currentWeather.windDirection) }} ({{
                  currentWeather.windDirection
                }}°)
              </div>
            </div>
          </div>

          <div class="weather-metric">
            <div class="metric-icon">💨</div>
            <div class="metric-content">
              <div class="metric-value">
                {{ currentWeather.windGust.toFixed(1) }} m/s
              </div>
              <div class="metric-label">Wind Gust</div>
            </div>
          </div>

          <div class="weather-metric">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">
                {{ currentWeather.pressure.toFixed(0) }} Hg
              </div>
              <div class="metric-label">Pressure</div>
            </div>
          </div>

          <div class="weather-metric">
            <div class="metric-icon">🌧️</div>
            <div class="metric-content">
              <div class="metric-value">
                {{ currentWeather.rainfall.toFixed(1) }} mm
              </div>
              <div class="metric-label">Daily Rainfall</div>
            </div>
          </div>

          <div
            v-if="currentWeather.solarRadiation !== undefined"
            class="weather-metric"
          >
            <div class="metric-icon">☀️</div>
            <div class="metric-content">
              <div class="metric-value">
                {{ currentWeather.solarRadiation.toFixed(0) }} W/m²
              </div>
              <div class="metric-label">Solar Radiation</div>
            </div>
          </div>

          <div
            v-if="currentWeather.uvIndex !== undefined"
            class="weather-metric"
          >
            <div class="metric-icon">🌞</div>
            <div class="metric-content">
              <div class="metric-value">
                {{ currentWeather.uvIndex.toFixed(1) }}
              </div>
              <div class="metric-label">UV Index</div>
              <div class="metric-detail">
                {{ getUvDescription(currentWeather.uvIndex) }}
              </div>
            </div>
          </div>

          <div
            v-if="currentWeather.batteryLevel !== undefined"
            class="weather-metric"
          >
            <div class="metric-icon">🔋</div>
            <div class="metric-content">
              <div class="metric-value">
                {{ currentWeather.batteryLevel.toFixed(0) }}%
              </div>
              <div class="metric-label">Battery Level</div>
            </div>
          </div>
        </div>

        <div class="last-updated">
          <span class="weather-emoji">🕒</span>
          Last updated {{ formatRelativeTime(currentWeather.timestamp) }}
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="no-weather-data">
        <span class="weather-icon">📊</span>
        <h3>No Weather Data Available</h3>
        <p>No recent weather data found for this station.</p>
        <button @click="refreshData" class="btn btn-primary">
          <span class="weather-emoji">🔄</span>
          Fetch Weather Data
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useWeatherStore } from '../stores/weather';

const route = useRoute();
const weatherStore = useWeatherStore();

const loading = ref(true);
const refreshing = ref(false);

const stationId = computed(() => route.params.id as string);
const station = computed(() =>
  weatherStore.stations.find((s) => s.id === stationId.value)
);
const currentWeather = computed(() =>
  weatherStore.getStationData(stationId.value)
);

onMounted(async () => {
  try {
    // Load stations if not already loaded
    if (weatherStore.stations.length === 0) {
      await weatherStore.loadStations();
    }

    // Fetch current weather data
    if (station.value) {
      await weatherStore.fetchWeatherData(stationId.value);
    }
  } catch (error) {
    console.error('Error loading station details:', error);
  } finally {
    loading.value = false;
  }
});

async function refreshData() {
  if (!station.value) return;

  refreshing.value = true;
  try {
    await weatherStore.fetchWeatherData(stationId.value);
  } catch (error) {
    console.error('Error refreshing weather data:', error);
  } finally {
    refreshing.value = false;
  }
}

function getWindDirection(degrees: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function getUvDescription(uvIndex: number): string {
  if (uvIndex < 3) return 'Low';
  if (uvIndex < 6) return 'Moderate';
  if (uvIndex < 8) return 'High';
  if (uvIndex < 11) return 'Very High';
  return 'Extreme';
}

function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}
</script>

<style scoped>
.station-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
}

.error-message {
  background: #ffe6e6;
  color: #d63031;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.station-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.station-info h1 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 2rem;
}

.station-location,
.station-mac {
  margin: 0.25rem 0;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2d7a2d;
}

.status-badge.inactive {
  background: #f5f5f5;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.station-description {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.station-description h3 {
  margin: 0 0 1rem 0;
  color: var(--primary-color);
}

.current-weather {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.current-weather h2 {
  margin: 0 0 1.5rem 0;
  color: var(--primary-color);
  text-align: center;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.weather-metric {
  background: rgba(74, 144, 226, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.3s ease;
}

.weather-metric.primary {
  background: linear-gradient(
    135deg,
    rgba(74, 144, 226, 0.1),
    rgba(135, 206, 235, 0.1)
  );
  border: 2px solid rgba(74, 144, 226, 0.2);
}

.weather-metric:hover {
  transform: translateY(-2px);
}

.metric-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.metric-detail {
  font-size: 0.8rem;
  color: #666;
}

.last-updated {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color);
  padding: 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.no-weather-data {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.no-weather-data .weather-icon {
  font-size: 4rem;
  opacity: 0.5;
  display: block;
  margin-bottom: 1rem;
}

.no-weather-data h3 {
  color: var(--text-color);
  margin: 1rem 0;
}

@media (max-width: 768px) {
  .station-detail-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    justify-content: center;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }

  .station-info h1 {
    font-size: 1.5rem;
  }
}
</style>
