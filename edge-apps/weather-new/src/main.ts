import './css/style.css'

import {
  getMetadata,
  getTimeZone,
  getLocale,
  signalReady,
} from '@screenly/edge-apps'
import '@screenly/edge-apps/components'
import { getCityName } from './location'
import { getCurrentWeather, getHourlyForecast } from './weather'
import type { ForecastItem } from './weather'

// DOM elements
let locationEl: Element | null
let temperatureEl: Element | null
let weatherDescriptionEl: Element | null
let tempHighEl: Element | null
let tempLowEl: Element | null
let forecastItemsEl: Element | null
let forecastCardEl: Element | null

// State
let timezone: string = 'UTC'
let locale: string = 'en'

function hideForecastCard() {
  if (forecastCardEl) {
    ;(forecastCardEl as HTMLElement).style.display = 'none'
  }
}

function renderForecastItems(items: ForecastItem[]) {
  if (!forecastItemsEl) return

  forecastItemsEl.innerHTML = items
    .map(
      (item) => `
      <div class="forecast-item">
        <span class="forecast-item-temp">${item.displayTemp}</span>
        <img class="forecast-item-icon" src="${item.iconSrc}" alt="${item.iconAlt}" />
        <span class="forecast-item-time">${item.timeLabel}</span>
      </div>
    `,
    )
    .join('')
}

async function updateWeatherDisplay(
  latitude: number,
  longitude: number,
  tz: string,
) {
  const weather = await getCurrentWeather(latitude, longitude, tz)

  if (!weather) {
    return
  }

  if (temperatureEl) {
    temperatureEl.textContent = weather.displayTemp
  }

  if (weatherDescriptionEl) {
    weatherDescriptionEl.textContent = weather.description
  }

  if (tempHighEl) {
    tempHighEl.textContent = `${weather.tempHigh}°`
  }

  if (tempLowEl) {
    tempLowEl.textContent = `${weather.tempLow}°`
  }

  const forecast = await getHourlyForecast(latitude, longitude, tz, locale)

  if (forecast.length > 0) {
    renderForecastItems(forecast)
  } else {
    hideForecastCard()
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    locationEl = document.querySelector('[data-location]')
    temperatureEl = document.querySelector('[data-temperature]')
    weatherDescriptionEl = document.querySelector('[data-weather-description]')
    tempHighEl = document.querySelector('[data-temp-high]')
    tempLowEl = document.querySelector('[data-temp-low]')
    forecastItemsEl = document.querySelector('[data-forecast-items]')
    forecastCardEl = document.querySelector('[data-forecast-card]')

    const metadata = getMetadata()
    const [latitude, longitude] = metadata.coordinates

    timezone = await getTimeZone()
    locale = await getLocale()

    const locationName = await getCityName(latitude, longitude)
    if (locationEl) {
      locationEl.textContent = locationName
    }

    await updateWeatherDisplay(latitude, longitude, timezone)

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

  signalReady()
})
