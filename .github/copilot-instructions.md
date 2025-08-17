<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# MyWeather - Ecowitt Weather Station PWA

This is a Vue 3 Progressive Web App (PWA) built with TypeScript, Pinia for state management, and Convex for data storage. The app is designed to monitor and display weather data from Ecowitt weather stations with a beautiful weather-themed interface.

## Project Structure

- **Vue 3 + TypeScript**: Modern reactive framework with type safety
- **Pinia**: State management for weather data and app settings
- **Convex**: Backend-as-a-Service for data persistence (currently mocked)
- **PWA**: Installable web app with offline capabilities
- **Weather-themed UI**: Beautiful color scheme with weather emojis and icons

## Key Features

- Multiple weather station management
- Real-time weather data from Ecowitt API
- Weather-themed beautiful interface with emojis
- Progressive Web App capabilities
- Responsive design for all devices
- Settings and preferences management

## Development Guidelines

1. **Weather Theme**: Always use weather-related emojis and color scheme defined in CSS variables
2. **TypeScript**: Maintain strict typing throughout the codebase
3. **Pinia Stores**: Use the weather store for all data management
4. **Components**: Create reusable components with proper prop typing
5. **PWA**: Ensure offline functionality and proper caching

## Color Palette

- Sky Blue: #87CEEB
- Cloud White: #F8F8FF
- Sun Yellow: #FFD700
- Storm Gray: #708090
- Ocean Blue: #4A90E2
- Grass Green: #7CB342
- Sunset Orange: #FF8C00
- Rain Blue: #6495ED

## API Integration

The app integrates with Ecowitt weather station API for real-time weather data. All API calls should be handled through the ecowitt service with proper error handling.

## State Management

Use Pinia stores for:

- Weather station management
- Current weather data
- App settings and preferences
- Error handling and loading states
