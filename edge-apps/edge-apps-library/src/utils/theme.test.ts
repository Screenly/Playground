import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test'
import {
  getPrimaryColor,
  getSecondaryColor,
  getThemeColors,
  applyThemeColors,
  setupTheme,
  fetchLogoImage,
  setupBrandingLogo,
  setupBranding,
  DEFAULT_THEME_COLORS,
} from './theme'
import { setupScreenlyMock, resetScreenlyMock } from '../test/mock'

// Helper constants
const PNG_MAGIC_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])
const JPEG_MAGIC_BYTES = new Uint8Array([0xff, 0xd8, 0xff])
const DEFAULT_SECONDARY = '#adafbe'
const PROXY_URL = 'https://proxy.example.com'
const TEST_LOGO_URL = 'https://example.com/logo.png'

// Helper functions
function createMockFetch(ok: boolean, bytes?: Uint8Array, status = 200) {
  return mock(() =>
    Promise.resolve({
      ok,
      status,
      blob: bytes ? () => Promise.resolve(new Blob([bytes])) : undefined,
    } as Response),
  )
}

function getCSSProperty(name: string): string {
  return document.documentElement.style.getPropertyValue(name)
}

function setupMockWithLogo(theme: 'light' | 'dark', logoUrl: string) {
  const logoKey =
    theme === 'light' ? 'screenly_logo_light' : 'screenly_logo_dark'
  setupScreenlyMock({}, { theme, [logoKey]: logoUrl }, PROXY_URL)
}

// eslint-disable-next-line max-lines-per-function
describe('theme utilities', () => {
  beforeEach(() => {
    setupScreenlyMock()
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  describe('getPrimaryColor', () => {
    const testCases = [
      {
        input: undefined,
        expected: DEFAULT_THEME_COLORS.primary,
        desc: 'no accent color provided',
      },
      {
        input: '#ffffff',
        expected: DEFAULT_THEME_COLORS.primary,
        desc: 'accent color is white',
      },
      {
        input: '#FFFFFF',
        expected: DEFAULT_THEME_COLORS.primary,
        desc: 'accent color is white (uppercase)',
      },
      { input: '#FF0000', expected: '#FF0000', desc: 'provided accent color' },
    ]

    testCases.forEach(({ input, expected, desc }) => {
      test(`should return ${desc === 'provided accent color' ? 'provided' : 'default'} color when ${desc}`, () => {
        expect(getPrimaryColor(input)).toBe(expected)
      })
    })
  })

  describe('getSecondaryColor', () => {
    const testCases = [
      {
        theme: undefined,
        light: undefined,
        dark: undefined,
        expected: DEFAULT_THEME_COLORS.secondary,
        desc: 'theme is undefined',
      },
      {
        theme: 'light' as const,
        light: '#123456',
        dark: undefined,
        expected: '#123456',
        desc: 'theme is light',
      },
      {
        theme: 'dark' as const,
        light: undefined,
        dark: '#654321',
        expected: '#654321',
        desc: 'theme is dark',
      },
      {
        theme: 'light' as const,
        light: '#ffffff',
        dark: undefined,
        expected: DEFAULT_SECONDARY,
        desc: 'light color is white',
      },
      {
        theme: 'dark' as const,
        light: undefined,
        dark: '#FFFFFF',
        expected: DEFAULT_SECONDARY,
        desc: 'dark color is white',
      },
    ]

    testCases.forEach(({ theme, light, dark, expected, desc }) => {
      test(`should return ${desc.includes('white') ? 'default' : light || dark || 'default secondary'} when ${desc}`, () => {
        expect(getSecondaryColor(theme, light, dark)).toBe(expected)
      })
    })
  })

  describe('getThemeColors', () => {
    test('should return theme colors from settings', () => {
      setupScreenlyMock(
        {},
        {
          screenly_color_accent: '#FF0000',
          theme: 'light',
          screenly_color_light: '#00FF00',
        },
      )

      const colors = getThemeColors()
      expect(colors.primary).toBe('#FF0000')
      expect(colors.secondary).toBe('#00FF00')
      expect(colors.tertiary).toBe(DEFAULT_THEME_COLORS.tertiary)
      expect(colors.background).toBe(DEFAULT_THEME_COLORS.background)
    })

    test('should use defaults when settings are not provided', () => {
      setupScreenlyMock({}, {})

      const colors = getThemeColors()
      expect(colors.primary).toBe(DEFAULT_THEME_COLORS.primary)
      expect(colors.secondary).toBe(DEFAULT_THEME_COLORS.secondary)
    })
  })

  describe('applyThemeColors', () => {
    test('should apply theme colors to CSS custom properties', () => {
      const colors = {
        primary: '#FF0000',
        secondary: '#00FF00',
        tertiary: '#0000FF',
        background: '#FFFFFF',
      }

      applyThemeColors(colors)

      expect(getCSSProperty('--theme-color-primary')).toBe('#FF0000')
      expect(getCSSProperty('--theme-color-secondary')).toBe('#00FF00')
      expect(getCSSProperty('--theme-color-tertiary')).toBe('#0000FF')
      expect(getCSSProperty('--theme-color-background')).toBe('#FFFFFF')
    })
  })

  describe('setupTheme', () => {
    test('should setup theme and return colors', () => {
      setupScreenlyMock(
        {},
        {
          screenly_color_accent: '#FF0000',
          theme: 'dark',
          screenly_color_dark: '#00FF00',
        },
      )

      const colors = setupTheme()

      expect(colors.primary).toBe('#FF0000')
      expect(colors.secondary).toBe('#00FF00')
      expect(getCSSProperty('--theme-color-primary')).toBe('#FF0000')
    })
  })

  describe('fetchLogoImage', () => {
    test('should fetch and process SVG image', async () => {
      const svgContent = '<?xml version="1.0"?><svg></svg>'

      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          blob: async () => {
            // Use jsdom's Blob constructor for proper FileReader compatibility
            const JSDOMWindow = global.window as typeof globalThis & {
              Blob: typeof Blob
            }
            const blob = new JSDOMWindow.Blob([svgContent], {
              type: 'text/plain',
            })
            // Add arrayBuffer method since jsdom Blob doesn't have it
            blob.arrayBuffer = async () => {
              const encoder = new TextEncoder()
              return encoder.encode(svgContent).buffer
            }
            return blob
          },
        } as Response),
      )

      const result = await fetchLogoImage('https://example.com/logo.svg')
      expect(result).toStartWith('data:image/svg+xml;base64,')
      // Verify the base64 content can be decoded back to the original
      const base64Part = result.split(',')[1]
      const decoded = atob(base64Part)
      expect(decoded).toBe(svgContent)
    })

    const imageTests = [
      {
        bytes: PNG_MAGIC_BYTES,
        type: 'PNG',
        url: 'https://example.com/logo.png',
      },
      {
        bytes: JPEG_MAGIC_BYTES,
        type: 'JPEG',
        url: 'https://example.com/logo.jpg',
      },
    ]

    imageTests.forEach(({ bytes, type, url }) => {
      test(`should return URL for ${type} image`, async () => {
        global.fetch = createMockFetch(true, bytes)
        expect(await fetchLogoImage(url)).toBe(url)
      })
    })

    test('should throw error for failed fetch', async () => {
      global.fetch = createMockFetch(false, undefined, 404)
      await expect(
        fetchLogoImage('https://example.com/not-found.png'),
      ).rejects.toThrow(/Failed to fetch image/)
    })

    test('should throw error for unknown image type', async () => {
      global.fetch = createMockFetch(
        true,
        new Uint8Array([0x00, 0x01, 0x02, 0x03]),
      )
      await expect(
        fetchLogoImage('https://example.com/unknown.bin'),
      ).rejects.toThrow('Unknown image type')
    })
  })

  describe('setupBrandingLogo', () => {
    test('should return empty string when no logo is configured', async () => {
      setupScreenlyMock({}, { theme: 'light' })
      expect(await setupBrandingLogo()).toBe('')
    })

    const logoTests = [
      { theme: 'light' as const, url: 'https://example.com/light-logo.png' },
      { theme: 'dark' as const, url: 'https://example.com/dark-logo.png' },
    ]

    logoTests.forEach(({ theme, url }) => {
      test(`should fetch ${theme} logo for ${theme} theme`, async () => {
        setupMockWithLogo(theme, url)
        global.fetch = createMockFetch(true, PNG_MAGIC_BYTES)
        expect(await setupBrandingLogo()).toContain('example.com')
      })
    })

    test('should fallback to direct URL when CORS proxy fails', async () => {
      setupMockWithLogo('light', TEST_LOGO_URL)

      let fetchCount = 0
      global.fetch = mock(() => {
        fetchCount++
        return Promise.resolve(
          fetchCount === 1
            ? ({ ok: false, status: 500 } as Response)
            : ({
                ok: true,
                blob: () => Promise.resolve(new Blob([PNG_MAGIC_BYTES])),
              } as Response),
        )
      })

      expect(await setupBrandingLogo()).toBe(TEST_LOGO_URL)
    })

    test('should return empty string when all fetch attempts fail', async () => {
      setupMockWithLogo('light', TEST_LOGO_URL)
      global.fetch = createMockFetch(false, undefined, 404)
      expect(await setupBrandingLogo()).toBe('')
    })
  })

  describe('setupBranding', () => {
    const brandingSettings = {
      screenly_color_accent: '#FF0000',
      theme: 'light' as const,
      screenly_color_light: '#00FF00',
      screenly_logo_light: TEST_LOGO_URL,
    }

    test('should setup complete branding with colors and logo', async () => {
      setupScreenlyMock({}, brandingSettings, PROXY_URL)
      global.fetch = createMockFetch(true, PNG_MAGIC_BYTES)

      const branding = await setupBranding()

      expect(branding.colors.primary).toBe('#FF0000')
      expect(branding.colors.secondary).toBe('#00FF00')
      expect(branding.logoUrl).toBeDefined()
    })

    test('should setup branding without logo when fetch fails', async () => {
      setupScreenlyMock({}, brandingSettings, PROXY_URL)
      global.fetch = createMockFetch(false, undefined, 404)

      const branding = await setupBranding()

      expect(branding.colors.primary).toBe('#FF0000')
      expect(branding.logoUrl).toBeUndefined()
    })
  })
})
