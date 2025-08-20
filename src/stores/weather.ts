import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WeatherStation, WeatherData } from '../types/weather';
import { ecowittApi } from '../services/ecowitt';
import { convexApi } from '../services/convex';

export const useWeatherStore = defineStore('weather', () => {
  // State
  const stations = ref<WeatherStation[]>([]);
  const currentWeatherData = ref<Map<string, WeatherData>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeStations = computed(() =>
    stations.value.filter((station) => station.isActive)
  );

  const stationCount = computed(() => stations.value.length);

  const hasStations = computed(() => stations.value.length > 0);

  // Actions
  async function loadStations() {
    try {
      loading.value = true;
      error.value = null;
      const savedStations = await convexApi.getStations();
      stations.value = savedStations;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load stations';
      console.error('Error loading stations:', err);
    } finally {
      loading.value = false;
    }
  }

  async function addStation(
    station: Omit<WeatherStation, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      loading.value = true;
      error.value = null;

      // Validate station by fetching data from Ecowitt
      await ecowittApi.getStationData(
        station.macAddress,
        station.apiKey,
        station.applicationKey
      );

      // Save to Convex
      const newStation = await convexApi.addStation(station);
      stations.value.push(newStation);

      return newStation;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to add station';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeStation(stationId: string) {
    try {
      loading.value = true;
      error.value = null;

      await convexApi.removeStation(stationId);
      stations.value = stations.value.filter(
        (station) => station.id !== stationId
      );
      currentWeatherData.value.delete(stationId);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to remove station';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateStation(
    stationId: string,
    updates: Partial<WeatherStation>
  ) {
    try {
      loading.value = true;
      error.value = null;

      const updatedStation = await convexApi.updateStation(stationId, updates);
      const index = stations.value.findIndex(
        (station) => station.id === stationId
      );
      if (index !== -1) {
        stations.value[index] = updatedStation;
      }

      return updatedStation;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to update station';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchWeatherData(stationId: string) {
    const station = stations.value.find((s) => s.id === stationId);
    if (!station) {
      throw new Error('Station not found');
    }

    try {
      loading.value = true;
      error.value = null;

      const weatherData = await ecowittApi.getStationData(
        station.macAddress,
        station.apiKey,
        station.applicationKey
      );

      // Debug: log the weather data being stored
      console.log('🏪 Store - Received weather data:', weatherData);
      console.log('🌧️ Store - Rainfall values:', {
        daily: weatherData.rainfall,
        weekly: weatherData.rainfallWeekly,
        monthly: weatherData.rainfallMonthly,
        yearly: weatherData.rainfallYearly,
      });

      // Save to Convex
      await convexApi.saveWeatherReading(stationId, weatherData);

      // Update current data
      currentWeatherData.value.set(stationId, weatherData);

      return weatherData;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch weather data';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllStationsData() {
    const promises = activeStations.value.map((station) =>
      fetchWeatherData(station.id).catch((err) => {
        console.error(`Failed to fetch data for station ${station.name}:`, err);
        return null;
      })
    );

    await Promise.all(promises);
  }

  function getStationData(stationId: string): WeatherData | null {
    return currentWeatherData.value.get(stationId) || null;
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    stations,
    currentWeatherData,
    loading,
    error,

    // Getters
    activeStations,
    stationCount,
    hasStations,

    // Actions
    loadStations,
    addStation,
    removeStation,
    updateStation,
    fetchWeatherData,
    fetchAllStationsData,
    getStationData,
    clearError,
  };
});
