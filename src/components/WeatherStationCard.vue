<template>
  <div class="weather-station-card">
    <div class="station-header">
      <div class="station-info">
        <h3>{{ displayStationName }}</h3>
        <p v-if="weatherData?.stationName && weatherData.stationName !== station.name" class="api-station-name">
          <span class="weather-emoji">🏷️</span>
          Device: {{ weatherData.stationName }}
        </p>
        <p v-if="station.location" class="station-location">
          <span class="weather-emoji">📍</span>
          {{ station.location }}
        </p>
      </div>
      <div class="station-status">
        <span
          class="status-indicator"
          :class="{ online: isOnline, offline: !isOnline }"
        >
          {{ isOnline ? '🟢' : '🔴' }}
        </span>
      </div>
    </div>

    <div v-if="weatherData" class="weather-data">
      <!-- Primary weather metrics -->
      <div class="primary-metrics">
        <div class="metric temperature">
          <span class="metric-icon">🌡️</span>
          <div class="metric-value">
            <span class="value">{{ weatherData.temperature.toFixed(1) }}</span>
            <span class="unit">°F</span>
          </div>
          <div class="metric-label">Temperature</div>
        </div>

        <div class="metric humidity">
          <span class="metric-icon">💧</span>
          <div class="metric-value">
            <span class="value">{{ weatherData.humidity.toFixed(0) }}</span>
            <span class="unit">%</span>
          </div>
          <div class="metric-label">Humidity</div>
        </div>
      </div>

      <!-- Secondary weather metrics -->
      <div class="secondary-metrics">
        <div class="metric-row">
          <span class="weather-emoji">🌬️</span>
          <span class="label">Wind:</span>
          <span class="value">{{ weatherData.windSpeed.toFixed(1) }} mph</span>
        </div>

        <div class="metric-row">
          <span class="weather-emoji">📊</span>
          <span class="label">Pressure:</span>
          <span class="value">{{ weatherData.pressure.toFixed(2) }} Hg</span>
        </div>
        
        <div class="metric-row">
          <span class="weather-emoji">🌧️</span>
          <span class="label">Rainfall:</span>
          <span class="value">{{ weatherData.rainfall.toFixed(2) }} in</span>
        </div>

        <div v-if="weatherData.uvIndex !== undefined" class="metric-row">
          <span class="weather-emoji">☀️</span>
          <span class="label">UV Index:</span>
          <span class="value">{{ weatherData.uvIndex.toFixed(0) }}</span>
        </div>

        <div v-if="weatherData.batteryLevel !== undefined" class="metric-row">
          <span class="weather-emoji">🔋</span>
          <span class="label">Battery:</span>
          <span class="value">{{ weatherData.batteryLevel.toFixed(0) }}%</span>
        </div>
      </div>

      <!-- Last updated -->
      <div class="last-updated">
        <span class="weather-emoji">🕒</span>
        Updated {{ formatRelativeTime(weatherData.timestamp) }}
      </div>
    </div>

    <div v-else class="no-data">
      <span class="weather-icon">📊</span>
      <p>No weather data available</p>
      <button @click="$emit('refresh')" class="btn btn-secondary">
        <span class="weather-emoji">🔄</span>
        Refresh Data
      </button>
    </div>

    <!-- Card actions -->
    <div class="card-actions">
      <button
        @click="$emit('refresh')"
        class="btn btn-secondary"
        :disabled="refreshing"
      >
        <span class="weather-emoji">🔄</span>
        Refresh
      </button>
      <router-link :to="`/stations/${station.id}`" class="btn btn-primary">
        <span class="weather-emoji">📊</span>
        Details
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { WeatherStation, WeatherData } from '../types/weather';

interface Props {
  station: WeatherStation;
  weatherData: WeatherData | null;
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const refreshing = ref(false);

// Computed properties
const isOnline = computed(() => {
  if (!props.weatherData) return false;

  // Consider online if data is less than 10 minutes old
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  return props.weatherData.timestamp > tenMinutesAgo;
});

const displayStationName = computed(() => {
  // Prefer the station name from API if available, otherwise use user-defined name
  return props.weatherData?.stationName || props.station.name;
});

// Helper functions
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
.weather-station-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.weather-station-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.station-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 1.25rem;
  font-weight: 600;
}

.station-location {
  margin: 0;
  color: var(--text-color);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.api-station-name {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 0.8rem;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.8;
}

.status-indicator {
  font-size: 1.2rem;
}

.status-indicator.online {
  filter: brightness(1.2);
}

.status-indicator.offline {
  filter: grayscale(0.5);
}

.primary-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric {
  text-align: center;
  padding: 1rem;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 12px;
}

.metric-icon {
  font-size: 1.8rem;
  display: block;
  margin-bottom: 0.5rem;
}

.metric-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.metric-value .value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

.metric-value .unit {
  font-size: 1rem;
  color: var(--text-color);
}

.metric-label {
  font-size: 0.8rem;
  color: var(--text-color);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.secondary-metrics {
  margin-bottom: 1.5rem;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.metric-row:last-child {
  border-bottom: none;
}

.metric-row .label {
  flex: 1;
  color: var(--text-color);
  font-weight: 500;
}

.metric-row .value {
  font-weight: 600;
  color: var(--primary-color);
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

.no-data {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-color);
}

.no-data .weather-icon {
  font-size: 3rem;
  opacity: 0.5;
  display: block;
  margin-bottom: 1rem;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.card-actions .btn {
  flex: 1;
  justify-content: center;
}

@media (max-width: 480px) {
  .primary-metrics {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-actions .btn {
    width: 100%;
  }
}
</style>
