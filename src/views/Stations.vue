<template>
  <div class="stations-container">
    <div class="stations-header">
      <h1>📡 Weather Stations</h1>
      <p>Manage your Ecowitt weather stations</p>
    </div>

    <div class="stations-actions">
      <button @click="showAddForm = true" class="btn btn-primary">
        <span class="weather-emoji">➕</span>
        Add New Station
      </button>
      <button @click="refreshAll" class="btn btn-secondary" :disabled="loading">
        <span class="weather-emoji">🔄</span>
        Refresh All
      </button>
    </div>

    <!-- Add Station Form Modal -->
    <div v-if="showAddForm" class="modal-overlay" @click="closeAddForm">
      <div class="modal-content" @click.stop>
        <AddStationForm @close="closeAddForm" @added="onStationAdded" />
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-container">
      <div class="error-message">
        <span class="weather-emoji">⚠️</span>
        {{ error }}
      </div>
      <button @click="clearError" class="btn btn-secondary">
        <span class="weather-emoji">❌</span>
        Dismiss
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading"></div>
      <p>Loading stations...</p>
    </div>

    <!-- Stations List -->
    <div v-else-if="stations.length === 0" class="no-stations">
      <div class="no-stations-content">
        <span class="weather-icon">📡</span>
        <h2>No Weather Stations</h2>
        <p>Get started by adding your first Ecowitt weather station!</p>
        <button @click="showAddForm = true" class="btn btn-primary">
          <span class="weather-emoji">➕</span>
          Add Your First Station
        </button>
      </div>
    </div>

    <div v-else class="stations-grid">
      <StationCard
        v-for="station in stations"
        :key="station.id"
        :station="station"
        @edit="editStation"
        @delete="deleteStation"
        @toggle-active="toggleStationActive"
      />
    </div>

    <!-- Edit Station Modal -->
    <div v-if="editingStation" class="modal-overlay" @click="closeEditForm">
      <div class="modal-content" @click.stop>
        <EditStationForm
          :station="editingStation"
          @close="closeEditForm"
          @updated="onStationUpdated"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deletingStation" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-confirm" @click.stop>
        <h3>🗑️ Delete Weather Station</h3>
        <p>
          Are you sure you want to delete
          <strong>{{ deletingStation.name }}</strong
          >? This action cannot be undone.
        </p>
        <div class="delete-actions">
          <button @click="cancelDelete" class="btn btn-secondary">
            <span class="weather-emoji">❌</span>
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="btn btn-danger"
            :disabled="loading"
          >
            <span class="weather-emoji">🗑️</span>
            Delete Station
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWeatherStore } from '../stores/weather';
import StationCard from '../components/StationCard.vue';
import AddStationForm from '../components/AddStationForm.vue';
import EditStationForm from '../components/EditStationForm.vue';
import type { WeatherStation } from '../types/weather';

const weatherStore = useWeatherStore();

// Reactive state
const showAddForm = ref(false);
const editingStation = ref<WeatherStation | null>(null);
const deletingStation = ref<WeatherStation | null>(null);

// Computed properties
const stations = computed(() => weatherStore.stations);
const loading = computed(() => weatherStore.loading);
const error = computed(() => weatherStore.error);

onMounted(() => {
  weatherStore.loadStations();
});

// Methods
function closeAddForm() {
  showAddForm.value = false;
}

function onStationAdded() {
  showAddForm.value = false;
  weatherStore.loadStations(); // Refresh the list
}

function editStation(station: WeatherStation) {
  editingStation.value = station;
}

function closeEditForm() {
  editingStation.value = null;
}

function onStationUpdated() {
  editingStation.value = null;
  weatherStore.loadStations(); // Refresh the list
}

function deleteStation(station: WeatherStation) {
  deletingStation.value = station;
}

function cancelDelete() {
  deletingStation.value = null;
}

async function confirmDelete() {
  if (deletingStation.value) {
    try {
      await weatherStore.removeStation(deletingStation.value.id);
      deletingStation.value = null;
    } catch (error) {
      console.error('Failed to delete station:', error);
    }
  }
}

async function toggleStationActive(station: WeatherStation) {
  try {
    await weatherStore.updateStation(station.id, {
      isActive: !station.isActive,
    });
  } catch (error) {
    console.error('Failed to toggle station status:', error);
  }
}

async function refreshAll() {
  await weatherStore.fetchAllStationsData();
}

function clearError() {
  weatherStore.clearError();
}
</script>

<style scoped>
.stations-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.stations-header {
  text-align: center;
  margin-bottom: 2rem;
}

.stations-header h1 {
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

.stations-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.error-container {
  margin-bottom: 2rem;
  text-align: center;
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

.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.no-stations {
  text-align: center;
  padding: 4rem 2rem;
}

.no-stations-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-stations-content .weather-icon {
  font-size: 4rem;
  opacity: 0.5;
  display: block;
  margin-bottom: 1rem;
}

.no-stations-content h2 {
  color: var(--text-color);
  margin: 1rem 0;
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.delete-confirm {
  text-align: center;
}

.delete-confirm h3 {
  color: #d63031;
  margin-bottom: 1rem;
}

.delete-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-danger {
  background: #d63031;
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
}

.btn-danger:hover:not(:disabled) {
  background: #c92a2a;
  transform: translateY(-2px);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .stations-container {
    padding: 1rem;
  }

  .stations-header h1 {
    font-size: 2rem;
  }

  .stations-actions {
    flex-direction: column;
    align-items: center;
  }

  .stations-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    max-width: none;
  }

  .delete-actions {
    flex-direction: column;
  }
}
</style>
