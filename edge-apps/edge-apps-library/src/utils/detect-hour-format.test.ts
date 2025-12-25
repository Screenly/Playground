import { describe, test, expect } from 'bun:test'
import { detectHourFormat } from './locale'

describe('detectHourFormat', () => {
  test('should return hour12 for US locales', () => {
    const locales = ['en-US', 'en']
    for (const locale of locales) {
      const format = detectHourFormat(locale)
      expect(format).toBe('hour12')
    }
  })

  test('should return hour24 for most European locales', () => {
    const locales = [
      'en-GB',
      'de-DE',
      'de',
      'fr-FR',
      'fr',
      'es-ES',
      'es',
      'ru-RU',
      'ru',
    ]
    for (const locale of locales) {
      const format = detectHourFormat(locale)
      expect(format).toBe('hour24')
    }
  })

  test('should return hour24 for some Asian locales', () => {
    const locales = ['ja-JP', 'ja', 'zh-CN', 'zh']
    for (const locale of locales) {
      const format = detectHourFormat(locale)
      expect(format).toBe('hour24')
    }
  })

  test('should return hour24 for Thailand locale', () => {
    const locales = ['th-TH', 'th']
    for (const locale of locales) {
      const format = detectHourFormat(locale)
      expect(format).toBe('hour24')
    }
  })

  test('should return hour12 for India locale', () => {
    const locales = ['hi-IN', 'hi']
    for (const locale of locales) {
      const format = detectHourFormat(locale)
      expect(format).toBe('hour12')
    }
  })
})
