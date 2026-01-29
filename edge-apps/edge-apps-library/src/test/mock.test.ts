import { describe, test, expect, afterEach } from 'bun:test'
import {
  mockMetadata,
  mockSettings,
  createMockScreenly,
  setupScreenlyMock,
  resetScreenlyMock,
} from './mock'

const global = globalThis as Record<string, unknown>

// Helper function to check property
function expectProperty(obj: unknown, key: string, value?: unknown) {
  if (value !== undefined) {
    expect(obj).toHaveProperty(key, value)
  } else {
    expect(obj).toHaveProperty(key)
  }
}

// eslint-disable-next-line max-lines-per-function
describe('mock utilities', () => {
  afterEach(() => {
    resetScreenlyMock()
  })

  describe('mockMetadata', () => {
    test('should have default metadata values', () => {
      const expectedProperties = [
        { key: 'coordinates' },
        { key: 'hostname', value: 'test-hostname' },
        { key: 'location', value: 'Test Location' },
        { key: 'hardware', value: 'test-hardware' },
        { key: 'screenly_version', value: '1.0.0-test' },
        { key: 'screen_name', value: 'Test Screen' },
        { key: 'tags' },
      ]

      expectedProperties.forEach(({ key, value }) => {
        expectProperty(mockMetadata, key, value)
      })

      expect(Array.isArray(mockMetadata.tags)).toBe(true)
    })
  })

  describe('mockSettings', () => {
    test('should have default settings values', () => {
      const expectedProperties = [
        { key: 'screenly_color_accent', value: '#972EFF' },
        { key: 'screenly_color_light', value: '#ADAFBE' },
        { key: 'screenly_color_dark', value: '#454BD2' },
      ]

      expectedProperties.forEach(({ key, value }) => {
        expectProperty(mockSettings, key, value)
      })

      expect(mockSettings).not.toHaveProperty('theme')
    })
  })

  describe('createMockScreenly', () => {
    test('should create mock with default values', () => {
      const mock = createMockScreenly()

      const expectedProperties = [
        'signalReadyForRendering',
        'metadata',
        'settings',
      ]
      expectedProperties.forEach((key) => expectProperty(mock, key))

      expectProperty(mock, 'cors_proxy_url', 'http://localhost:8080')
      expect(typeof mock.signalReadyForRendering).toBe('function')
    })

    test('should have a callable signalReadyForRendering function', () => {
      const mock = createMockScreenly()
      expect(() => mock.signalReadyForRendering()).not.toThrow()
    })

    test('should merge custom metadata', () => {
      const customMetadata = {
        hostname: 'custom-hostname',
        location: 'Custom Location',
      }
      const mock = createMockScreenly(customMetadata)

      expect(mock.metadata.hostname).toBe('custom-hostname')
      expect(mock.metadata.location).toBe('Custom Location')
      expect(mock.metadata.hardware).toBe('test-hardware')
    })

    test('should merge custom settings', () => {
      const customSettings = {
        theme: 'dark',
        custom_setting: 'custom_value',
      }
      const mock = createMockScreenly({}, customSettings)

      expect(mock.settings.theme).toBe('dark')
      expect(mock.settings.custom_setting).toBe('custom_value')
      expect(mock.settings.screenly_color_accent).toBe('#972EFF')
    })
  })

  describe('setupScreenlyMock', () => {
    test('should setup global screenly object', () => {
      setupScreenlyMock()

      expect(global.screenly).toBeDefined()
      expectProperty(global.screenly, 'metadata')
      expectProperty(global.screenly, 'settings')
    })

    test('should setup with custom values', () => {
      setupScreenlyMock({ hostname: 'custom-host' }, { theme: 'dark' })

      const screenly = global.screenly as Record<string, unknown>
      expectProperty(screenly.metadata, 'hostname', 'custom-host')
      expectProperty(screenly.settings, 'theme', 'dark')
    })

    test('should return the mock object', () => {
      const mock = setupScreenlyMock()
      expect(mock).toBe(global.screenly)
    })
  })

  describe('resetScreenlyMock', () => {
    test('should remove global screenly object', () => {
      setupScreenlyMock()
      expect(global.screenly).toBeDefined()

      resetScreenlyMock()
      expect(global.screenly).toBeUndefined()
    })
  })
})
