import '@screenly/edge-apps/test'
import { describe, test, expect } from 'bun:test'
import { getWeatherData, isValidWeatherResponse } from './weather'

let mockGetSetting: <T>(key: string) => T | undefined
let mockGetMeasurementUnit: () => 'metric' | 'imperial'
let mockGetWeatherIconKey: (
  weatherId: number,
  timestamp: number,
  timezone: string,
) => string

// Mock the modules once at the top level
const { mock } = await import('bun:test')

mock.module('@screenly/edge-apps', () => ({
  getSetting: (key: string) => mockGetSetting(key),
  getWeatherIconKey: (weatherId: number, timestamp: number, timezone: string) =>
    mockGetWeatherIconKey(weatherId, timestamp, timezone),
}))

mock.module('./weather-icons', () => ({
  WEATHER_ICONS: {
    clear: '/static/images/icons/clear.svg',
    cloudy: '/static/images/icons/cloudy.svg',
  },
}))

mock.module('./settings', () => ({
  getMeasurementUnit: () => mockGetMeasurementUnit(),
}))

// Helper to set up mocks for API key tests
function setupApiKeyMock() {
  mockGetSetting = <T>(key: string): T | undefined => {
    if (key === 'openweathermap_api_key') return 'test-api-key' as T
    return undefined
  }
}

// Helper to mock successful weather API response
function mockWeatherResponse(temp: number) {
  global.fetch = mock(async () => {
    return new Response(
      JSON.stringify({
        cod: 200,
        main: { temp },
        weather: [{ id: 800, description: 'clear sky' }],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  })
}

describe('isValidWeatherResponse', () => {
  test('should validate response with cod 200 and temperature', () => {
    expect(isValidWeatherResponse({ cod: 200, main: { temp: 20 } })).toBe(true)
    expect(isValidWeatherResponse({ cod: '200', main: { temp: 20 } })).toBe(
      true,
    )
  })

  test('should return false for invalid response', () => {
    expect(isValidWeatherResponse({ cod: 404, main: { temp: 20 } })).toBe(false)
    expect(isValidWeatherResponse({ cod: 200, main: {} })).toBe(false)
  })
})

describe('getWeatherData - API key validation', () => {
  test('should return null when no API key is provided', async () => {
    mockGetSetting = () => undefined

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
    )

    expect(result).toBeNull()
  })
})

describe('getWeatherData - unit conversion', () => {
  test('should return weather data with metric units', async () => {
    setupApiKeyMock()
    mockGetMeasurementUnit = () => 'metric'
    mockGetWeatherIconKey = () => 'clear'
    mockWeatherResponse(18.85)

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
    )

    expect(result?.temperature).toBe(19)
    expect(result?.displayText).toBe('19°C')
  })

  test('should return weather data with imperial units', async () => {
    setupApiKeyMock()
    mockGetMeasurementUnit = () => 'imperial'
    mockGetWeatherIconKey = () => 'clear'
    mockWeatherResponse(65.71)

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
    )

    expect(result?.temperature).toBe(66)
    expect(result?.displayText).toBe('66°F')
  })
})

describe('getWeatherData - error handling', () => {
  test('should return null when API fails', async () => {
    setupApiKeyMock()
    mockGetMeasurementUnit = () => 'metric'

    global.fetch = mock(async () => {
      return new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
      })
    })

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
    )

    expect(result).toBeNull()
  })

  test('should return null when response is invalid', async () => {
    setupApiKeyMock()
    mockGetMeasurementUnit = () => 'metric'

    global.fetch = mock(async () => {
      return new Response(
        JSON.stringify({ cod: 404, message: 'city not found' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })

    const result = await getWeatherData(
      37.3861,
      -122.0839,
      'America/Los_Angeles',
    )

    expect(result).toBeNull()
  })
})
