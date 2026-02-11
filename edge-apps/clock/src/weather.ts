import {
  fetchCurrentWeatherData,
  getSettingWithDefault,
  getMeasurementUnitByCountry,
  type MeasurementUnit,
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
  const unitSetting = getSettingWithDefault<string>('unit', 'auto')
  let unit: MeasurementUnit

  if (unitSetting === 'auto') {
    // Auto-detect based on country when setting is explicitly 'auto'
    unit = getMeasurementUnitByCountry(countryCode)
  } else if (unitSetting === 'metric' || unitSetting === 'imperial') {
    // Only accept known valid units; this narrows the generic string safely
    unit = unitSetting
  } else {
    // Fallback for invalid/corrupted settings: auto-detect based on country
    unit = getMeasurementUnitByCountry(countryCode)
  }

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
