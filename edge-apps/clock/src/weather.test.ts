import '@screenly/edge-apps/test'
import { describe, test, expect } from 'bun:test'
import { getWeatherData } from './weather'

let mockFetchCurrentWeatherData: (
  lat: number,
  lng: number,
  tz: string,
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

const { mock } = await import('bun:test')

mock.module('@screenly/edge-apps', () => ({
  fetchCurrentWeatherData: (lat: number, lng: number, tz: string) =>
    mockFetchCurrentWeatherData(lat, lng, tz),
}))

describe('getWeatherData', () => {
  test('should return null when fetchCurrentWeatherData returns null', async () => {
    mockFetchCurrentWeatherData = async () => null

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
    )

    expect(result).toBeNull()
  })

  test('should return weather data with metric units', async () => {
    mockFetchCurrentWeatherData = async () => ({
      temperature: 19,
      tempHigh: 22,
      tempLow: 15,
      weatherId: 800,
      description: 'clear sky',
      iconSrc: '/static/images/icons/clear.svg',
      iconAlt: 'clear sky',
      unit: 'metric',
    })

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
    )

    expect(result?.temperature).toBe(19)
    expect(result?.displayText).toBe('19°C')
  })

  test('should return weather data with imperial units', async () => {
    mockFetchCurrentWeatherData = async () => ({
      temperature: 66,
      tempHigh: 70,
      tempLow: 60,
      weatherId: 800,
      description: 'clear sky',
      iconSrc: '/static/images/icons/clear.svg',
      iconAlt: 'clear sky',
      unit: 'imperial',
    })

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
    )

    expect(result?.temperature).toBe(66)
    expect(result?.displayText).toBe('66°F')
  })

  test('should handle temperature of 0 correctly', async () => {
    mockFetchCurrentWeatherData = async () => ({
      temperature: 0,
      tempHigh: 3,
      tempLow: -2,
      weatherId: 800,
      description: 'clear sky',
      iconSrc: '/static/images/icons/clear.svg',
      iconAlt: 'clear sky',
      unit: 'metric',
    })

    const result = await getWeatherData(59.3293, 18.0686, 'Europe/Stockholm')

    expect(result).not.toBeNull()
    expect(result?.temperature).toBe(0)
    expect(result?.displayText).toBe('0°C')
  })
})
