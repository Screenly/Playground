/**
 * Weather Utilities
 * Functions for weather icon mapping and related utilities
 */

import { getSetting, type MeasurementUnit } from './settings.js'
import { getMetadata } from './metadata.js'

// Import weather icons
import clearIcon from '../assets/images/icons/clear.svg'
import clearNightIcon from '../assets/images/icons/clear-night.svg'
import cloudyIcon from '../assets/images/icons/cloudy.svg'
import drizzleIcon from '../assets/images/icons/drizzle.svg'
import fewdropsIcon from '../assets/images/icons/fewdrops.svg'
import fogIcon from '../assets/images/icons/fog.svg'
import hazeIcon from '../assets/images/icons/haze.svg'
import mostlyCloudyIcon from '../assets/images/icons/mostly-cloudy.svg'
import mostlyCloudyNightIcon from '../assets/images/icons/mostly-cloudy-night.svg'
import partiallyCloudyIcon from '../assets/images/icons/partially-cloudy.svg'
import partiallyCloudyNightIcon from '../assets/images/icons/partially-cloudy-night.svg'
import partlySunnyIcon from '../assets/images/icons/partlysunny.svg'
import rainyIcon from '../assets/images/icons/rainy.svg'
import rainNightIcon from '../assets/images/icons/rain-night.svg'
import sleetIcon from '../assets/images/icons/sleet.svg'
import sleetNightIcon from '../assets/images/icons/sleet-night.svg'
import snowIcon from '../assets/images/icons/snow.svg'
import thunderstormIcon from '../assets/images/icons/thunderstorm.svg'
import thunderstormNightIcon from '../assets/images/icons/thunderstorm-night.svg'
import windyIcon from '../assets/images/icons/windy.svg'
import chancesleetIcon from '../assets/images/icons/chancesleet.svg'

// Weather icon mapping
export const WEATHER_ICONS: Record<string, string> = {
  clear: clearIcon,
  'clear-night': clearNightIcon,
  cloudy: cloudyIcon,
  drizzle: drizzleIcon,
  fewdrops: fewdropsIcon,
  fog: fogIcon,
  haze: hazeIcon,
  'mostly-cloudy': mostlyCloudyIcon,
  'mostly-cloudy-night': mostlyCloudyNightIcon,
  'partially-cloudy': partiallyCloudyIcon,
  'partially-cloudy-night': partiallyCloudyNightIcon,
  partlysunny: partlySunnyIcon,
  rain: rainyIcon,
  rainy: rainyIcon,
  'rain-night': rainNightIcon,
  sleet: sleetIcon,
  'sleet-night': sleetNightIcon,
  snow: snowIcon,
  thunderstorm: thunderstormIcon,
  'thunderstorm-night': thunderstormNightIcon,
  windy: windyIcon,
  chancesleet: chancesleetIcon,
}

/**
 * Check if a given timestamp is during nighttime (8 PM - 5 AM) in the specified timezone
 */
export function isNightForTimestamp(dt: number, timeZone: string): boolean {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone,
    }).format(new Date(dt * 1000)),
  )
  return hour <= 5 || hour >= 20
}

/**
 * Get weather icon key based on OpenWeatherMap weather condition ID and time of day
 * @param id - OpenWeatherMap weather condition ID (e.g., 800 for clear sky)
 * @param dt - Unix timestamp in seconds
 * @param timeZone - IANA timezone string (e.g., 'America/New_York')
 * @returns Icon key string (e.g., 'clear', 'clear-night', 'rain', etc.)
 */
export function getWeatherIconKey(
  id: number,
  dt: number,
  timeZone: string,
): string {
  let icon: string = 'clear'
  const isNight = isNightForTimestamp(dt, timeZone)

  if (id >= 200 && id <= 299) {
    icon = 'thunderstorm'
  } else if (id >= 300 && id <= 399) {
    icon = 'drizzle'
  } else if (id >= 500 && id <= 599) {
    icon = 'rain'
  } else if (id >= 600 && id <= 699) {
    icon = 'snow'
  } else if (id >= 700 && id <= 799) {
    icon = 'haze'
  } else if (id === 800) {
    icon = 'clear'
  } else if (id === 801) {
    icon = 'partially-cloudy'
  } else if (id >= 802 && id <= 804) {
    icon = 'mostly-cloudy'
  }

  const nightOverrides: Record<string, string> = {
    clear: 'clear-night',
    rain: 'rain-night',
    'mostly-cloudy': 'mostly-cloudy-night',
    'partially-cloudy': 'partially-cloudy-night',
    thunderstorm: 'thunderstorm-night',
    sleet: 'sleet-night',
  }

  return isNight && nightOverrides[icon] ? nightOverrides[icon] : icon
}

/**
 * Get the full URL path for a weather icon
 * @param iconKey - Icon key from getWeatherIconKey (e.g., 'clear', 'rain-night')
 * @param iconBase - Base path for weather icons (default: '/assets/images/icons')
 * @returns Full URL path to the icon SVG file
 */
export function getWeatherIconUrl(
  iconKey: string,
  iconBase: string = '/assets/images/icons',
): string {
  const iconMap: Record<string, string> = {
    chancesleet: `${iconBase}/chancesleet.svg`,
    'clear-night': `${iconBase}/clear-night.svg`,
    clear: `${iconBase}/clear.svg`,
    cloudy: `${iconBase}/cloudy.svg`,
    drizzle: `${iconBase}/drizzle.svg`,
    fewdrops: `${iconBase}/fewdrops.svg`,
    fog: `${iconBase}/fog.svg`,
    haze: `${iconBase}/haze.svg`,
    'mostly-cloudy-night': `${iconBase}/mostly-cloudy-night.svg`,
    'mostly-cloudy': `${iconBase}/mostly-cloudy.svg`,
    'partially-cloudy-night': `${iconBase}/partially-cloudy-night.svg`,
    'partially-cloudy': `${iconBase}/partially-cloudy.svg`,
    partlysunny: `${iconBase}/partlysunny.svg`,
    'rain-night': `${iconBase}/rain-night.svg`,
    rain: `${iconBase}/rainy.svg`,
    'sleet-night': `${iconBase}/sleet-night.svg`,
    sleet: `${iconBase}/sleet.svg`,
    snow: `${iconBase}/snow.svg`,
    thunderstorm: `${iconBase}/thunderstorm.svg`,
    'thunderstorm-night': `${iconBase}/thunderstorm-night.svg`,
    windy: `${iconBase}/windy.svg`,
  }

  return iconMap[iconKey] || iconMap.clear
}

/**
 * Get weather icon source (imported SVG) based on weather condition ID and time
 * @param weatherId - OpenWeatherMap weather condition ID (e.g., 800 for clear sky)
 * @param dt - Unix timestamp in seconds
 * @param timeZone - IANA timezone string (e.g., 'America/New_York')
 * @returns Icon source string (Vite-imported SVG path)
 */
export function getWeatherIcon(
  weatherId: number,
  dt: number,
  timeZone: string,
): string {
  const iconKey = getWeatherIconKey(weatherId, dt, timeZone)
  return WEATHER_ICONS[iconKey] || WEATHER_ICONS['clear']
}

// --- Shared weather data utilities ---

/**
 * Validate OpenWeatherMap API response
 * Note: `cod` can be number (200) or string ("200") depending on the endpoint
 */
export function isValidWeatherResponse(data: {
  cod?: number | string
  main?: { temp?: number }
}): boolean {
  const temp = data.main?.temp
  return (
    (data.cod === 200 || data.cod === '200') &&
    typeof temp === 'number' &&
    Number.isFinite(temp)
  )
}

export interface CurrentWeatherRawData {
  temperature: number
  tempHigh: number
  tempLow: number
  weatherId: number
  description: string
  iconSrc: string
  iconAlt: string
  unit: MeasurementUnit
}

/**
 * Fetch current weather data from OpenWeatherMap API
 * Returns raw weather data that each app can map to its own interface
 * @param lat - Latitude
 * @param lng - Longitude
 * @param tz - Timezone
 * @param unit - Measurement unit ('metric' or 'imperial')
 */
export async function fetchCurrentWeatherData(
  lat: number,
  lng: number,
  tz: string,
  unit: MeasurementUnit = 'metric',
): Promise<CurrentWeatherRawData | null> {
  try {
    const apiKey = getSetting<string>('openweathermap_api_key')
    if (!apiKey) {
      return null
    }

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
    const tempHigh =
      typeof data.main.temp_max === 'number' &&
      Number.isFinite(data.main.temp_max)
        ? Math.round(data.main.temp_max)
        : temperature
    const tempLow =
      typeof data.main.temp_min === 'number' &&
      Number.isFinite(data.main.temp_min)
        ? Math.round(data.main.temp_min)
        : temperature
    const weatherId = data.weather?.[0]?.id ?? null

    if (!weatherId) {
      return null
    }

    const dt = Math.floor(Date.now() / 1000)
    const description = data.weather?.[0]?.description || ''
    const iconSrc = getWeatherIcon(weatherId, dt, tz)
    const iconAlt = description || 'Weather icon'

    return {
      temperature,
      tempHigh,
      tempLow,
      weatherId,
      description,
      iconSrc,
      iconAlt,
      unit,
    }
  } catch (error) {
    console.warn('Failed to get weather data:', error)
    return null
  }
}

/**
 * City information from reverse geocoding
 */
export interface CityInfo {
  cityName: string
  countryCode: string
}

/**
 * Get city information including name and country code from OpenWeatherMap reverse geocoding
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Object containing cityName and countryCode
 */
export async function getCityInfo(lat: number, lng: number): Promise<CityInfo> {
  try {
    const apiKey = getSetting<string>('openweathermap_api_key')
    if (!apiKey) {
      // Fallback to location from metadata if no API key
      return {
        cityName: getMetadata().location || 'Unknown Location',
        countryCode: '',
      }
    }

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`,
    )

    if (!response.ok) {
      console.warn(
        'Failed to get city info: OpenWeatherMap API responded with',
        response.status,
        response.statusText,
      )
      return {
        cityName: getMetadata().location || 'Unknown Location',
        countryCode: '',
      }
    }

    const data = await response.json()

    if (Array.isArray(data) && data.length > 0) {
      const { name, country } = data[0]
      if (name && country) {
        return {
          cityName: `${name}, ${country}`,
          countryCode: country,
        }
      }
    }
  } catch (error) {
    console.warn('Failed to get city info:', error)
  }

  // Fallback to location from metadata
  return {
    cityName: getMetadata().location || 'Unknown Location',
    countryCode: '',
  }
}

/**
 * Get city name from coordinates using OpenWeatherMap reverse geocoding
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns City name in format "City, Country" or fallback location
 */
export async function getCityName(lat: number, lng: number): Promise<string> {
  const { cityName } = await getCityInfo(lat, lng)
  return cityName
}
