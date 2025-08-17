<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>⚙️ Settings</h1>
      <p>Configure your MyWeather app preferences</p>
    </div>

    <div class="settings-content">
      <!-- API Configuration -->
      <div class="settings-section">
        <h2>🔑 API Configuration</h2>
        <p class="section-description">
          Default Ecowitt API credentials for new weather stations
        </p>

        <form @submit.prevent="saveApiSettings" class="settings-form">
          <div class="form-group">
            <label for="defaultApiKey" class="form-label">
              <span class="weather-emoji">🔑</span>
              Default API Key
            </label>
            <input
              id="defaultApiKey"
              v-model="apiSettings.defaultApiKey"
              type="password"
              class="form-input"
              placeholder="Your default Ecowitt API Key"
            />
            <small class="form-help">
              This will be pre-filled when adding new stations
            </small>
          </div>

          <div class="form-group">
            <label for="defaultApplicationKey" class="form-label">
              <span class="weather-emoji">🎫</span>
              Default Application Key
            </label>
            <input
              id="defaultApplicationKey"
              v-model="apiSettings.defaultApplicationKey"
              type="password"
              class="form-input"
              placeholder="Your default Ecowitt Application Key"
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span class="weather-emoji">💾</span>
            {{ loading ? 'Saving...' : 'Save API Settings' }}
          </button>
        </form>
      </div>

      <!-- App Preferences -->
      <div class="settings-section">
        <h2>🎨 App Preferences</h2>
        <p class="section-description">
          Customize how MyWeather looks and behaves
        </p>

        <form @submit.prevent="saveAppSettings" class="settings-form">
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="appSettings.autoRefresh"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="weather-emoji">🔄</span>
              Auto-refresh weather data every 5 minutes
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="appSettings.showNotifications"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="weather-emoji">🔔</span>
              Show weather alerts and notifications
            </label>
          </div>

          <div class="form-group">
            <label for="temperatureUnit" class="form-label">
              <span class="weather-emoji">🌡️</span>
              Temperature Unit
            </label>
            <select
              id="temperatureUnit"
              v-model="appSettings.temperatureUnit"
              class="form-input"
            >
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="windUnit" class="form-label">
              <span class="weather-emoji">💨</span>
              Wind Speed Unit
            </label>
            <select
              id="windUnit"
              v-model="appSettings.windUnit"
              class="form-input"
            >
              <option value="ms">Meters per second (m/s)</option>
              <option value="kmh">Kilometers per hour (km/h)</option>
              <option value="mph">Miles per hour (mph)</option>
              <option value="knots">Knots</option>
            </select>
          </div>

          <div class="form-group">
            <label for="pressureUnit" class="form-label">
              <span class="weather-emoji">📊</span>
              Pressure Unit
            </label>
            <select
              id="pressureUnit"
              v-model="appSettings.pressureUnit"
              class="form-input"
            >
              <option value="hpa">Hectopascals (hPa)</option>
              <option value="inhg">Inches of mercury (inHg)</option>
              <option value="mmhg">Millimeters of mercury (mmHg)</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span class="weather-emoji">💾</span>
            {{ loading ? 'Saving...' : 'Save App Settings' }}
          </button>
        </form>
      </div>

      <!-- Data Management -->
      <div class="settings-section">
        <h2>🗄️ Data Management</h2>
        <p class="section-description">
          Manage your weather data and app storage
        </p>

        <div class="data-actions">
          <div class="action-item">
            <div class="action-info">
              <h4>📊 Export Weather Data</h4>
              <p>Download all your weather station data as CSV files</p>
            </div>
            <button
              @click="exportData"
              class="btn btn-secondary"
              :disabled="loading"
            >
              <span class="weather-emoji">📥</span>
              Export Data
            </button>
          </div>

          <div class="action-item">
            <div class="action-info">
              <h4>🗑️ Clear Cache</h4>
              <p>Clear cached weather data to free up storage space</p>
            </div>
            <button
              @click="clearCache"
              class="btn btn-secondary"
              :disabled="loading"
            >
              <span class="weather-emoji">🧹</span>
              Clear Cache
            </button>
          </div>

          <div class="action-item danger">
            <div class="action-info">
              <h4>⚠️ Reset App</h4>
              <p>Remove all stations and data (cannot be undone)</p>
            </div>
            <button @click="showResetConfirm = true" class="btn btn-danger">
              <span class="weather-emoji">🔥</span>
              Reset App
            </button>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <h2>ℹ️ About MyWeather</h2>
        <div class="about-content">
          <div class="app-info">
            <h3>🌤️ MyWeather v1.0.0</h3>
            <p>
              A beautiful weather monitoring app for Ecowitt weather stations
            </p>

            <div class="feature-list">
              <div class="feature-item">
                <span class="weather-emoji">📡</span>
                Multiple weather station support
              </div>
              <div class="feature-item">
                <span class="weather-emoji">🔄</span>
                Real-time data synchronization
              </div>
              <div class="feature-item">
                <span class="weather-emoji">📱</span>
                Progressive Web App (PWA)
              </div>
              <div class="feature-item">
                <span class="weather-emoji">🎨</span>
                Weather-themed beautiful UI
              </div>
            </div>

            <div class="tech-stack">
              <h4>🛠️ Built With</h4>
              <div class="tech-tags">
                <span class="tech-tag">Vue 3</span>
                <span class="tech-tag">TypeScript</span>
                <span class="tech-tag">Pinia</span>
                <span class="tech-tag">Convex</span>
                <span class="tech-tag">Vite</span>
                <span class="tech-tag">PWA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Confirmation Modal -->
    <div
      v-if="showResetConfirm"
      class="modal-overlay"
      @click="showResetConfirm = false"
    >
      <div class="modal-content reset-confirm" @click.stop>
        <h3>⚠️ Reset MyWeather App</h3>
        <p>
          This will permanently delete all your weather stations and data. This
          action cannot be undone.
        </p>
        <div class="reset-actions">
          <button @click="showResetConfirm = false" class="btn btn-secondary">
            <span class="weather-emoji">❌</span>
            Cancel
          </button>
          <button @click="resetApp" class="btn btn-danger" :disabled="loading">
            <span class="weather-emoji">🔥</span>
            Reset Everything
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      <span class="weather-emoji">✅</span>
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <span class="weather-emoji">❌</span>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Settings state
const apiSettings = ref({
  defaultApiKey: '',
  defaultApplicationKey: '',
});

const appSettings = ref({
  autoRefresh: true,
  showNotifications: true,
  temperatureUnit: 'celsius' as 'celsius' | 'fahrenheit',
  windUnit: 'ms' as 'ms' | 'kmh' | 'mph' | 'knots',
  pressureUnit: 'hpa' as 'hpa' | 'inhg' | 'mmhg',
});

const loading = ref(false);
const showResetConfirm = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

onMounted(() => {
  loadSettings();
});

// Methods
function loadSettings() {
  try {
    // Load from localStorage
    const savedApiSettings = localStorage.getItem('myweather-api-settings');
    if (savedApiSettings) {
      apiSettings.value = JSON.parse(savedApiSettings);
    }

    const savedAppSettings = localStorage.getItem('myweather-app-settings');
    if (savedAppSettings) {
      appSettings.value = {
        ...appSettings.value,
        ...JSON.parse(savedAppSettings),
      };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveApiSettings() {
  loading.value = true;
  try {
    localStorage.setItem(
      'myweather-api-settings',
      JSON.stringify(apiSettings.value)
    );
    showSuccess('API settings saved successfully');
  } catch (error) {
    showError('Failed to save API settings');
  } finally {
    loading.value = false;
  }
}

async function saveAppSettings() {
  loading.value = true;
  try {
    localStorage.setItem(
      'myweather-app-settings',
      JSON.stringify(appSettings.value)
    );
    showSuccess('App settings saved successfully');
  } catch (error) {
    showError('Failed to save app settings');
  } finally {
    loading.value = false;
  }
}

async function exportData() {
  loading.value = true;
  try {
    // Mock export functionality
    const csvData =
      'timestamp,station,temperature,humidity,pressure\n2024-01-01,Station 1,25.5,65,1013';
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'myweather-data.csv';
    a.click();
    URL.revokeObjectURL(url);

    showSuccess('Weather data exported successfully');
  } catch (error) {
    showError('Failed to export data');
  } finally {
    loading.value = false;
  }
}

async function clearCache() {
  loading.value = true;
  try {
    // Clear cached data
    localStorage.removeItem('myweather-cache');
    showSuccess('Cache cleared successfully');
  } catch (error) {
    showError('Failed to clear cache');
  } finally {
    loading.value = false;
  }
}

async function resetApp() {
  loading.value = true;
  try {
    // Clear all localStorage data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('myweather-')) {
        localStorage.removeItem(key);
      }
    });

    // Reset settings to defaults
    apiSettings.value = {
      defaultApiKey: '',
      defaultApplicationKey: '',
    };

    appSettings.value = {
      autoRefresh: true,
      showNotifications: true,
      temperatureUnit: 'celsius',
      windUnit: 'ms',
      pressureUnit: 'hpa',
    };

    showResetConfirm.value = false;
    showSuccess('App has been reset successfully');
  } catch (error) {
    showError('Failed to reset app');
  } finally {
    loading.value = false;
  }
}

function showSuccess(message: string) {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
}

function showError(message: string) {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = null;
  }, 3000);
}
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-header {
  text-align: center;
  margin-bottom: 3rem;
}

.settings-header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.settings-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.settings-section h2 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 1.5rem;
}

.section-description {
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-help {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: border-color 0.3s ease;
}

.action-item:hover {
  border-color: var(--primary-color);
}

.action-item.danger {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.action-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.action-info p {
  margin: 0;
  color: var(--text-color);
  font-size: 0.9rem;
}

.about-content {
  text-align: center;
}

.app-info h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(74, 144, 226, 0.05);
  border-radius: 8px;
}

.tech-stack {
  margin-top: 2rem;
}

.tech-stack h4 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.tech-tag {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.reset-confirm {
  text-align: center;
}

.reset-confirm h3 {
  color: #d63031;
  margin-bottom: 1rem;
}

.reset-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.success-message,
.error-message {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  font-weight: 600;
}

.success-message {
  background: #e8f5e8;
  color: #2d7a2d;
  border: 1px solid #4caf50;
}

.error-message {
  background: #ffe6e6;
  color: #d63031;
  border: 1px solid #f44336;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .settings-container {
    padding: 1rem;
  }

  .action-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .feature-list {
    grid-template-columns: 1fr;
  }

  .reset-actions {
    flex-direction: column;
  }

  .success-message,
  .error-message {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>
