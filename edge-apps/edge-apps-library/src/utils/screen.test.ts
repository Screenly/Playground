import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test'
import {
  isPortrait,
  isLandscape,
  getOrientation,
  centerAutoScalerVertically,
} from './screen'

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

describe('centerAutoScalerVertically', () => {
  let originalQuerySelector: typeof document.querySelector
  let originalInnerHeight: number

  beforeEach(() => {
    originalQuerySelector = document.querySelector.bind(document)
    originalInnerHeight = window.innerHeight
  })

  afterEach(() => {
    document.querySelector = originalQuerySelector
    Object.defineProperty(window, 'innerHeight', {
      value: originalInnerHeight,
      writable: true,
    })
  })

  test('should do nothing when auto-scaler element is not found', () => {
    document.querySelector = mock(() => null)
    // Should not throw
    expect(() => centerAutoScalerVertically()).not.toThrow()
  })

  test('should set top offset to center the scaler vertically', () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 1080,
      writable: true,
    })

    const mockScaler = {
      getBoundingClientRect: () => ({ height: 600 }) as DOMRect,
      style: { top: '' },
    } as unknown as HTMLElement

    document.querySelector = mock(() => mockScaler)

    centerAutoScalerVertically()

    // offsetY = (1080 - 600) / 2 = 240
    expect(mockScaler.style.top).toBe('240px')
  })

  test('should clamp offset to 0 when scaler is taller than viewport', () => {
    Object.defineProperty(window, 'innerHeight', { value: 400, writable: true })

    const mockScaler = {
      getBoundingClientRect: () => ({ height: 600 }) as DOMRect,
      style: { top: '' },
    } as unknown as HTMLElement

    document.querySelector = mock(() => mockScaler)

    centerAutoScalerVertically()

    expect(mockScaler.style.top).toBe('0px')
  })
})
