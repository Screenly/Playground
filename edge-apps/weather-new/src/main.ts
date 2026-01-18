import {
  getLocale,
  getMetadata,
  getSetting,
  getTimeZone,
  signalReady,
  formatTime,
  isPortrait,
  getWeatherIconKey,
  getWeatherIconUrl,
} from '@screenly/edge-apps'
import '@screenly/edge-apps/components'
import './styles.css'

type ForecastItem = {
  dt: number
  main: { temp: number }
  weather: Array<{ id: number; description: string }>
}

type WeatherCache = {
  timezone: number
  list: ForecastItem[]
  timestamp: string
}

type LocationCache = {
  name: string
  country: string
  state?: string | null
  timestamp: string
}

const iconBase = '/assets/images/icons'

const countriesUsingFahrenheit = ['US', 'BS', 'KY', 'LR', 'PW', 'FM', 'MH']

class AppCache<T extends object> {
  private keyName: string
  private data: T | null = null

  constructor(keyName: string) {
    this.keyName = keyName
    const raw = localStorage.getItem(this.keyName)
    this.data = raw ? (JSON.parse(raw) as T) : null
  }

  set(data: T) {
    this.data = data
    localStorage.setItem(this.keyName, JSON.stringify(data))
  }

  get(): T | null {
    return this.data
  }
}

const cityEl = document.querySelector('[data-city]') as HTMLElement | null
const currentTempEl = document.querySelector('[data-current-temp]') as HTMLElement | null
const tempUnitEl = document.querySelector('[data-temp-unit]') as HTMLElement | null
const statusEl = document.querySelector('[data-weather-status]') as HTMLElement | null
const highTempEl = document.querySelector('[data-high-temp]') as HTMLElement | null
const lowTempEl = document.querySelector('[data-low-temp]') as HTMLElement | null
const forecastListEl = document.querySelector('[data-forecast-list]') as HTMLElement | null

function setText(el: HTMLElement | null, value: string) {
  if (el) {
    el.textContent = value
  }
}

function getCoordinates(): [number, number] {
  const overrideCoordinates = getSetting<string>('override_coordinates')
  if (overrideCoordinates) {
    const parts = overrideCoordinates.split(',').map((coord) => Number(coord.trim()))
    if (parts.length === 2 && parts.every((val) => Number.isFinite(val))) {
      return [parts[0], parts[1]]
    }
  }
  return getMetadata().coordinates || [0, 0]
}

async function getReverseGeocodingData(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<LocationCache> {
  const endpointUrl = 'https://api.openweathermap.org/geo/1.0/reverse'
  const queryParams = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    limit: '1',
    appid: apiKey,
  })

  const cache = new AppCache<LocationCache>('weather-location')

  try {
    const response = await fetch(`${endpointUrl}?${queryParams.toString()}`)
    const data = await response.json()

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No location data found')
    }

    const { name, country, state } = data[0] || {}
    if (!name || !country) {
      throw new Error('Incomplete location data')
    }

    const result = { name, country, state, timestamp: String(new Date()) }
    cache.set(result)
    return result
  } catch (error) {
    const cached = cache.get()
    if (cached?.name && cached?.country) {
      return cached
    }
    return {
      name: 'Unknown Location',
      country: 'N/A',
      state: null,
      timestamp: String(new Date()),
    }
  }
}

async function getWeatherApiData(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<WeatherCache> {
  const endpointUrl = 'https://api.openweathermap.org/data/2.5/forecast'
  const queryParams = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    units: 'metric',
    cnt: '10',
    appid: apiKey,
  })

  const cache = new AppCache<WeatherCache>('weather-forecast')

  try {
    const response = await fetch(`${endpointUrl}?${queryParams.toString()}`)
    const data = await response.json()

    if (data.cod !== '200') {
      throw new Error(data.message || 'Weather API error')
    }

    const result: WeatherCache = {
      timezone: data.city?.timezone ?? 0,
      list: data.list ?? [],
      timestamp: String(new Date()),
    }
    cache.set(result)
    return result
  } catch (error) {
    const cached = cache.get()
    if (cached?.list?.length) {
      return cached
    }
    return { timezone: 0, list: [], timestamp: String(new Date()) }
  }
}

function findCurrentWeatherItem(list: ForecastItem[]) {
  const currentUTC = Math.round(Date.now() / 1000)
  let itemIndex = 0

  while (itemIndex < list.length - 1 && list[itemIndex].dt < currentUTC) {
    itemIndex++
  }

  if (itemIndex > 0) {
    const timeDiffFromPrev = currentUTC - list[itemIndex - 1].dt
    const timeDiffFromCurrent = list[itemIndex].dt - currentUTC
    if (timeDiffFromPrev < timeDiffFromCurrent) {
      itemIndex = itemIndex - 1
    }
  }

  return itemIndex
}


function getTempScale(countryCode: string) {
  return countriesUsingFahrenheit.includes(countryCode) ? 'F' : 'C'
}

function convertTemp(scale: 'C' | 'F', tempCelsius: number) {
  if (scale === 'F') {
    return Math.round(tempCelsius * 1.8 + 32)
  }
  return Math.round(tempCelsius)
}



function renderForecast(
  list: ForecastItem[],
  startIndex: number,
  locale: string,
  timeZone: string,
  scale: 'C' | 'F',
) {
  if (!forecastListEl) return
  const windowSize = isPortrait() ? 5 : 8
  const windowList = list.slice(startIndex + 1, startIndex + 1 + windowSize)

  forecastListEl.innerHTML = ''
  windowList.forEach((item, index) => {
    const iconKey = getWeatherIconKey(item.weather[0]?.id ?? 800, item.dt, timeZone)
    const timeData = formatTime(new Date(item.dt * 1000), locale, timeZone)
    const formattedTime = timeData.dayPeriod
      ? `${timeData.hour}:${timeData.minute} ${timeData.dayPeriod}`
      : `${timeData.hour}:${timeData.minute}`
    const timeValue = index === 0 ? 'NOW' : formattedTime
    const tempValue = convertTemp(scale, item.main.temp)

    const itemEl = document.createElement('div')
    itemEl.className = 'forecast-item'
    itemEl.innerHTML = `
      <div class="forecast-temp">${tempValue}°</div>
      <img alt="Weather Icon" class="forecast-icon" src="${getWeatherIconUrl(iconKey, iconBase)}" />
      <div class="forecast-time">${timeValue}</div>
    `
    itemEl.dataset.id = String(index)
    forecastListEl.appendChild(itemEl)
  })
}

async function refreshWeather() {
  const apiKey = getSetting<string>('openweathermap_api_key')
  const [lat, lng] = getCoordinates()

  if (!apiKey) {
    setText(statusEl, 'Missing API key')
    setText(cityEl, getMetadata().location || 'Unknown Location')
    return
  }

  const [locationData, weatherData] = await Promise.all([
    getReverseGeocodingData(lat, lng, apiKey),
    getWeatherApiData(lat, lng, apiKey),
  ])

  const locale = await getLocale()
  const timeZone = await getTimeZone()

  const cityName = `${locationData.name}, ${locationData.country}`
  const tempScale = getTempScale(locationData.country)

  setText(cityEl, cityName)
  setText(tempUnitEl, '°')

  if (!weatherData.list.length) {
    setText(statusEl, 'Unavailable')
    return
  }

  const currentIndex = findCurrentWeatherItem(weatherData.list)
  const currentItem = weatherData.list[currentIndex]

  const description = currentItem.weather[0]?.description ?? 'Unknown'
  const currentTemp = convertTemp(tempScale, currentItem.main.temp)
  setText(currentTempEl, String(currentTemp))
  setText(statusEl, description)

  const nextSlice = weatherData.list.slice(currentIndex, currentIndex + 8)
  const temps = nextSlice.map((item) => convertTemp(tempScale, item.main.temp))
  const high = Math.max(...temps)
  const low = Math.min(...temps)
  setText(highTempEl, `↑ ${high}°`)
  setText(lowTempEl, `↓ ${low}°`)

  renderForecast(weatherData.list, currentIndex, locale, timeZone, tempScale)
}

document.addEventListener('DOMContentLoaded', async () => {
  await refreshWeather()

  setInterval(() => refreshWeather(), 15 * 60 * 1000)

  signalReady()
})

