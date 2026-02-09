import { getSetting, getWeatherIcon } from '@screenly/edge-apps'
import { getMeasurementUnit } from './settings'

export interface CurrentWeatherData {
  temperature: number
  weatherId: number
  description: string
  iconSrc: string
  iconAlt: string
  tempHigh: number
  tempLow: number
  displayTemp: string
}

export interface ForecastItem {
  temperature: number
  iconSrc: string
  iconAlt: string
  timeLabel: string
  displayTemp: string
}

// Validate OpenWeatherMap API response
// Note: `cod` can be number (200) or string ("200") depending on the endpoint
function isValidWeatherResponse(data: {
  cod?: number | string
  main?: { temp?: number }
}): boolean {
  return (data.cod === 200 || data.cod === '200') && Boolean(data.main?.temp)
}

// Get current weather data
export async function getCurrentWeather(
  lat: number,
  lng: number,
  tz: string,
): Promise<CurrentWeatherData | null> {
  try {
    const apiKey = getSetting<string>('openweathermap_api_key')
    if (!apiKey) {
      return null
    }

    const unit = getMeasurementUnit()

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=${unit}&appid=${apiKey}`,
    )

    if (!response.ok) {
      console.warn(
        'Failed to get weather data: OpenWeatherMap API responded with',
        response.status,
        response.statusText,
      )
      return null
    }

    const data = await response.json()

    if (!isValidWeatherResponse(data)) {
      return null
    }

    const temperature = Math.round(data.main.temp)
    const tempHigh = Math.round(data.main.temp_max)
    const tempLow = Math.round(data.main.temp_min)
    const weatherId = data.weather?.[0]?.id ?? null

    if (!weatherId) {
      return null
    }

    const dt = Math.floor(Date.now() / 1000)
    const description = data.weather?.[0]?.description || ''
    const iconSrc = getWeatherIcon(weatherId, dt, tz)
    const iconAlt = description || 'Weather icon'

    const tempSymbol = unit === 'imperial' ? '°F' : '°C'

    return {
      temperature,
      weatherId,
      description: capitalizeFirstLetter(description),
      iconSrc,
      iconAlt,
      tempHigh,
      tempLow,
      displayTemp: `${temperature}${tempSymbol}`,
    }
  } catch (error) {
    console.warn('Failed to get weather data:', error)
    return null
  }
}

// Get hourly forecast (next 8 entries from 3-hour forecast)
export async function getHourlyForecast(
  lat: number,
  lng: number,
  tz: string,
  locale: string,
): Promise<ForecastItem[]> {
  try {
    const apiKey = getSetting<string>('openweathermap_api_key')
    if (!apiKey) {
      return []
    }

    const unit = getMeasurementUnit()

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=${unit}&cnt=8&appid=${apiKey}`,
    )

    if (!response.ok) {
      console.warn(
        'Failed to get forecast data: OpenWeatherMap API responded with',
        response.status,
        response.statusText,
      )
      return []
    }

    const data = await response.json()

    if (data.cod !== '200' || !Array.isArray(data.list)) {
      return []
    }

    return data.list.map(
      (
        item: {
          dt: number
          main: { temp: number }
          weather: { id: number; description: string }[]
        },
        index: number,
      ) => {
        const temperature = Math.round(item.main.temp)
        const weatherId = item.weather?.[0]?.id ?? 800
        const description = item.weather?.[0]?.description || 'Weather'
        const iconSrc = getWeatherIcon(weatherId, item.dt, tz)

        const timeLabel =
          index === 0
            ? 'NOW'
            : new Intl.DateTimeFormat(locale, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: tz,
              }).format(new Date(item.dt * 1000))

        return {
          temperature,
          iconSrc,
          iconAlt: description,
          timeLabel,
          displayTemp: `${temperature}°`,
        }
      },
    )
  } catch (error) {
    console.warn('Failed to get forecast data:', error)
    return []
  }
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
