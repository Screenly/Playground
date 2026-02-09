import {
  getSetting,
  getWeatherIcon,
  getMeasurementUnit,
  fetchCurrentWeatherData,
  formatTime,
} from '@screenly/edge-apps'

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
  timePeriod?: string
  displayTemp: string
}

// Get current weather data
export async function getCurrentWeather(
  lat: number,
  lng: number,
  tz: string,
): Promise<CurrentWeatherData | null> {
  const raw = await fetchCurrentWeatherData(lat, lng, tz)
  if (!raw) return null

  const tempSymbol = raw.unit === 'imperial' ? '°F' : '°C'

  return {
    temperature: raw.temperature,
    weatherId: raw.weatherId,
    description: capitalizeFirstLetter(raw.description),
    iconSrc: raw.iconSrc,
    iconAlt: raw.iconAlt,
    tempHigh: raw.tempHigh,
    tempLow: raw.tempLow,
    displayTemp: `${raw.temperature}${tempSymbol}`,
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

        let timeLabel: string
        let timePeriod: string | undefined

        if (index === 0) {
          timeLabel = 'NOW'
          timePeriod = undefined
        } else {
          const time = formatTime(new Date(item.dt * 1000), locale, tz)
          timeLabel = `${time.hour}:${time.minute}`
          timePeriod = time.dayPeriod
        }

        return {
          temperature,
          iconSrc,
          iconAlt: description,
          timeLabel,
          timePeriod,
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
