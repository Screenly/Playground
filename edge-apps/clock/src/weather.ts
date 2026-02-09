import { fetchCurrentWeatherData } from '@screenly/edge-apps'

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
  const raw = await fetchCurrentWeatherData(lat, lng, tz)
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
