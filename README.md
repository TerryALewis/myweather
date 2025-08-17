# MyWeather - Ecowitt Weather Station PWA 🌤️

A beautiful Progressive Web App for monitoring your Ecowitt weather stations with real-time data visualization and weather-themed interface.

## Features ✨

- 📡 **Multiple Weather Stations**: Add and manage multiple Ecowitt weather stations
- 🌤️ **Real-time Data**: Live weather data from your stations with auto-refresh
- 📱 **Progressive Web App**: Install on any device with offline capabilities
- 🎨 **Weather-themed UI**: Beautiful interface with weather colors and emojis
- 📊 **Detailed Metrics**: Temperature, humidity, wind, pressure, rainfall, and more
- ⚙️ **Customizable Settings**: Configure units, refresh intervals, and preferences
- 🔄 **Auto-refresh**: Automatic data updates every 5 minutes
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## Tech Stack 🛠️

- **Vue 3** - Modern reactive framework
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management
- **Convex** - Backend-as-a-Service for data storage
- **Vite** - Fast build tool and dev server
- **PWA** - Progressive Web App capabilities

## Getting Started 🚀

### Prerequisites

- Node.js 18 or higher
- An Ecowitt weather station
- Ecowitt API credentials

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd MyWeather
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure your environment variables:

```env
VITE_CONVEX_URL=your_convex_url
VITE_ECOWITT_API_KEY=your_default_api_key
VITE_ECOWITT_APPLICATION_KEY=your_default_application_key
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
npm run preview
```

## Ecowitt API Setup 🔑

1. Create an account at [Ecowitt](https://www.ecowitt.com/)
2. Get your API credentials from the developer section
3. Find your weather station's MAC address in the WS View app
4. Configure the credentials in the app settings

## Project Structure 📁

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
├── stores/             # Pinia stores for state management
├── services/           # API services (Ecowitt, Convex)
├── types/              # TypeScript type definitions
├── router/             # Vue Router configuration
└── assets/             # Static assets
```

## Key Components 🧩

- **Dashboard**: Overview of all weather stations
- **Stations**: Manage your weather stations
- **StationDetail**: Detailed view of a single station
- **Settings**: App configuration and preferences
- **WeatherStationCard**: Display weather data beautifully

## Weather Data 🌡️

The app displays comprehensive weather information:

- **Temperature** (°C/°F) with feels-like calculation
- **Humidity** (%) with dew point
- **Wind Speed & Direction** with gusts
- **Atmospheric Pressure** in various units
- **Rainfall** measurements
- **Solar Radiation** and UV Index
- **Battery Levels** of weather station components

## PWA Features 📱

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: View cached data when offline
- **Background Sync**: Sync data when connection is restored
- **Push Notifications**: Weather alerts (planned feature)

## Contributing 🤝

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Weather Color Palette 🎨

The app uses a beautiful weather-inspired color scheme:

- **Sky Blue**: #87CEEB - Primary backgrounds
- **Cloud White**: #F8F8FF - Card backgrounds
- **Sun Yellow**: #FFD700 - Accent highlights
- **Storm Gray**: #708090 - Text and borders
- **Ocean Blue**: #4A90E2 - Primary actions
- **Grass Green**: #7CB342 - Success states
- **Sunset Orange**: #FF8C00 - Warnings
- **Rain Blue**: #6495ED - Information

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

If you have questions or need help:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Made with ❤️ and lots of ☀️🌧️⛈️🌈
