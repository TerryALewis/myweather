<template>
  <div class="weather-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">
        <span class="chart-icon">{{ icon }}</span>
        {{ title }}
      </h3>
      <button @click="$emit('close')" class="close-button">
        <span>✕</span>
      </button>
    </div>
    <div class="chart-subtitle">
      <span>{{ timePeriod || 'Last 24 hours' }}</span>
      <span class="chart-unit">{{ unit }}</span>
    </div>
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">Current</span>
        <span class="stat-value">{{ currentValue }}{{ unit }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">High</span>
        <span class="stat-value">{{ highValue }}{{ unit }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Low</span>
        <span class="stat-value">{{ lowValue }}{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  title: string;
  icon: string;
  unit: string;
  data: Array<{ timestamp: Date; value: number }>;
  color: string;
  currentValue: string;
  timePeriod?: string; // Optional time period label
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Computed stats
const highValue = computed(() => {
  if (props.data.length === 0) return '0';
  const max = Math.max(...props.data.map((d) => d.value));
  return max.toFixed(1);
});

const lowValue = computed(() => {
  if (props.data.length === 0) return '0';
  const min = Math.min(...props.data.map((d) => d.value));
  return min.toFixed(1);
});

async function createChart() {
  try {
    console.log('🎨 createChart called with:', {
      canvasExists: !!chartCanvas.value,
      dataLength: props.data.length,
      data: props.data,
      title: props.title,
      color: props.color,
    });

    if (!chartCanvas.value || props.data.length === 0) {
      console.warn('⚠️ Cannot create chart:', {
        canvasExists: !!chartCanvas.value,
        dataLength: props.data.length,
      });
      return;
    }

    // Wait for DOM to be fully rendered
    await nextTick();

    const ctx = chartCanvas.value.getContext('2d');
    console.log('📐 Canvas dimensions:', {
      width: chartCanvas.value.width,
      height: chartCanvas.value.height,
      clientWidth: chartCanvas.value.clientWidth,
      clientHeight: chartCanvas.value.clientHeight,
      offsetWidth: chartCanvas.value.offsetWidth,
      offsetHeight: chartCanvas.value.offsetHeight,
    });
    if (!ctx) {
      console.error('❌ Cannot get canvas context');
      return;
    }

    console.log('✅ Canvas context obtained, proceeding with chart creation');

    // Prepare chart data
    const labels = props.data.map((item) => {
      // For rainfall chart, show date (YYYY-MM-DD), otherwise show time
      if (props.title && props.title.toLowerCase().includes('rainfall')) {
        return item.timestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      } else {
        return item.timestamp.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
    });

    const values = props.data.map((item) => item.value);

    console.log('📊 Chart data prepared:', { labels, values });

    // All charts use a simple line (no circles) and bright axis labels
    const chartData: ChartData<'line'> = {
      labels,
      datasets: [
        {
          label: props.title,
          data: values,
          borderColor: props.color,
          backgroundColor: props.color + '20', // Add transparency
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: props.color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    };

    const axisLabelColor = '#ffffff';
    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: props.color,
          borderWidth: 1,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              const time = props.data[index].timestamp;
              return time.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
            },
            label: (context) => {
              return `${props.title}: ${context.parsed.y.toFixed(1)}${props.unit}`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: axisLabelColor,
            maxTicksLimit: 6,
          },
        },
        y: {
          display: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: axisLabelColor,
            callback: function (value) {
              return value + props.unit;
            },
          },
        },
      },
      elements: {
        point: {
          hoverBackgroundColor: props.color,
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    };

    // Destroy existing chart
    if (chartInstance) {
      console.log('🗑️ Destroying existing chart instance');
      chartInstance.destroy();
    }

    // Create new chart
    console.log('🚀 Creating new Chart.js instance');
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });

    console.log('✅ Chart created successfully:', chartInstance);
  } catch (error) {
    console.error('❌ Error creating chart:', error);
    // Optionally emit an error event to parent component
    // emit('error', error);
  }
}

// Watch for data changes and recreate chart
watch(() => props.data, createChart, { deep: true });

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
.weather-chart-container {
  background: linear-gradient(135deg, #87ceeb 0%, #4a90e2 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
  position: relative;
  max-width: 100%;
  min-height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.chart-icon {
  font-size: 1.8rem;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.chart-subtitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.chart-unit {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 8px;
}

.chart-wrapper {
  height: 280px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px;
  border-radius: 12px;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
  text-transform: uppercase;
  font-weight: 500;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
}

@media (max-width: 768px) {
  .weather-chart-container {
    padding: 16px;
    min-height: 350px;
  }

  .chart-wrapper {
    height: 220px;
    margin-bottom: 16px;
  }

  .chart-stats {
    gap: 8px;
  }

  .stat-item {
    padding: 8px;
  }
}
</style>
