import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { getTimeZone, formatCoordinates, getLocale } from './locale'
import { setupScreenlyMock, resetScreenlyMock } from '../test/mock'

// Test coordinates
const COORDS = {
  LA: [37.3861, -122.0839] as [number, number],
  LONDON: [51.5074, -0.1278] as [number, number],
  TOKYO: [35.6762, 139.6503] as [number, number],
}

// Helper to test coordinate-to-timezone mapping
async function testCoordinateTimezone(
  coords: [number, number],
  expectedTimezone: string,
) {
  setupScreenlyMock({ coordinates: coords })
  const timezone = await getTimeZone()
  expect(timezone).toBe(expectedTimezone)
}

// eslint-disable-next-line max-lines-per-function
describe('locale utilities', () => {
  beforeEach(() => {
    setupScreenlyMock()
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  describe('getTimeZone', () => {
    test('should return timezone for coordinates', () =>
      testCoordinateTimezone(COORDS.LA, 'America/Los_Angeles'))

    test('should return timezone for London coordinates', () =>
      testCoordinateTimezone(COORDS.LONDON, 'Europe/London'))

    test('should return timezone for Tokyo coordinates', () =>
      testCoordinateTimezone(COORDS.TOKYO, 'Asia/Tokyo'))

    test('should use valid override_timezone setting', async () => {
      setupScreenlyMock(
        { coordinates: COORDS.LA },
        { override_timezone: 'Europe/Paris' },
      )

      const timezone = await getTimeZone()
      expect(timezone).toBe('Europe/Paris')
    })

    test('should fallback to GPS detection for invalid override_timezone', async () => {
      setupScreenlyMock(
        { coordinates: COORDS.LONDON },
        { override_timezone: 'Invalid/Timezone' },
      )

      const timezone = await getTimeZone()
      expect(timezone).toBe('Europe/London')
    })

    test('should fallback to UTC when coordinates are missing', async () => {
      setupScreenlyMock({ coordinates: undefined })

      const timezone = await getTimeZone()
      expect(timezone).toBe('UTC')
    })

    test('should use provided coordinates instead of metadata', async () => {
      setupScreenlyMock({ coordinates: COORDS.LA })

      const timezone = await getTimeZone(...COORDS.TOKYO)
      expect(timezone).toBe('Asia/Tokyo')
    })

    test('should respect override_timezone even with provided coordinates', async () => {
      setupScreenlyMock(
        { coordinates: COORDS.LA },
        { override_timezone: 'Europe/Paris' },
      )

      const timezone = await getTimeZone(...COORDS.TOKYO)
      expect(timezone).toBe('Europe/Paris')
    })

    test('should use metadata when only one coordinate provided', async () => {
      setupScreenlyMock({ coordinates: COORDS.LONDON })

      const timezone = await getTimeZone(COORDS.TOKYO[0], undefined)
      expect(timezone).toBe('Europe/London')
    })
  })

  describe('formatCoordinates', () => {
    test('should format positive coordinates correctly', () => {
      const formatted = formatCoordinates(COORDS.LA)
      expect(formatted).toBe('37.3861° N, 122.0839° W')
    })

    test('should format negative latitude correctly', () => {
      const formatted = formatCoordinates([-33.8688, 151.2093]) // Sydney
      expect(formatted).toBe('33.8688° S, 151.2093° E')
    })

    test('should format coordinates with proper precision', () => {
      const formatted = formatCoordinates(COORDS.LONDON)
      expect(formatted).toBe('51.5074° N, 0.1278° W')
    })

    test('should handle zero coordinates', () => {
      const formatted = formatCoordinates([0, 0])
      // Zero latitude is technically neither N nor S, but the function returns S
      // Zero longitude is technically neither E nor W, but the function returns W
      expect(formatted).toBe('0.0000° S, 0.0000° W')
    })
  })

  describe('getLocale', () => {
    test('should normalize single underscore in override_locale', async () => {
      setupScreenlyMock(
        { coordinates: COORDS.LA },
        { override_locale: 'en_US' },
      )

      const locale = await getLocale()
      expect(locale).toBe('en-US')
    })

    test('should normalize multiple underscores in override_locale', async () => {
      setupScreenlyMock(
        { coordinates: COORDS.LA },
        { override_locale: 'de_DE' },
      )

      const locale = await getLocale()
      expect(locale).toBe('de-DE')
    })

    test('should fallback to GPS detection for invalid override_locale', async () => {
      setupScreenlyMock(
        { coordinates: COORDS.TOKYO },
        { override_locale: 'invalid_locale_xyz' },
      )

      const locale = await getLocale()
      expect(locale.startsWith('ja')).toBe(true)
    })

    test('should reject malformed locale with trailing hyphen', async () => {
      setupScreenlyMock(
        { coordinates: COORDS.TOKYO },
        { override_locale: 'en-' },
      )

      const locale = await getLocale()
      expect(locale.startsWith('ja')).toBe(true)
    })

    test('should reject malformed locale where region code is invalid', async () => {
      setupScreenlyMock(
        { coordinates: COORDS.TOKYO },
        { override_locale: 'en-INVALID' },
      )

      const locale = await getLocale()
      expect(locale.startsWith('ja')).toBe(true)
    })

    test('should reject locale with underscores and invalid parts', async () => {
      setupScreenlyMock(
        { coordinates: COORDS.TOKYO },
        { override_locale: 'en_US_INVALID_EXTRA' },
      )

      const locale = await getLocale()
      expect(locale.startsWith('ja')).toBe(true)
    })
  })
})
