# 24-Hour Weather History Charts

This feature allows users to view historical weather data for the last 24 hours by clicking on individual weather metric panels.

## How to Use

1. **Temperature Chart**: Click on the main temperature display (top card) to view 24-hour temperature history
2. **Humidity Chart**: Click on the humidity metric card to view 24-hour humidity history
3. **Wind Speed Chart**: Click on the wind speed metric card to view 24-hour wind speed history
4. **Pressure Chart**: Click on the pressure metric card to view 24-hour pressure history
5. **Rainfall Chart**: Click on the rainfall metric card to view 24-hour rainfall history

## Features

- **Interactive Charts**: Smooth line charts with hover tooltips showing precise values and timestamps
- **Responsive Design**: Charts adapt to different screen sizes and device orientations
- **Unit Awareness**: Charts display data in the user's preferred units (set in Settings)
- **Statistics**: Each chart shows current value, 24-hour high, and 24-hour low
- **Easy Navigation**: Click the X button or outside the chart to return to the main dashboard

## Chart Details

Each chart displays:

- **24 data points** representing hourly values over the last 24 hours
- **Current value** prominently displayed
- **High/Low statistics** for the time period
- **Smooth animations** when opening and closing charts
- **Color-coded lines** matching the weather metric type

## Data Source

The charts now display **real historical data** from your Ecowitt weather station via the Ecowitt API:

- **Primary Source**: Live historical data from Ecowitt API for the last 24 hours
- **Automatic Fallback**: If real historical data is unavailable (API issues, network problems), the system automatically generates realistic simulated data based on current conditions
- **Hourly Precision**: Data points represent hourly measurements for accurate trend analysis
- **User Unit Preferences**: All historical data respects your unit preferences set in Settings

## How It Works

1. **API Integration**: When you click a metric card, the app makes a real-time call to the Ecowitt API historical endpoint
2. **Data Processing**: Raw historical data is processed and converted to your preferred units
3. **Graceful Degradation**: If the Ecowitt API is unavailable, the system seamlessly falls back to generated data
4. **Caching**: Recent historical data may be cached to improve performance and reduce API calls

## Technical Implementation

- Built with **Chart.js** for smooth, interactive charts
- **Vue 3 Composition API** for reactive state management
- **TypeScript** for type safety
- **Responsive CSS** with smooth animations
- **Modular design** allowing easy addition of new chart types

## Visual Indicators

- **📈 Chart Icon**: Appears on hover over clickable weather cards
- **Hover Effects**: Cards lift slightly and show subtle blue borders when hoverable
- **Loading States**: Smooth slide-in animations when charts appear
- **Color Themes**: Each metric has its own color scheme (temperature=orange, humidity=blue, etc.)

This feature enhances the weather app by providing users with historical context for current conditions, helping them understand weather trends and patterns throughout the day.
