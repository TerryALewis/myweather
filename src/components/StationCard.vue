<template>
  <div class="station-card">
    <div class="station-header">
      <div class="station-info">
        <h3>{{ station.name }}</h3>
        <p v-if="station.location" class="station-location">
          <span class="weather-emoji">📍</span>
          {{ station.location }}
        </p>
        <p class="station-mac">
          <span class="weather-emoji">🏷️</span>
          {{ station.macAddress }}
        </p>
      </div>
      <div class="station-controls">
        <button
          @click="$emit('toggle-active', station)"
          class="toggle-btn"
          :class="{ active: station.isActive }"
          :title="station.isActive ? 'Deactivate station' : 'Activate station'"
        >
          {{ station.isActive ? '🟢' : '🔴' }}
        </button>
      </div>
    </div>

    <div v-if="station.description" class="station-description">
      <p>{{ station.description }}</p>
    </div>

    <div class="station-status">
      <div class="status-item">
        <span class="weather-emoji">📊</span>
        <span class="label">Status:</span>
        <span
          class="value"
          :class="{ active: station.isActive, inactive: !station.isActive }"
        >
          {{ station.isActive ? 'Active' : 'Inactive' }}
        </span>
      </div>
      <div class="status-item">
        <span class="weather-emoji">📅</span>
        <span class="label">Added:</span>
        <span class="value">{{ formatDate(station.createdAt) }}</span>
      </div>
      <div class="status-item">
        <span class="weather-emoji">🔄</span>
        <span class="label">Updated:</span>
        <span class="value">{{ formatRelativeTime(station.updatedAt) }}</span>
      </div>
    </div>

    <div class="station-actions">
      <router-link :to="`/stations/${station.id}`" class="btn btn-primary">
        <span class="weather-emoji">📊</span>
        View Details
      </router-link>
      <button @click="$emit('edit', station)" class="btn btn-secondary">
        <span class="weather-emoji">✏️</span>
        Edit
      </button>
      <button @click="$emit('delete', station)" class="btn btn-danger">
        <span class="weather-emoji">🗑️</span>
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeatherStation } from '../types/weather';

interface Props {
  station: WeatherStation;
}

interface Emits {
  (e: 'edit', station: WeatherStation): void;
  (e: 'delete', station: WeatherStation): void;
  (e: 'toggle-active', station: WeatherStation): void;
}

defineProps<Props>();
defineEmits<Emits>();

// Helper functions
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
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
.station-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.station-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.station-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 1.25rem;
  font-weight: 600;
}

.station-location,
.station-mac {
  margin: 0.25rem 0;
  color: var(--text-color);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.station-controls {
  display: flex;
  align-items: center;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

.station-description {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(74, 144, 226, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.station-description p {
  margin: 0;
  color: var(--text-color);
  font-style: italic;
}

.station-status {
  margin-bottom: 1.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.status-item:last-child {
  border-bottom: none;
}

.status-item .label {
  flex: 1;
  color: var(--text-color);
  font-weight: 500;
}

.status-item .value {
  font-weight: 600;
  color: var(--primary-color);
}

.status-item .value.active {
  color: var(--grass-green);
}

.status-item .value.inactive {
  color: var(--storm-gray);
}

.station-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.station-actions .btn {
  flex: 1;
  min-width: 100px;
  justify-content: center;
  font-size: 0.9rem;
  padding: 8px 16px;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  justify-content: center;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .station-header {
    flex-direction: column;
    gap: 1rem;
  }

  .station-actions {
    flex-direction: column;
  }

  .station-actions .btn {
    width: 100%;
  }
}
</style>
