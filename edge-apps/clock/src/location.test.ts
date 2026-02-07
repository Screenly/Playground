import '@screenly/edge-apps/test'
import { describe, test, expect } from 'bun:test'
import { getCityName } from './location'

let mockGetSetting: <T>(key: string) => T | undefined
let mockGetMetadata: () => { location?: string; coordinates: [number, number] }

// Mock the module once at the top level
const { mock } = await import('bun:test')
mock.module('@screenly/edge-apps', () => ({
  getSetting: (key: string) => mockGetSetting(key),
  getMetadata: () => mockGetMetadata(),
}))

describe('location', () => {
  describe('getCityName', () => {
    test('should return city name from API when API key is provided', async () => {
      mockGetSetting = <T>(key: string): T | undefined => {
        if (key === 'openweathermap_api_key') {
          return 'test-api-key' as T
        }
        return undefined
      }

      global.fetch = mock(async () => {
        return new Response(
          JSON.stringify([
            {
              name: 'Mountain View',
              lat: 37.3893889,
              lon: -122.0832101,
              country: 'US',
              state: 'California',
            },
          ]),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      })

      const result = await getCityName(37.3893889, -122.0832101)

      expect(result).toBe('Mountain View, US')
    })

    test('should fallback to metadata location when no API key is provided', async () => {
      mockGetSetting = () => undefined
      mockGetMetadata = () => ({
        location: 'Default City',
        coordinates: [51.5074, -0.1278],
      })

      const result = await getCityName(51.5074, -0.1278)

      expect(result).toBe('Default City')
    })

    test('should fallback to metadata location when API request fails', async () => {
      mockGetSetting = <T>(key: string): T | undefined => {
        if (key === 'openweathermap_api_key') {
          return 'test-api-key' as T
        }
        return undefined
      }
      mockGetMetadata = () => ({
        location: 'Fallback City',
        coordinates: [51.5074, -0.1278],
      })

      global.fetch = mock(async () => {
        return new Response('Not Found', {
          status: 404,
          statusText: 'Not Found',
        })
      })

      const result = await getCityName(51.5074, -0.1278)

      expect(result).toBe('Fallback City')
    })

    test('should return Unknown Location when all fallbacks are unavailable', async () => {
      mockGetSetting = () => undefined
      mockGetMetadata = () => ({
        coordinates: [51.5074, -0.1278],
      })

      const result = await getCityName(51.5074, -0.1278)

      expect(result).toBe('Unknown Location')
    })
  })
})
