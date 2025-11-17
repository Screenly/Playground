import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'
import { addUTMParamsIf } from '@screenly/edge-apps'

describe('QR Code App UTM Parameters', () => {
  beforeEach(() => {
    setupScreenlyMock(
      {
        location: 'Test Store Location',
        hostname: 'qr-display-01',
      },
      {
        url: 'https://example.com/landing',
        enable_utm: 'true',
        headline: 'Scan Me!',
        call_to_action: 'Visit our website',
      }
    )
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  describe('UTM parameter generation', () => {
    test('should add all required UTM parameters when enabled', () => {
      const url = 'https://example.com/landing'
      const result = addUTMParamsIf(url, true)

      // Parse the URL to verify parameters
      const urlObj = new URL(result)

      expect(urlObj.searchParams.get('utm_source')).toBe('screenly')
      expect(urlObj.searchParams.get('utm_medium')).toBe('digital-signage')
      expect(urlObj.searchParams.get('utm_location')).toBe('Test Store Location')
      expect(urlObj.searchParams.get('utm_placement')).toBe('qr-display-01')
    })

    test('should not add UTM parameters when disabled', () => {
      const url = 'https://example.com/landing'
      const result = addUTMParamsIf(url, false)

      expect(result).toBe(url)
      expect(result).not.toContain('utm_')
    })

    test('should preserve existing query parameters', () => {
      const url = 'https://example.com/landing?promo=summer2024'
      const result = addUTMParamsIf(url, true)

      const urlObj = new URL(result)

      // Original parameter should be preserved
      expect(urlObj.searchParams.get('promo')).toBe('summer2024')

      // UTM parameters should be added
      expect(urlObj.searchParams.get('utm_source')).toBe('screenly')
      expect(urlObj.searchParams.get('utm_medium')).toBe('digital-signage')
    })

    test('should properly encode special characters in location', () => {
      setupScreenlyMock(
        {
          location: 'Store #5 - Main St & Broadway',
          hostname: 'display-lobby-01',
        },
        {}
      )

      const url = 'https://example.com/landing'
      const result = addUTMParamsIf(url, true)

      const urlObj = new URL(result)

      // Verify special characters are properly encoded and decoded
      expect(urlObj.searchParams.get('utm_location')).toBe('Store #5 - Main St & Broadway')
      expect(urlObj.searchParams.get('utm_placement')).toBe('display-lobby-01')
    })

    test('should handle URLs with fragments', () => {
      const url = 'https://example.com/landing#section'
      const result = addUTMParamsIf(url, true)

      // Note: The current implementation appends params to the URL string,
      // which means fragments get the params appended to them
      // This is a known limitation of simple string concatenation
      expect(result).toContain('landing#section?')
      expect(result).toContain('utm_source=screenly')
      expect(result).toContain('utm_medium=digital-signage')
    })

    test('should generate valid URLs that can be parsed', () => {
      const url = 'https://example.com/landing'
      const result = addUTMParamsIf(url, true)

      // Should not throw when parsing
      expect(() => new URL(result)).not.toThrow()

      const urlObj = new URL(result)
      expect(urlObj.protocol).toBe('https:')
      expect(urlObj.hostname).toBe('example.com')
      expect(urlObj.pathname).toBe('/landing')
    })

    test('should work with different screen configurations', () => {
      setupScreenlyMock(
        {
          location: 'Retail Store - Downtown',
          hostname: 'screen-checkout-03',
        },
        {}
      )

      const url = 'https://shop.example.com/products'
      const result = addUTMParamsIf(url, true)

      const urlObj = new URL(result)

      expect(urlObj.searchParams.get('utm_location')).toBe('Retail Store - Downtown')
      expect(urlObj.searchParams.get('utm_placement')).toBe('screen-checkout-03')
    })
  })

  describe('Integration with settings', () => {
    test('should respect enable_utm setting from Screenly', () => {
      setupScreenlyMock(
        {},
        {
          url: 'https://example.com/page',
          enable_utm: 'false',
        }
      )

      const url = screenly.settings.url as string
      const enableUtm = (screenly.settings.enable_utm as string) === 'true'
      const result = addUTMParamsIf(url, enableUtm)

      // Should not have UTM parameters when disabled
      expect(result).toBe('https://example.com/page')
    })

    test('should add UTM parameters when enable_utm is true', () => {
      setupScreenlyMock(
        {},
        {
          url: 'https://example.com/page',
          enable_utm: 'true',
        }
      )

      const url = screenly.settings.url as string
      const enableUtm = (screenly.settings.enable_utm as string) === 'true'
      const result = addUTMParamsIf(url, enableUtm)

      const urlObj = new URL(result)
      expect(urlObj.searchParams.has('utm_source')).toBe(true)
      expect(urlObj.searchParams.has('utm_medium')).toBe(true)
    })
  })
})

