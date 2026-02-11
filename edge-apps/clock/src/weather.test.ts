import '@screenly/edge-apps/test'
import { describe, test, expect } from 'bun:test'
import { getWeatherData } from './weather'

let mockFetchCurrentWeatherData: (
  lat: number,
  lng: number,
  tz: string,
  unit: 'metric' | 'imperial',
) => Promise<{
  temperature: number
  tempHigh: number
  tempLow: number
  weatherId: number
  description: string
  iconSrc: string
  iconAlt: string
  unit: 'metric' | 'imperial'
} | null>

let mockGetSettingWithDefault: <T>(key: string, defaultValue: T) => T

const { mock } = await import('bun:test')

// Import the real implementation to delegate to it in the mock
const { getMeasurementUnitByCountry: realGetMeasurementUnitByCountry } =
  await import('@screenly/edge-apps')

mock.module('@screenly/edge-apps', () => ({
  fetchCurrentWeatherData: (
    lat: number,
    lng: number,
    tz: string,
    unit: 'metric' | 'imperial',
  ) => mockFetchCurrentWeatherData(lat, lng, tz, unit),
  getSettingWithDefault: <T>(key: string, defaultValue: T) =>
    mockGetSettingWithDefault(key, defaultValue),
  getMeasurementUnitByCountry: (countryCode: string) =>
    realGetMeasurementUnitByCountry(countryCode),
}))

// Mock weather data objects
const metricWeatherData = {
  temperature: 19,
  tempHigh: 22,
  tempLow: 15,
  weatherId: 800,
  description: 'clear sky',
  iconSrc: '/static/images/icons/clear.svg',
  iconAlt: 'clear sky',
  unit: 'metric' as const,
}

const imperialWeatherData = {
  temperature: 66,
  tempHigh: 70,
  tempLow: 60,
  weatherId: 800,
  description: 'clear sky',
  iconSrc: '/static/images/icons/clear.svg',
  iconAlt: 'clear sky',
  unit: 'imperial' as const,
}

const zeroTempWeatherData = {
  temperature: 0,
  tempHigh: 3,
  tempLow: -2,
  weatherId: 800,
  description: 'clear sky',
  iconSrc: '/static/images/icons/clear.svg',
  iconAlt: 'clear sky',
  unit: 'metric' as const,
}

describe('getWeatherData', () => {
  test('should return null when fetchCurrentWeatherData returns null', async () => {
    mockGetSettingWithDefault = (key, defaultValue) => defaultValue
    mockFetchCurrentWeatherData = async () => null

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
      'GB',
    )

    expect(result).toBeNull()
  })

  test('should return weather data with metric units', async () => {
    mockGetSettingWithDefault = (key, defaultValue) => defaultValue
    mockFetchCurrentWeatherData = async () => metricWeatherData

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
      'GB',
    )

    expect(result?.temperature).toBe(19)
    expect(result?.displayText).toBe('19°C')
  })

  test('should return weather data with imperial units', async () => {
    mockGetSettingWithDefault = <T>(_key: string, _defaultValue: T): T =>
      'imperial' as T
    mockFetchCurrentWeatherData = async () => imperialWeatherData

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
      'US',
    )

    expect(result?.temperature).toBe(66)
    expect(result?.displayText).toBe('66°F')
  })

  test('should handle temperature of 0 correctly', async () => {
    mockGetSettingWithDefault = (key, defaultValue) => defaultValue
    mockFetchCurrentWeatherData = async () => zeroTempWeatherData

    const result = await getWeatherData(
      59.3293,
      18.0686,
      'Europe/Stockholm',
      'SE',
    )

    expect(result).not.toBeNull()
    expect(result?.temperature).toBe(0)
    expect(result?.displayText).toBe('0°C')
  })
})
