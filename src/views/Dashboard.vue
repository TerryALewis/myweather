<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>🌤️ Weather Dashboard</h1>
      <p class="dashboard-subtitle">
        Real-time data from your Ecowitt weather stations
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

    <div v-else class="dashboard-content">
      <!-- Weather Summary Cards -->
      <div class="weather-summary">
        <div
          class="summary-card"
          v-for="card in summaryCards"
          :key="card.title"
        >
          <div class="card-icon" :style="{ color: card.color }">
            {{ card.emoji }}
          </div>
          <div class="card-content">
            <h3>{{ card.title }}</h3>
            <p class="card-value">
              {{ card.value }} <span class="card-unit">{{ card.unit }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Active Stations -->
      <div class="stations-grid">
        <WeatherStationCard
          v-for="station in activeStations"
          :key="station.id"
          :station="station"
          :weather-data="getStationData(station.id)"
          @refresh="refreshStationData(station.id)"
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
          Refresh All Stations
        </button>
        <router-link to="/stations" class="btn btn-primary">
          <span class="weather-emoji">⚙️</span>
          Manage Stations
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useWeatherStore } from '../stores/weather';
import WeatherStationCard from '../components/WeatherStationCard.vue';
import type { WeatherCardData } from '../types/weather';

const weatherStore = useWeatherStore();

// Computed properties
const loading = computed(() => weatherStore.loading);
const error = computed(() => weatherStore.error);
const hasStations = computed(() => weatherStore.hasStations);
const activeStations = computed(() => weatherStore.activeStations);

// Auto-refresh interval
let refreshInterval: number | null = null;

onMounted(async () => {
  await refreshData();

  // Set up auto-refresh every 5 minutes
  refreshInterval = window.setInterval(
    () => {
      refreshAllData();
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
async function refreshData() {
  await weatherStore.loadStations();
  if (weatherStore.hasStations) {
    await weatherStore.fetchAllStationsData();
  }
}

async function refreshAllData() {
  await weatherStore.fetchAllStationsData();
}

async function refreshStationData(stationId: string) {
  await weatherStore.fetchWeatherData(stationId);
}

function getStationData(stationId: string) {
  return weatherStore.getStationData(stationId);
}

// Summary cards computation
const summaryCards = computed((): WeatherCardData[] => {
  if (!hasStations.value) return [];

  const allData = activeStations.value
    .map((station: any) => weatherStore.getStationData(station.id))
    .filter((data: any) => data !== null);

  if (allData.length === 0) return [];

  const avgTemp =
    allData.reduce((sum: number, data: any) => sum + data!.temperature, 0) /
    allData.length;
  const avgHumidity =
    allData.reduce((sum: number, data: any) => sum + data!.humidity, 0) /
    allData.length;
  const maxWindSpeed = Math.max(...allData.map((data: any) => data!.windSpeed));
  const totalRainfall = allData.reduce(
    (sum: number, data: any) => sum + data!.rainfall,
    0
  );

  return [
    {
      icon: '🌡️',
      title: 'Avg Temperature',
      value: avgTemp.toFixed(1),
      unit: '°F',
      color: 'var(--sunset-orange)',
      emoji: '🌡️',
    },
    {
      icon: '💧',
      title: 'Avg Humidity',
      value: avgHumidity.toFixed(0),
      unit: '%',
      color: 'var(--rain-blue)',
      emoji: '💧',
    },
    {
      icon: '💨',
      title: 'Max Wind Speed',
      value: maxWindSpeed.toFixed(1),
      unit: 'mph',
      color: 'var(--wind-silver)',
      emoji: '💨',
    },
    {
      icon: '🌧️',
      title: 'Total Rainfall',
      value: totalRainfall.toFixed(2),
      unit: 'in',
      color: 'var(--ocean-blue)',
      emoji: '🌧️',
    },
  ];
});
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
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

.dashboard-subtitle {
  font-size: 1.2rem;
  color: var(--text-color);
  margin: 1rem 0 0 0;
}

.loading-container,
.error-container,
.no-stations-container {
  text-align: center;
  padding: 4rem 2rem;
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

.no-stations-message h2 {
  color: var(--text-color);
  margin: 1rem 0;
}

.weather-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px var(--shadow-color);
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.card-unit {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-color);
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }

  .weather-summary {
    grid-template-columns: 1fr;
  }

  .stations-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
