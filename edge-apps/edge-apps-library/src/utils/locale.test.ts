import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { getTimeZone, formatCoordinates, getLocale } from './locale'
import { setupScreenlyMock, resetScreenlyMock } from '../test/mock'

// eslint-disable-next-line max-lines-per-function
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

  // eslint-disable-next-line max-lines-per-function
  describe('getLocale', () => {
    test('should normalize single underscore in override_locale', async () => {
      setupScreenlyMock(
        {
          coordinates: [37.3861, -122.0839],
        },
        {
          override_locale: 'en_US',
        },
      )

      const locale = await getLocale()
      expect(locale).toBe('en-US')
    })

    test('should normalize multiple underscores in override_locale', async () => {
      setupScreenlyMock(
        {
          coordinates: [37.3861, -122.0839],
        },
        {
          override_locale: 'de_DE',
        },
      )

      const locale = await getLocale()
      expect(locale).toBe('de-DE')
    })

    test('should fallback to GPS detection for invalid override_locale', async () => {
      setupScreenlyMock(
        {
          coordinates: [35.6762, 139.6503], // Tokyo, Japan
        },
        {
          override_locale: 'invalid_locale_xyz',
        },
      )

      const locale = await getLocale()
      // Should fallback to GPS-based locale detection (ja for Japan)
      expect(locale.startsWith('ja')).toBe(true)
    })

    test('should reject malformed locale with trailing hyphen', async () => {
      setupScreenlyMock(
        {
          coordinates: [35.6762, 139.6503],
        },
        {
          override_locale: 'en-',
        },
      )

      const locale = await getLocale()
      // Should fallback to GPS-based locale detection
      expect(locale.startsWith('ja')).toBe(true)
    })

    test('should reject malformed locale where region code is invalid', async () => {
      setupScreenlyMock(
        {
          coordinates: [35.6762, 139.6503],
        },
        {
          override_locale: 'en-INVALID',
        },
      )

      const locale = await getLocale()
      // Should fallback to GPS-based locale detection (not use 'en')
      expect(locale.startsWith('ja')).toBe(true)
    })

    test('should reject locale with underscores and invalid parts', async () => {
      setupScreenlyMock(
        {
          coordinates: [35.6762, 139.6503],
        },
        {
          override_locale: 'en_US_INVALID_EXTRA',
        },
      )

      const locale = await getLocale()
      // Should fallback to GPS-based locale detection
      expect(locale.startsWith('ja')).toBe(true)
    })
  })
})
