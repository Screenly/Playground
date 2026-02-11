import {
  getSetting,
  getWeatherIcon,
  fetchCurrentWeatherData,
  formatTime,
  type MeasurementUnit,
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

// Countries that use Fahrenheit scale
// United States, Bahamas, Cayman Islands, Liberia, Palau,
// Federated States of Micronesia, Marshall Islands
const FAHRENHEIT_COUNTRIES = ['US', 'BS', 'KY', 'LR', 'PW', 'FM', 'MH']

/**
 * Determine measurement unit based on country code
 * @param countryCode - Two-character ISO country code (e.g., 'US', 'GB')
 * @returns 'imperial' for Fahrenheit countries, 'metric' for all others
 */
export function getMeasurementUnit(countryCode: string): MeasurementUnit {
  return FAHRENHEIT_COUNTRIES.includes(countryCode) ? 'imperial' : 'metric'
}

// Get current weather data
export async function getCurrentWeather(
  lat: number,
  lng: number,
  tz: string,
  unit: MeasurementUnit,
): Promise<CurrentWeatherData | null> {
  const raw = await fetchCurrentWeatherData(lat, lng, tz, unit)
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

// Get hourly forecast (current conditions + next 7 entries from 3-hour forecast)
export async function getHourlyForecast(
  lat: number,
  lng: number,
  tz: string,
  locale: string,
  unit: MeasurementUnit,
  currentWeather: CurrentWeatherData | null,
): Promise<ForecastItem[]> {
  try {
    const apiKey = getSetting<string>('openweathermap_api_key')
    if (!apiKey) {
      return []
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=${unit}&cnt=7&appid=${apiKey}`,
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

    const forecastItems: ForecastItem[] = data.list.map(
      (item: {
        dt: number
        main: { temp: number }
        weather: { id: number; description: string }[]
      }) => {
        const temperature = Math.round(item.main.temp)
        const weatherId = item.weather?.[0]?.id ?? 800
        const description = item.weather?.[0]?.description || 'Weather'
        const iconSrc = getWeatherIcon(weatherId, item.dt, tz)

        const time = formatTime(new Date(item.dt * 1000), locale, tz)
        const timeLabel = `${time.hour}:${time.minute}`
        const timePeriod = time.dayPeriod

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

    // Prepend current weather as "NOW" if available
    if (currentWeather) {
      const nowItem: ForecastItem = {
        temperature: currentWeather.temperature,
        iconSrc: currentWeather.iconSrc,
        iconAlt: currentWeather.iconAlt,
        timeLabel: 'NOW',
        timePeriod: undefined,
        displayTemp: `${currentWeather.temperature}°`,
      }
      return [nowItem, ...forecastItems]
    }

    return forecastItems
  } catch (error) {
    console.warn('Failed to get forecast data:', error)
    return []
  }
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
