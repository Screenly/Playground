import '@screenly/edge-apps/test'
import { describe, test, expect } from 'bun:test'
import { getMeasurementUnit, type MeasurementUnit } from './settings'

let mockGetSettingWithDefault: <T>(key: string, defaultValue: T) => T

// Mock the module once at the top level
const { mock } = await import('bun:test')
mock.module('@screenly/edge-apps', () => ({
  getSettingWithDefault: (key: string, defaultValue: unknown) =>
    mockGetSettingWithDefault(key, defaultValue),
}))

describe('settings', () => {
  describe('getMeasurementUnit', () => {
    test('should return metric when setting is explicitly set to metric', () => {
      mockGetSettingWithDefault = (): MeasurementUnit => 'metric'

      const result = getMeasurementUnit()

      expect(result).toBe('metric')
    })

    test('should return imperial when setting is set to imperial', () => {
      mockGetSettingWithDefault = (): MeasurementUnit => 'imperial'

      const result = getMeasurementUnit()

      expect(result).toBe('imperial')
    })

    test('should return metric by default when no setting is configured', () => {
      mockGetSettingWithDefault = <T>(_key: string, defaultValue: T): T =>
        defaultValue

      const result = getMeasurementUnit()

      expect(result).toBe('metric')
    })

    test('should handle imperial unit consistently across multiple calls', () => {
      mockGetSettingWithDefault = (): MeasurementUnit => 'imperial'

      const firstCall = getMeasurementUnit()
      const secondCall = getMeasurementUnit()

      expect(firstCall).toBe('imperial')
      expect(secondCall).toBe('imperial')
      expect(firstCall).toBe(secondCall)
    })
  })
})
