import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { getTimeZone, formatCoordinates } from './locale'
import { setupScreenlyMock, resetScreenlyMock } from '../test/mock'

describe('locale utilities', () => {
  beforeEach(() => {
    setupScreenlyMock()
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  describe('getTimeZone', () => {
    test('should return timezone for coordinates', async () => {
      setupScreenlyMock({
        coordinates: [37.3861, -122.0839], // Mountain View, CA
      })

      const timezone = await getTimeZone()
      expect(timezone).toBe('America/Los_Angeles')
    })

    test('should return timezone for London coordinates', async () => {
      setupScreenlyMock({
        coordinates: [51.5074, -0.1278], // London, UK
      })

      const timezone = await getTimeZone()
      expect(timezone).toBe('Europe/London')
    })

    test('should return timezone for Tokyo coordinates', async () => {
      setupScreenlyMock({
        coordinates: [35.6762, 139.6503], // Tokyo, Japan
      })

      const timezone = await getTimeZone()
      expect(timezone).toBe('Asia/Tokyo')
    })

    test('should use valid override_timezone setting', async () => {
      setupScreenlyMock(
        {
          coordinates: [37.3861, -122.0839],
        },
        {
          override_timezone: 'Europe/Paris',
        },
      )

      const timezone = await getTimeZone()
      expect(timezone).toBe('Europe/Paris')
    })

    test('should fallback to GPS detection for invalid override_timezone', async () => {
      setupScreenlyMock(
        {
          coordinates: [51.5074, -0.1278],
        },
        {
          override_timezone: 'Invalid/Timezone',
        },
      )

      const timezone = await getTimeZone()
      expect(timezone).toBe('Europe/London')
    })

    test('should fallback to UTC when coordinates are missing', async () => {
      setupScreenlyMock({
        coordinates: undefined,
      })

      const timezone = await getTimeZone()
      expect(timezone).toBe('UTC')
    })
  })

  describe('formatCoordinates', () => {
    test('should format positive coordinates correctly', () => {
      const formatted = formatCoordinates([37.3861, -122.0839])
      expect(formatted).toBe('37.3861° N, 122.0839° W')
    })

    test('should format negative latitude correctly', () => {
      const formatted = formatCoordinates([-33.8688, 151.2093]) // Sydney
      expect(formatted).toBe('33.8688° S, 151.2093° E')
    })

    test('should format coordinates with proper precision', () => {
      const formatted = formatCoordinates([51.5074, -0.1278]) // London
      expect(formatted).toBe('51.5074° N, 0.1278° W')
    })

    test('should handle zero coordinates', () => {
      const formatted = formatCoordinates([0, 0])
      // Zero latitude is technically neither N nor S, but the function returns S
      // Zero longitude is technically neither E nor W, but the function returns W
      expect(formatted).toBe('0.0000° S, 0.0000° W')
    })
  })
})
