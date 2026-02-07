import './css/style.css'

import {
  getMetadata,
  getTimeZone,
  getLocale,
  signalReady,
} from '@screenly/edge-apps'
// Import components to register them as custom elements
// This registers <brand-logo>, <app-header>, <auto-scaler>, and <edge-app-devtools>
import '@screenly/edge-apps/components'
import { getCityName } from './location'
import { getWeatherData } from './weather'
import { getTimeData } from './time'

// Note: Auto-scaling and dev tools are now handled declaratively in index.html
// via <auto-scaler> and <edge-app-devtools> web components

// DOM elements (will be initialized in DOMContentLoaded)
let locationEl: Element | null
let timeEl: Element | null
let periodEl: Element | null
let dateEl: Element | null
let temperatureEl: Element | null
let weatherIconEl: HTMLImageElement | null
let temperatureWrapperEl: Element | null

// State
let timezone: string = 'UTC'
let locale: string = 'en'
let locationName: string = 'Unknown Location'

// Hide temperature section helper
function hideTemperatureSection() {
  if (temperatureWrapperEl) {
    ;(temperatureWrapperEl as HTMLElement).style.display = 'none'
  }
}

// Show temperature section helper
function showTemperatureSection() {
  if (temperatureWrapperEl) {
    ;(temperatureWrapperEl as HTMLElement).style.display = ''
  }
}

// Update weather display
async function updateWeatherDisplay(
  latitude: number,
  longitude: number,
  tz: string,
) {
  const weatherData = await getWeatherData(latitude, longitude, tz)

  if (!weatherData) {
    hideTemperatureSection()
    return
  }

  showTemperatureSection()

  if (temperatureEl) {
    temperatureEl.textContent = weatherData.displayText
  }

  if (weatherIconEl) {
    weatherIconEl.src = weatherData.iconSrc
    weatherIconEl.alt = weatherData.iconAlt
  }
}

// Update time display
function updateTime() {
  const now = new Date()
  const data = getTimeData(now, locale, timezone)

  if (timeEl) {
    timeEl.textContent = `${data.hour}:${data.minute}`
  }

  if (periodEl) {
    periodEl.textContent = data.period
  }

  if (dateEl) {
    dateEl.textContent = data.date
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Query DOM elements now that DOM is ready
    locationEl = document.querySelector('[data-location]')
    timeEl = document.querySelector('[data-time]')
    periodEl = document.querySelector('[data-period]')
    dateEl = document.querySelector('[data-date]')
    temperatureEl = document.querySelector('[data-temperature]')
    weatherIconEl = document.querySelector(
      '[data-weather-icon]',
    ) as HTMLImageElement | null
    temperatureWrapperEl = document.querySelector('.temperature-wrapper')

    // Get metadata (includes coordinates)
    const metadata = getMetadata()
    const [latitude, longitude] = metadata.coordinates

    // Get timezone and locale from coordinates
    timezone = await getTimeZone()
    locale = await getLocale()

    // Get location name
    locationName = await getCityName(latitude, longitude)
    if (locationEl) {
      locationEl.textContent = locationName
    }

    // Get weather data (optional)
    await updateWeatherDisplay(latitude, longitude, timezone)

    // Update time immediately
    updateTime()

    // Update time every second
    setInterval(updateTime, 1000)

    // Refresh weather every 15 minutes
    setInterval(
      () => {
        updateWeatherDisplay(latitude, longitude, timezone)
      },
      15 * 60 * 1000,
    )
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }

  // Signal that the app is ready to be shown
  signalReady()
})
