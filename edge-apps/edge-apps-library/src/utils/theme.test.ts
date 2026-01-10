import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import {
  getPrimaryColor,
  getSecondaryColor,
  getThemeColors,
  applyThemeColors,
  setupTheme,
  DEFAULT_THEME_COLORS,
} from './theme'
import { setupScreenlyMock, resetScreenlyMock } from '../test/mock'

// eslint-disable-next-line max-lines-per-function
describe('theme utilities', () => {
  beforeEach(() => {
    setupScreenlyMock()
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  describe('getPrimaryColor', () => {
    test('should return default color when no accent color provided', () => {
      const color = getPrimaryColor()
      expect(color).toBe(DEFAULT_THEME_COLORS.primary)
    })

    test('should return default color when accent color is white', () => {
      const color = getPrimaryColor('#ffffff')
      expect(color).toBe(DEFAULT_THEME_COLORS.primary)
    })

    test('should return default color when accent color is white (uppercase)', () => {
      const color = getPrimaryColor('#FFFFFF')
      expect(color).toBe(DEFAULT_THEME_COLORS.primary)
    })

    test('should return provided accent color', () => {
      const color = getPrimaryColor('#FF0000')
      expect(color).toBe('#FF0000')
    })
  })

  describe('getSecondaryColor', () => {
    test('should return default secondary when theme is undefined', () => {
      const color = getSecondaryColor(undefined)
      expect(color).toBe(DEFAULT_THEME_COLORS.secondary)
    })

    test('should return light color when theme is light', () => {
      const color = getSecondaryColor('light', '#123456')
      expect(color).toBe('#123456')
    })

    test('should return dark color when theme is dark', () => {
      const color = getSecondaryColor('dark', undefined, '#654321')
      expect(color).toBe('#654321')
    })

    test('should return default when light color is white', () => {
      const color = getSecondaryColor('light', '#ffffff')
      expect(color).toBe('#adafbe')
    })

    test('should return default when dark color is white', () => {
      const color = getSecondaryColor('dark', undefined, '#FFFFFF')
      expect(color).toBe('#adafbe')
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

      expect(
        document.documentElement.style.getPropertyValue(
          '--theme-color-primary',
        ),
      ).toBe('#FF0000')
      expect(
        document.documentElement.style.getPropertyValue(
          '--theme-color-secondary',
        ),
      ).toBe('#00FF00')
      expect(
        document.documentElement.style.getPropertyValue(
          '--theme-color-tertiary',
        ),
      ).toBe('#0000FF')
      expect(
        document.documentElement.style.getPropertyValue(
          '--theme-color-background',
        ),
      ).toBe('#FFFFFF')
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
      expect(
        document.documentElement.style.getPropertyValue(
          '--theme-color-primary',
        ),
      ).toBe('#FF0000')
    })
  })
})
