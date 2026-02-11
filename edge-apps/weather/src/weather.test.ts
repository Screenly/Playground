import '@screenly/edge-apps/test'
import { describe, test, expect } from 'bun:test'
import { getMeasurementUnitByCountry } from '@screenly/edge-apps'
import { getCurrentWeather, getHourlyForecast } from './weather'

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

let mockGetSetting: <T>(key: string) => T | undefined
let mockGetWeatherIcon: (
  weatherId: number,
  timestamp: number,
  timezone: string,
) => string

const { mock } = await import('bun:test')

mock.module('@screenly/edge-apps', () => ({
  fetchCurrentWeatherData: (
    lat: number,
    lng: number,
    tz: string,
    unit: 'metric' | 'imperial',
  ) => mockFetchCurrentWeatherData(lat, lng, tz, unit),
  getSetting: <T>(key: string) => mockGetSetting<T>(key),
  getWeatherIcon: (weatherId: number, timestamp: number, timezone: string) =>
    mockGetWeatherIcon(weatherId, timestamp, timezone),
  formatTime: (
    _date: Date,
    _locale: string,
    _timezone: string,
    _options?: { hour12?: boolean },
  ) => ({
    hour: '12',
    minute: '00',
    second: '00',
    dayPeriod: 'AM',
    formatted: '12:00:00 AM',
  }),
}))

// Sample forecast API response based on real OpenWeatherMap data
const FORECAST_RESPONSE = {
  cod: '200',
  message: 0,
  cnt: 8,
  list: [
    {
      dt: 1770670800,
      main: { temp: 60.08 },
      weather: [{ id: 802, description: 'scattered clouds' }],
    },
    {
      dt: 1770681600,
      main: { temp: 59.72 },
      weather: [{ id: 803, description: 'broken clouds' }],
    },
    {
      dt: 1770692400,
      main: { temp: 56.71 },
      weather: [{ id: 804, description: 'overcast clouds' }],
    },
  ],
}

// Helper to set up mocks for forecast tests that require an API key
function setupForecastMocks() {
  mockGetSetting = <T>(key: string) => {
    if (key === 'openweathermap_api_key') return 'test-api-key' as T
    return undefined
  }
  mockGetWeatherIcon = () => '/static/images/icons/mostly-cloudy.svg'
}

// Helper to mock a fetch response
function mockFetchResponse(data: object, status = 200) {
  global.fetch = mock(async () => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

describe('getMeasurementUnitByCountry', () => {
  test('should return imperial for US', () => {
    expect(getMeasurementUnitByCountry('US')).toBe('imperial')
  })

  test('should return imperial for all Fahrenheit countries', () => {
    const fahrenheitCountries = ['US', 'BS', 'KY', 'LR', 'PW', 'FM', 'MH']
    fahrenheitCountries.forEach((country) => {
      expect(getMeasurementUnitByCountry(country)).toBe('imperial')
    })
  })

  test('should return metric for non-Fahrenheit countries', () => {
    expect(getMeasurementUnitByCountry('GB')).toBe('metric')
    expect(getMeasurementUnitByCountry('FR')).toBe('metric')
    expect(getMeasurementUnitByCountry('JP')).toBe('metric')
    expect(getMeasurementUnitByCountry('DE')).toBe('metric')
    expect(getMeasurementUnitByCountry('CA')).toBe('metric')
  })

  test('should return metric for empty string', () => {
    expect(getMeasurementUnitByCountry('')).toBe('metric')
  })
})

describe('getCurrentWeather', () => {
  test('should return null when fetchCurrentWeatherData returns null', async () => {
    mockFetchCurrentWeatherData = async () => null

    const result = await getCurrentWeather(
      37.39,
      -122.0812,
      'America/Los_Angeles',
      'imperial',
    )

    expect(result).toBeNull()
  })

  test('should return weather data with imperial units', async () => {
    mockFetchCurrentWeatherData = async () => ({
      temperature: 58,
      tempHigh: 61,
      tempLow: 55,
      weatherId: 800,
      description: 'clear sky',
      iconSrc: '/static/images/icons/clear.svg',
      iconAlt: 'clear sky',
      unit: 'imperial',
    })

    const result = await getCurrentWeather(
      37.39,
      -122.0812,
      'America/Los_Angeles',
      'imperial',
    )

    expect(result).not.toBeNull()
    expect(result?.temperature).toBe(58)
    expect(result?.tempHigh).toBe(61)
    expect(result?.tempLow).toBe(55)
    expect(result?.displayTemp).toBe('58°F')
    expect(result?.description).toBe('Clear sky')
  })

  test('should capitalize description', async () => {
    mockFetchCurrentWeatherData = async () => ({
      temperature: 15,
      tempHigh: 18,
      tempLow: 12,
      weatherId: 802,
      description: 'scattered clouds',
      iconSrc: '/static/images/icons/mostly-cloudy.svg',
      iconAlt: 'scattered clouds',
      unit: 'metric',
    })

    const result = await getCurrentWeather(
      37.39,
      -122.0812,
      'America/Los_Angeles',
      'metric',
    )

    expect(result?.description).toBe('Scattered clouds')
    expect(result?.displayTemp).toBe('15°C')
  })
})

describe('getHourlyForecast', () => {
  const mockCurrentWeather = {
    temperature: 58,
    tempHigh: 61,
    tempLow: 55,
    weatherId: 800,
    description: 'Clear sky',
    iconSrc: '/static/images/icons/clear.svg',
    iconAlt: 'clear sky',
    displayTemp: '58°F',
  }

  test('should return empty array when no API key', async () => {
    mockGetSetting = () => undefined

    const result = await getHourlyForecast(
      37.39,
      -122.0812,
      'America/Los_Angeles',
      'en',
      'imperial',
      mockCurrentWeather,
    )

    expect(result).toEqual([])
  })

  test('should prepend current weather as NOW and return forecast items', async () => {
    setupForecastMocks()
    mockFetchResponse(FORECAST_RESPONSE)

    const result = await getHourlyForecast(
      37.39,
      -122.0812,
      'America/Los_Angeles',
      'en',
      'imperial',
      mockCurrentWeather,
    )

    // Should have 1 (NOW) + 3 (forecast) = 4 items
    expect(result).toHaveLength(4)

    // First item should be current weather as NOW
    expect(result[0].temperature).toBe(58)
    expect(result[0].displayTemp).toBe('58°')
    expect(result[0].timeLabel).toBe('NOW')
    expect(result[0].timePeriod).toBeUndefined()
    expect(result[0].iconAlt).toBe('clear sky')

    // Subsequent items should be forecast data with time labels
    expect(result[1].temperature).toBe(60)
    expect(result[1].timeLabel).not.toBe('NOW')

    expect(result[2].temperature).toBe(60)
    expect(result[3].temperature).toBe(57)
  })

  test('should return empty array when API responds with error', async () => {
    setupForecastMocks()
    global.fetch = mock(async () => {
      return new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
      })
    })

    const result = await getHourlyForecast(
      37.39,
      -122.0812,
      'America/Los_Angeles',
      'en',
      'imperial',
      mockCurrentWeather,
    )

    expect(result).toEqual([])
  })
})
