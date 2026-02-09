import './css/style.css'

import {
  getMetadata,
  getTimeZone,
  getLocale,
  signalReady,
  getSetting,
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

function getCoordinates(): [number, number] {
  const overrideCoordinates = getSetting<string>('override_coordinates')

  if (overrideCoordinates) {
    const coords = overrideCoordinates
      .split(',')
      .map((c) => parseFloat(c.trim()))
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return [coords[0], coords[1]]
    }
  }

  return getMetadata().coordinates
}

function showForecastCard() {
  if (forecastCardEl) {
    ;(forecastCardEl as HTMLElement).style.display = ''
  }
}

function hideForecastCard() {
  if (forecastCardEl) {
    ;(forecastCardEl as HTMLElement).style.display = 'none'
  }
}

function renderForecastItems(items: ForecastItem[]) {
  if (!forecastItemsEl) return

  const template = document.getElementById(
    'forecast-item-template',
  ) as HTMLTemplateElement
  if (!template) return

  // Clear existing items
  forecastItemsEl.innerHTML = ''

  for (const item of items) {
    const clone = template.content.cloneNode(true) as DocumentFragment
    const itemEl = clone.querySelector('.forecast-item')
    if (!itemEl) continue

    const tempEl = itemEl.querySelector('.forecast-item-temp')
    if (tempEl) tempEl.textContent = item.displayTemp

    const iconEl = itemEl.querySelector(
      '.forecast-item-icon',
    ) as HTMLImageElement
    if (iconEl) {
      iconEl.setAttribute('src', item.iconSrc)
      iconEl.setAttribute('alt', item.iconAlt)
    }

    const timeEl = itemEl.querySelector('.forecast-item-time')
    if (timeEl) timeEl.textContent = item.timeLabel

    forecastItemsEl.appendChild(clone)
  }
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
    showForecastCard()
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

    const [latitude, longitude] = getCoordinates()

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
