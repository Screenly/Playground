import './css/style.css'

import {
  getMetadata,
  getTimeZone,
  getLocale,
  formatTime,
  formatLocalizedDate,
  signalReady,
  getSetting,
  getWeatherIconKey,
} from '@screenly/edge-apps'
// Import components to register them as custom elements
// This registers <brand-logo>, <app-header>, <auto-scaler>, and <edge-app-devtools>
import '@screenly/edge-apps/components'
import { WEATHER_ICONS } from './weather-icons'

// Note: Auto-scaling and dev tools are now handled declaratively in index.html
// via <auto-scaler> and <edge-app-devtools> web components

// Get DOM elements
const locationEl = document.querySelector('[data-location]')
const timeEl = document.querySelector('[data-time]')
const periodEl = document.querySelector('[data-period]')
const dateEl = document.querySelector('[data-date]')
const temperatureEl = document.querySelector('[data-temperature]')
const weatherIconEl = document.querySelector(
  '[data-weather-icon]',
) as HTMLImageElement | null
const temperatureWrapperEl = document.querySelector('.temperature-wrapper')

// State
let timezone: string = 'UTC'
let locale: string = 'en'
let locationName: string = 'Unknown Location'
let currentTemp: number | null = null
let currentWeatherId: number | null = null

// Get city name from coordinates (using OpenWeatherMap reverse geocoding)
async function getCityName(lat: number, lng: number): Promise<string> {
  try {
    const apiKey = getSetting<string>('openweathermap_api_key')
    if (!apiKey) {
      // Fallback to location from metadata if no API key
      return getMetadata().location || 'Unknown Location'
    }

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`,
    )
    const data = await response.json()

    if (Array.isArray(data) && data.length > 0) {
      const { name, country } = data[0]
      return `${name}, ${country}`
    }
  } catch (error) {
    console.warn('Failed to get city name:', error)
  }

  // Fallback to location from metadata
  return getMetadata().location || 'Unknown Location'
}

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

// Validate OpenWeatherMap API response
// Note: `cod` can be number (200) or string ("200") depending on the endpoint
function isValidWeatherResponse(data: {
  cod?: number | string
  main?: { temp?: number }
}): boolean {
  return (data.cod === 200 || data.cod === '200') && Boolean(data.main?.temp)
}

// Get weather data (optional - requires OpenWeatherMap API key)
async function getWeatherData(
  lat: number,
  lng: number,
  tz: string,
): Promise<void> {
  try {
    const apiKey = getSetting<string>('openweathermap_api_key')
    if (!apiKey) {
      hideTemperatureSection()
      return
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`,
    )
    const data = await response.json()

    if (!isValidWeatherResponse(data)) {
      hideTemperatureSection()
      return
    }

    currentTemp = Math.round(data.main.temp)
    currentWeatherId = data.weather?.[0]?.id ?? null

    showTemperatureSection()

    if (!temperatureEl) {
      return
    }

    temperatureEl.textContent = `${currentTemp}°`

    // Update weather icon
    if (!weatherIconEl || !currentWeatherId) {
      return
    }

    const iconKey = getWeatherIconKey(
      currentWeatherId,
      Math.floor(Date.now() / 1000),
      tz,
    )
    const iconSrc = WEATHER_ICONS[iconKey] || WEATHER_ICONS['clear']
    weatherIconEl.src = iconSrc
    weatherIconEl.alt = data.weather?.[0]?.description || 'Weather icon'
  } catch (error) {
    console.warn('Failed to get weather data:', error)
    hideTemperatureSection()
  }
}

// Update time display
function updateTime() {
  const now = new Date()
  const timeData = formatTime(now, locale, timezone)

  if (timeEl) {
    // Format as "HH:MM" or "H:MM" depending on locale
    const timeStr = timeData.formatted.split(' ')[0] // Remove AM/PM if present
    const [hour, minute] = timeStr.split(':')
    timeEl.textContent = `${hour}:${minute}`
  }

  if (periodEl && timeData.dayPeriod) {
    periodEl.textContent = timeData.dayPeriod
  } else if (periodEl) {
    periodEl.textContent = ''
  }

  // Update date
  if (dateEl) {
    dateEl.textContent = formatLocalizedDate(now, locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  try {
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
    await getWeatherData(latitude, longitude, timezone)

    // Update time immediately
    updateTime()

    // Update time every second
    setInterval(updateTime, 1000)

    // Refresh weather every 15 minutes
    setInterval(
      () => {
        getWeatherData(latitude, longitude, timezone)
      },
      15 * 60 * 1000,
    )
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }

  // Signal that the app is ready to be shown
  signalReady()
})
