<template>
  <div id="app">
    <header class="app-header">
      <nav class="navbar">
        <div class="nav-brand">
          <span class="weather-icon">🌤️</span>
          <h1>MyWeather</h1>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="weather-emoji">🏠</span>
            Dashboard
          </router-link>
          <router-link to="/stations" class="nav-link">
            <span class="weather-emoji">📡</span>
            Stations
          </router-link>
          <router-link to="/settings" class="nav-link">
            <span class="weather-emoji">⚙️</span>
            Settings
          </router-link>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <p>🌈 MyWeather - Powered by Ecowitt Weather Stations</p>
        <p class="weather-emoji">☀️🌙⭐</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useWeatherStore } from './stores/weather';

const weatherStore = useWeatherStore();

onMounted(() => {
  // Initialize weather data on app load
  weatherStore.loadStations();
});
</script>

<style scoped>
.app-header {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
  color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.navbar {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.app-main {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.app-footer {
  background: var(--storm-gray);
  color: white;
  text-align: center;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content p {
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}
</style>
