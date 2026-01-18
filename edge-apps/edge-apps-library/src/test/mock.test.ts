import { describe, test, expect, afterEach } from 'bun:test'
import {
  mockMetadata,
  mockSettings,
  createMockScreenly,
  setupScreenlyMock,
  resetScreenlyMock,
} from './mock'

const global = globalThis as Record<string, unknown>

// eslint-disable-next-line max-lines-per-function
describe('mock utilities', () => {
  afterEach(() => {
    resetScreenlyMock()
  })

  describe('mockMetadata', () => {
    test('should have default metadata values', () => {
      expect(mockMetadata).toHaveProperty('coordinates')
      expect(mockMetadata).toHaveProperty('hostname', 'test-hostname')
      expect(mockMetadata).toHaveProperty('location', 'Test Location')
      expect(mockMetadata).toHaveProperty('hardware', 'test-hardware')
      expect(mockMetadata).toHaveProperty('screenly_version', '1.0.0-test')
      expect(mockMetadata).toHaveProperty('screen_name', 'Test Screen')
      expect(mockMetadata).toHaveProperty('tags')
      expect(Array.isArray(mockMetadata.tags)).toBe(true)
    })
  })

  describe('mockSettings', () => {
    test('should have default settings values', () => {
      expect(mockSettings).toHaveProperty('screenly_color_accent', '#972EFF')
      expect(mockSettings).toHaveProperty('screenly_color_light', '#ADAFBE')
      expect(mockSettings).toHaveProperty('screenly_color_dark', '#454BD2')
      expect(mockSettings).not.toHaveProperty('theme')
    })
  })

  describe('createMockScreenly', () => {
    test('should create mock with default values', () => {
      const mock = createMockScreenly()

      expect(mock).toHaveProperty('signalReadyForRendering')
      expect(mock).toHaveProperty('metadata')
      expect(mock).toHaveProperty('settings')
      expect(mock).toHaveProperty('cors_proxy_url', 'http://localhost:8080')
      expect(typeof mock.signalReadyForRendering).toBe('function')
    })

    test('should merge custom metadata', () => {
      const mock = createMockScreenly({
        hostname: 'custom-hostname',
        location: 'Custom Location',
      })

      expect(mock.metadata.hostname).toBe('custom-hostname')
      expect(mock.metadata.location).toBe('Custom Location')
      expect(mock.metadata.hardware).toBe('test-hardware') // default value preserved
    })

    test('should merge custom settings', () => {
      const mock = createMockScreenly(
        {},
        {
          theme: 'dark',
          custom_setting: 'custom_value',
        },
      )

      expect(mock.settings.theme).toBe('dark')
      expect(mock.settings.custom_setting).toBe('custom_value')
      expect(mock.settings.screenly_color_accent).toBe('#972EFF') // default value preserved
    })
  })

  describe('setupScreenlyMock', () => {
    test('should setup global screenly object', () => {
      setupScreenlyMock()

      expect(global.screenly).toBeDefined()
      expect(global.screenly).toHaveProperty('metadata')
      expect(global.screenly).toHaveProperty('settings')
    })

    test('should setup with custom values', () => {
      setupScreenlyMock({ hostname: 'custom-host' }, { theme: 'dark' })

      const screenly = global.screenly as Record<string, unknown>
      expect(screenly.metadata).toHaveProperty('hostname', 'custom-host')
      expect(screenly.settings).toHaveProperty('theme', 'dark')
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
