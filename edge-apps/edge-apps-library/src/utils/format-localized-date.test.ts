import { describe, test, expect } from 'bun:test'
import { formatLocalizedDate } from './locale'

describe('formatLocalizedDate', () => {
  const testDate = new Date(2023, 11, 25) // December 25, 2023

  test('should format date correctly for different Latin locales', () => {
    const locales = [
      { locale: 'en-US', expected: 'December 25, 2023' },
      { locale: 'en-GB', expected: '25 December 2023' },
      { locale: 'de-DE', expected: '25. Dezember 2023' },
      { locale: 'ru-RU', expected: '25 декабря 2023 г.' },
    ]

    for (const { locale, expected } of locales) {
      const formatted = formatLocalizedDate(testDate, locale)
      expect(formatted).toBe(expected)
    }
  })

  test('should format date correctly for non-Latin locales', () => {
    const nonLatinLocales = [
      { locale: 'ja-JP', expected: '2023年12月25日' },
      { locale: 'zh-CN', expected: '2023年12月25日' },
      { locale: 'th-TH', expected: '25 ธันวาคม 2566' },
      { locale: 'hi-IN', expected: '25 दिसंबर 2023' },
    ]

    for (const { locale, expected } of nonLatinLocales) {
      const formatted = formatLocalizedDate(testDate, locale)
      expect(formatted).toBe(expected)
    }
  })

  test('should format date correctly with shorthand locale notations', () => {
    const shorthandLocales = [
      { locale: 'en', expected: 'Dec 25, 2023' },
      { locale: 'en-US', expected: 'Dec 25, 2023' },
      { locale: 'en-GB', expected: '25 Dec 2023' },
      { locale: 'de', expected: '25. Dez. 2023' },
      { locale: 'de-DE', expected: '25. Dez. 2023' },
      { locale: 'ja', expected: '2023年12月25日' },
      { locale: 'ja-JP', expected: '2023年12月25日' },
      { locale: 'zh', expected: '2023年12月25日' },
      { locale: 'zh-CN', expected: '2023年12月25日' },
      { locale: 'th', expected: '25 ธ.ค. 2566' },
      { locale: 'th-TH', expected: '25 ธ.ค. 2566' },
      { locale: 'hi', expected: '25 दिस॰ 2023' },
      { locale: 'hi-IN', expected: '25 दिस॰ 2023' },
    ]

    for (const { locale, expected } of shorthandLocales) {
      const formatted = formatLocalizedDate(testDate, locale, {
        month: 'short',
      })
      expect(formatted).toBe(expected)
    }
  })

  test('should respect custom options parameter', () => {
    const formatted = formatLocalizedDate(testDate, 'en-US', {
      year: '2-digit',
      month: 'short',
      day: '2-digit',
    })
    expect(formatted).toBe('Dec 25, 23')
  })

  test('should fallback to en-US for invalid locale', () => {
    const formatted = formatLocalizedDate(testDate, 'invalid-locale')
    expect(formatted).toBe('December 25, 2023')
  })

  test('should format date in correct timezone when specified', () => {
    // Feb 13, 17:45 UTC = Feb 13 in PST but Feb 14 in Sydney
    const testDate = new Date('2026-02-13T17:45:00Z')

    const sydneyDate = formatLocalizedDate(testDate, 'en-AU', {
      timeZone: 'Australia/Sydney',
    })

    expect(sydneyDate).toBe('14 February 2026')
  })
})
