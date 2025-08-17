<template>
  <div id="app">
    <header>
      <nav class="navbar">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <span class="weather-icon">🌤️</span>
            <span class="brand-text">MyWeather</span>
          </router-link>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">🏠 Dashboard</router-link>
          <router-link to="/stations" class="nav-link">📡 Stations</router-link>
          <router-link to="/settings" class="nav-link">⚙️ Settings</router-link>
        </div>
      </nav>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-content">
        <p>🌤️ MyWeather - Powered by Ecowitt Weather Stations</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useWeatherStore } from './stores/weather';

const weatherStore = useWeatherStore();

onMounted(() => {
  // Initialize the weather store when the app loads
  weatherStore.loadStations();
});
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.navbar {
  background: linear-gradient(135deg, var(--sky-blue), var(--ocean-blue));
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-brand .brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.weather-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.brand-text {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: linear-gradient(180deg, var(--cloud-white), var(--sky-blue));
  min-height: calc(100vh - 140px);
}

.footer {
  background: linear-gradient(135deg, var(--storm-gray), var(--ocean-blue));
  color: white;
  padding: 1rem;
  text-align: center;
  margin-top: auto;
}

.footer-content p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
