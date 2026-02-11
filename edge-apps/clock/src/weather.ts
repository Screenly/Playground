import {
  fetchCurrentWeatherData,
  resolveMeasurementUnit,
} from '@screenly/edge-apps'

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
  countryCode: string,
): Promise<WeatherData | null> {
  // Get measurement unit from settings, or auto-detect based on location
  const unit = resolveMeasurementUnit(countryCode)

  const raw = await fetchCurrentWeatherData(lat, lng, tz, unit)
  if (!raw) return null

  const tempSymbol = raw.unit === 'imperial' ? '°F' : '°C'

  return {
    temperature: raw.temperature,
    weatherId: raw.weatherId,
    iconSrc: raw.iconSrc,
    iconAlt: raw.iconAlt,
    displayText: `${raw.temperature}${tempSymbol}`,
  }
}
