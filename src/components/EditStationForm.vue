<template>
  <div class="edit-station-form">
    <div class="form-header">
      <h2>✏️ Edit Weather Station</h2>
      <button @click="$emit('close')" class="close-btn">
        <span class="weather-emoji">❌</span>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="station-form">
      <div class="form-group">
        <label for="name" class="form-label">
          <span class="weather-emoji">🏷️</span>
          Station Name *
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-input"
          placeholder="e.g., Backyard Weather Station"
          required
        />
      </div>

      <div class="form-group">
        <label for="macAddress" class="form-label">
          <span class="weather-emoji">🔢</span>
          MAC Address *
        </label>
        <input
          id="macAddress"
          v-model="form.macAddress"
          type="text"
          class="form-input"
          placeholder="e.g., A4:CF:12:FE:DC:BA"
          pattern="[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}"
          required
        />
      </div>

      <div class="form-group">
        <label for="apiKey" class="form-label">
          <span class="weather-emoji">🔑</span>
          API Key *
        </label>
        <input
          id="apiKey"
          v-model="form.apiKey"
          type="password"
          class="form-input"
          placeholder="Your Ecowitt API Key"
          required
        />
      </div>

      <div class="form-group">
        <label for="applicationKey" class="form-label">
          <span class="weather-emoji">🎫</span>
          Application Key *
        </label>
        <input
          id="applicationKey"
          v-model="form.applicationKey"
          type="password"
          class="form-input"
          placeholder="Your Ecowitt Application Key"
          required
        />
      </div>

      <div class="form-group">
        <label for="location" class="form-label">
          <span class="weather-emoji">📍</span>
          Location
        </label>
        <input
          id="location"
          v-model="form.location"
          type="text"
          class="form-input"
          placeholder="e.g., Backyard, Garden, Rooftop"
        />
      </div>

      <div class="form-group">
        <label for="description" class="form-label">
          <span class="weather-emoji">📝</span>
          Description
        </label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-input"
          placeholder="Optional description of this weather station"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            v-model="form.isActive"
            type="checkbox"
            class="checkbox-input"
          />
          <span class="weather-emoji">{{ form.isActive ? '🟢' : '🔴' }}</span>
          Station is active
        </label>
      </div>

      <div v-if="error" class="error-message">
        <span class="weather-emoji">⚠️</span>
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="btn btn-secondary">
          <span class="weather-emoji">❌</span>
          Cancel
        </button>
        <button
          type="button"
          @click="testConnection"
          class="btn btn-secondary"
          :disabled="loading || !canTest"
        >
          <span class="weather-emoji">🧪</span>
          Test Connection
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span class="weather-emoji">💾</span>
          {{ loading ? 'Updating...' : 'Update Station' }}
        </button>
      </div>
    </form>

    <div
      v-if="testResult"
      class="test-result"
      :class="{ success: testResult.success, error: !testResult.success }"
    >
      <span class="weather-emoji">{{ testResult.success ? '✅' : '❌' }}</span>
      {{ testResult.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWeatherStore } from '../stores/weather';
import { ecowittApi } from '../services/ecowitt';
import type { WeatherStation } from '../types/weather';

interface Props {
  station: WeatherStation;
}

interface Emits {
  (e: 'close'): void;
  (e: 'updated'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const weatherStore = useWeatherStore();

// Form state
const form = ref({
  name: '',
  macAddress: '',
  apiKey: '',
  applicationKey: '',
  location: '',
  description: '',
  isActive: true,
});

const loading = ref(false);
const error = ref<string | null>(null);
const testResult = ref<{ success: boolean; message: string } | null>(null);

// Initialize form with station data
onMounted(() => {
  form.value = {
    name: props.station.name,
    macAddress: props.station.macAddress,
    apiKey: props.station.apiKey,
    applicationKey: props.station.applicationKey,
    location: props.station.location || '',
    description: props.station.description || '',
    isActive: props.station.isActive,
  };
});

// Computed properties
const canTest = computed(() => {
  return (
    form.value.macAddress && form.value.apiKey && form.value.applicationKey
  );
});

// Methods
async function testConnection() {
  if (!canTest.value) return;

  loading.value = true;
  error.value = null;
  testResult.value = null;

  try {
    const isValid = await ecowittApi.validateApiCredentials(
      form.value.macAddress,
      form.value.apiKey,
      form.value.applicationKey
    );

    if (isValid) {
      testResult.value = {
        success: true,
        message: 'Connection successful! Weather data retrieved successfully.',
      };
    } else {
      testResult.value = {
        success: false,
        message:
          'Connection failed. Please check your credentials and try again.',
      };
    }
  } catch (err) {
    testResult.value = {
      success: false,
      message: err instanceof Error ? err.message : 'Connection test failed',
    };
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (
    !form.value.name ||
    !form.value.macAddress ||
    !form.value.apiKey ||
    !form.value.applicationKey
  ) {
    error.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await weatherStore.updateStation(props.station.id, {
      name: form.value.name,
      macAddress: form.value.macAddress,
      apiKey: form.value.apiKey,
      applicationKey: form.value.applicationKey,
      location: form.value.location || undefined,
      description: form.value.description || undefined,
      isActive: form.value.isActive,
    });

    emit('updated');
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to update station';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.edit-station-form {
  max-width: 500px;
  width: 100%;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}

.form-header h2 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.station-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
  cursor: pointer;
}

.checkbox-input {
  margin: 0;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background: white;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  background: #ffe6e6;
  color: #d63031;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.form-actions .btn {
  min-width: 120px;
}

.test-result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.test-result.success {
  background: #e8f5e8;
  color: #2d7a2d;
  border: 1px solid #4caf50;
}

.test-result.error {
  background: #ffe6e6;
  color: #d63031;
  border: 1px solid #f44336;
}

@media (max-width: 480px) {
  .form-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>
