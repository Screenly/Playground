import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test'
import {
  getSettings,
  getSetting,
  getSettingWithDefault,
  hasSetting,
  getTheme,
  getCorsProxyUrl,
  signalReady,
} from './settings'
import { setupScreenlyMock, resetScreenlyMock } from '../test/mock'

describe('settings utilities', () => {
  beforeEach(() => {
    setupScreenlyMock(
      {},
      {
        theme: 'dark',
        screenly_color_accent: '#FF0000',
        custom_setting: 'custom_value',
        enable_feature: 'true',
      },
    )
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  describe('getSettings', () => {
    test('should return complete settings object', () => {
      const settings = getSettings()
      expect(settings).toHaveProperty('theme', 'dark')
      expect(settings).toHaveProperty('screenly_color_accent', '#FF0000')
      expect(settings).toHaveProperty('custom_setting', 'custom_value')
    })
  })

  describe('getSetting', () => {
    test('should return specific setting value', () => {
      expect(getSetting('theme')).toBe('dark')
      expect(getSetting('screenly_color_accent')).toBe('#FF0000')
      expect(getSetting('custom_setting')).toBe('custom_value')
    })

    test('should return undefined for non-existent setting', () => {
      expect(getSetting('nonexistent')).toBeUndefined()
    })

    test('should work with type parameter', () => {
      const theme = getSetting<string>('theme')
      expect(theme).toBe('dark')

      const enableFeature = getSetting<string>('enable_feature')
      expect(enableFeature).toBe('true')
    })
  })

  describe('getSettingWithDefault', () => {
    test('should return setting value when it exists', () => {
      expect(getSettingWithDefault('theme', 'light')).toBe('dark')
      expect(getSettingWithDefault('custom_setting', 'default')).toBe(
        'custom_value',
      )
    })

    test('should return default value when setting does not exist', () => {
      expect(getSettingWithDefault('nonexistent', 'default')).toBe('default')
      expect(getSettingWithDefault('missing', 42)).toBe(42)
    })

    test('should parse numeric strings when default is a number', () => {
      setupScreenlyMock({}, { interval: '60', count: '100' })
      expect(getSettingWithDefault('interval', 30)).toBe(60)
      expect(getSettingWithDefault('count', 0)).toBe(100)
    })

    test('should return default when numeric string cannot be parsed', () => {
      setupScreenlyMock({}, { invalid_number: 'not_a_number' })
      expect(getSettingWithDefault('invalid_number', 42)).toBe(42)
    })

    test('should parse boolean strings when default is a boolean', () => {
      setupScreenlyMock({}, { enabled: 'true', disabled: 'false' })
      expect(getSettingWithDefault('enabled', false)).toBe(true)
      expect(getSettingWithDefault('disabled', true)).toBe(false)
    })

    test('should parse boolean strings case-insensitively', () => {
      setupScreenlyMock({}, { enabled_upper: 'TRUE', disabled_upper: 'FALSE' })
      expect(getSettingWithDefault('enabled_upper', false)).toBe(true)
      expect(getSettingWithDefault('disabled_upper', true)).toBe(false)
    })

    test('should return default when boolean string cannot be parsed', () => {
      setupScreenlyMock({}, { invalid_bool: 'maybe' })
      expect(getSettingWithDefault('invalid_bool', true)).toBe(true)
      expect(getSettingWithDefault('invalid_bool', false)).toBe(false)
    })

    test('should return value as-is for non-numeric and non-boolean defaults', () => {
      setupScreenlyMock({}, { color: '#FF0000' })
      expect(getSettingWithDefault('color', '#000000')).toBe('#FF0000')
    })
  })

  describe('hasSetting', () => {
    test('should return true for existing settings', () => {
      expect(hasSetting('theme')).toBe(true)
      expect(hasSetting('screenly_color_accent')).toBe(true)
      expect(hasSetting('custom_setting')).toBe(true)
    })

    test('should return false for non-existing settings', () => {
      expect(hasSetting('nonexistent')).toBe(false)
      expect(hasSetting('missing')).toBe(false)
    })
  })

  describe('getTheme', () => {
    test('should return theme value', () => {
      expect(getTheme()).toBe('dark')
    })

    test('should return undefined when theme is not set', () => {
      setupScreenlyMock({}, {})
      expect(getTheme()).toBeUndefined()
    })
  })

  describe('getCorsProxyUrl', () => {
    test('should return CORS proxy URL', () => {
      const url = getCorsProxyUrl()
      expect(url).toBe('http://localhost:8080')
    })
  })

  describe('signalReady', () => {
    test('should call signalReadyForRendering', () => {
      const mockFn = mock(() => {})
      screenly.signalReadyForRendering = mockFn

      signalReady()

      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
})
