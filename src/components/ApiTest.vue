<template>
  <div class="api-test-container">
    <h2>🧪 Ecowitt API Test</h2>

    <div class="test-section">
      <h3>Environment Variables</h3>
      <div class="env-info">
        <p>
          <strong>API Key:</strong>
          {{ apiKey ? apiKey.substring(0, 8) + '...' : 'Not set' }}
        </p>
        <p>
          <strong>Application Key:</strong>
          {{
            applicationKey ? applicationKey.substring(0, 8) + '...' : 'Not set'
          }}
        </p>
        <p><strong>MAC Address:</strong> {{ macAddress }}</p>
        <p>
          <strong>Keys are same:</strong>
          {{
            apiKey === applicationKey
              ? '⚠️ YES (This might be the problem!)'
              : '✅ NO'
          }}
        </p>
      </div>
    </div>

    <div class="test-section">
      <h3>Manual Test</h3>
      <div class="form-group">
        <label>Test API Key:</label>
        <input
          v-model="testApiKey"
          type="text"
          placeholder="Enter API key to test"
        />
      </div>
      <div class="form-group">
        <label>Test Application Key:</label>
        <input
          v-model="testApplicationKey"
          type="text"
          placeholder="Enter application key to test"
        />
      </div>
      <div class="form-group">
        <label>Test MAC Address:</label>
        <input
          v-model="testMacAddress"
          type="text"
          placeholder="Enter MAC address to test"
        />
      </div>
      <button @click="testApi" :disabled="testing">
        {{ testing ? 'Testing...' : 'Test API Call' }}
      </button>
    </div>

    <div v-if="testResult" class="test-result">
      <h3>Test Result:</h3>
      <pre>{{ testResult }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ecowittApi } from '../services/ecowitt';

// Environment variables
const apiKey = computed(() => import.meta.env.VITE_ECOWITT_API_KEY);
const applicationKey = computed(
  () => import.meta.env.VITE_ECOWITT_APPLICATION_KEY
);
const macAddress = '8C:4F:00:02:EC:A7';

// Test form
const testApiKey = ref(apiKey.value || '');
const testApplicationKey = ref(applicationKey.value || '');
const testMacAddress = ref(macAddress);
const testing = ref(false);
const testResult = ref<any>(null);

async function testApi() {
  testing.value = true;
  testResult.value = null;

  try {
    console.log('🧪 Starting API test...');
    const result = await ecowittApi.getStationData(
      testMacAddress.value,
      testApiKey.value,
      testApplicationKey.value
    );

    testResult.value = {
      success: true,
      data: result,
      message: 'API call successful!',
    };
    console.log('✅ API test successful:', result);
  } catch (error) {
    testResult.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'API call failed',
    };
    console.error('❌ API test failed:', error);
  } finally {
    testing.value = false;
  }
}
</script>

<style scoped>
.api-test-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.test-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
}

.env-info p {
  margin: 0.5rem 0;
  font-family: monospace;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-result {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}

.test-result pre {
  white-space: pre-wrap;
  font-size: 0.9rem;
}
</style>
