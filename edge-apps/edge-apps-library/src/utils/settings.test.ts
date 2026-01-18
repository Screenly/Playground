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

// eslint-disable-next-line max-lines-per-function
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

  // eslint-disable-next-line max-lines-per-function
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

    test('should parse special numeric values correctly', () => {
      setupScreenlyMock(
        {},
        {
          zero: '0',
          negative: '-1',
          decimal: '3.14',
          scientific: '1e5',
        },
      )
      expect(getSettingWithDefault('zero', 1)).toBe(0)
      expect(getSettingWithDefault('negative', 0)).toBe(-1)
      expect(getSettingWithDefault('decimal', 0)).toBe(3.14)
      expect(getSettingWithDefault('scientific', 0)).toBe(100000)
    })

    test('should return default when setting is an empty string (string default)', () => {
      setupScreenlyMock({}, { empty_string: '' })
      expect(getSettingWithDefault('empty_string', 'default_value')).toBe(
        'default_value',
      )
    })

    test('should return default when setting is an empty string and default is a number', () => {
      setupScreenlyMock({}, { empty_number: '' })
      expect(getSettingWithDefault<number>('empty_number', 67)).toBe(67)
    })

    test('should return default when setting is a whitespace-only string and default is a number', () => {
      setupScreenlyMock({}, { whitespace_number: '   ' })
      expect(getSettingWithDefault<number>('whitespace_number', 67)).toBe(67)
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

    test('should return default for numeric boolean-like strings', () => {
      setupScreenlyMock({}, { one: '1', zero: '0' })
      expect(getSettingWithDefault('one', true)).toBe(true)
      expect(getSettingWithDefault('zero', false)).toBe(false)
    })

    test('should return default for yes/no boolean-like strings', () => {
      setupScreenlyMock({}, { yes: 'yes', no: 'no' })
      expect(getSettingWithDefault('yes', true)).toBe(true)
      expect(getSettingWithDefault('no', false)).toBe(false)
    })

    test('should return default for on/off boolean-like strings', () => {
      setupScreenlyMock({}, { on: 'on', off: 'off' })
      expect(getSettingWithDefault('on', true)).toBe(true)
      expect(getSettingWithDefault('off', false)).toBe(false)
      expect(getSettingWithDefault('on', false)).toBe(false)
      expect(getSettingWithDefault('off', true)).toBe(true)
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
