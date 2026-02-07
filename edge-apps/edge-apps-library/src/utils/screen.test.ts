import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { isPortrait, isLandscape, getOrientation } from './screen'

function createMockMatchMedia(orientation: 'portrait' | 'landscape') {
  return (query: string) => {
    return {
      matches: query === `(orientation: ${orientation})`,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    } as MediaQueryList
  }
}

describe('screen utilities', () => {
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    // Save original matchMedia
    originalMatchMedia = window.matchMedia

    // Mock matchMedia
    window.matchMedia = createMockMatchMedia('portrait')
  })

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia
  })

  describe('isPortrait', () => {
    test('should return true when orientation is portrait', () => {
      window.matchMedia = createMockMatchMedia('portrait')
      expect(isPortrait()).toBe(true)
    })

    test('should return false when orientation is landscape', () => {
      window.matchMedia = createMockMatchMedia('landscape')
      expect(isPortrait()).toBe(false)
    })
  })

  describe('isLandscape', () => {
    test('should return true when orientation is landscape', () => {
      window.matchMedia = createMockMatchMedia('landscape')
      expect(isLandscape()).toBe(true)
    })

    test('should return false when orientation is portrait', () => {
      window.matchMedia = createMockMatchMedia('portrait')
      expect(isLandscape()).toBe(false)
    })
  })

  describe('getOrientation', () => {
    test('should return "portrait" when orientation is portrait', () => {
      window.matchMedia = createMockMatchMedia('portrait')
      expect(getOrientation()).toBe('portrait')
    })

    test('should return "landscape" when orientation is landscape', () => {
      window.matchMedia = createMockMatchMedia('landscape')
      expect(getOrientation()).toBe('landscape')
    })
  })
})
