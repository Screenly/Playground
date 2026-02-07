import { getSetting, getWeatherIconKey } from '@screenly/edge-apps'
import { WEATHER_ICONS } from './weather-icons'
import { getMeasurementUnit } from './settings'

// Validate OpenWeatherMap API response
// Note: `cod` can be number (200) or string ("200") depending on the endpoint
export function isValidWeatherResponse(data: {
  cod?: number | string
  main?: { temp?: number }
}): boolean {
  return (data.cod === 200 || data.cod === '200') && Boolean(data.main?.temp)
}

export interface WeatherData {
  temperature: number
  weatherId: number
  iconSrc: string
  iconAlt: string
  displayText: string
}

// Get weather data (optional - requires OpenWeatherMap API key)
export async function getWeatherData(
  lat: number,
  lng: number,
  tz: string,
): Promise<WeatherData | null> {
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
    const weatherId = data.weather?.[0]?.id ?? null

    if (!weatherId) {
      return null
    }

    const iconKey = getWeatherIconKey(
      weatherId,
      Math.floor(Date.now() / 1000),
      tz,
    )
    const iconSrc = WEATHER_ICONS[iconKey] || WEATHER_ICONS['clear']
    const iconAlt = data.weather?.[0]?.description || 'Weather icon'

    const tempSymbol = unit === 'imperial' ? '°F' : '°C'
    const displayText = `${temperature}${tempSymbol}`

    return {
      temperature,
      weatherId,
      iconSrc,
      iconAlt,
      displayText,
    }
  } catch (error) {
    console.warn('Failed to get weather data:', error)
    return null
  }
}
