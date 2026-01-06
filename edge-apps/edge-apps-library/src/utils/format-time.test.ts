import { describe, test, expect } from 'bun:test'
import { formatTime } from './locale'

// eslint-disable-next-line max-lines-per-function
describe('formatTime', () => {
  const testDate = new Date('2023-12-25T14:30:45Z')

  test('should format time correctly for en-US locale with hour12', () => {
    const result = formatTime(testDate, 'en-US', 'UTC', { hour12: true })
    expect(result).toHaveProperty('hour')
    expect(result).toHaveProperty('minute')
    expect(result).toHaveProperty('second')
    expect(result).toHaveProperty('dayPeriod')
    expect(result).toHaveProperty('formatted')
    expect(result.hour).toBe('02')
    expect(result.minute).toBe('30')
    expect(result.second).toBe('45')
    expect(result.dayPeriod).toBe('PM')
    expect(result.formatted).toBe('02:30:45 PM')
  })

  test('should format time correctly for en-US locale with hour24', () => {
    const result = formatTime(testDate, 'en-US', 'UTC', { hour12: false })
    expect(result.hour).toBe('14')
    expect(result.minute).toBe('30')
    expect(result.second).toBe('45')
    expect(result.dayPeriod).toBeUndefined()
    expect(result.formatted).toBe('14:30:45')
  })

  test('should format time correctly for de-DE locale (24-hour)', () => {
    const result = formatTime(testDate, 'de-DE', 'UTC')
    expect(result.hour).toBe('14')
    expect(result.minute).toBe('30')
    expect(result.second).toBe('45')
    expect(result.dayPeriod).toBeUndefined()
    expect(result.formatted).toBe('14:30:45')
  })

  test('should format time correctly for ja-JP locale (24-hour)', () => {
    const result = formatTime(testDate, 'ja-JP', 'UTC')
    expect(result.hour).toBe('14')
    expect(result.minute).toBe('30')
    expect(result.second).toBe('45')
    expect(result.dayPeriod).toBeUndefined()
    expect(result.formatted).toBe('14:30:45')
  })

  test('should format time correctly with different timezones', () => {
    const result = formatTime(testDate, 'en-US', 'America/Los_Angeles', {
      hour12: true,
    })
    expect(result).toHaveProperty('hour')
    expect(result).toHaveProperty('minute')
    expect(result).toHaveProperty('second')
    expect(result.minute).toBe('30')
    expect(result.second).toBe('45')
    // Los Angeles is UTC-8 in December, so 14:30 UTC becomes 06:30 AM
    expect(result.hour).toBe('06')
    expect(result.dayPeriod).toBe('AM')
    expect(result.formatted).toBe('06:30:45 AM')
  })

  test('should format time correctly with Tokyo timezone', () => {
    const result = formatTime(testDate, 'ja-JP', 'Asia/Tokyo')
    expect(result.minute).toBe('30')
    expect(result.second).toBe('45')
    // Tokyo is UTC+9, so 14:30 UTC becomes 23:30
    expect(result.hour).toBe('23')
    expect(result.formatted).toBe('23:30:45')
  })

  test('should format time correctly for hi-IN locale (hour12)', () => {
    const result = formatTime(testDate, 'hi-IN', 'UTC')
    expect(result.hour).toBe('02')
    expect(result.minute).toBe('30')
    expect(result.second).toBe('45')
    expect(result.dayPeriod).toBe('pm')
    expect(result.formatted).toMatch(/02:30:45\s+pm/)
  })

  test('should format time correctly for zh-CN locale (24-hour)', () => {
    const result = formatTime(testDate, 'zh-CN', 'UTC')
    expect(result.hour).toBe('一四')
    expect(result.minute).toBe('三〇')
    expect(result.second).toBe('四五')
    expect(result.dayPeriod).toBeUndefined()
    // Chinese locale uses Chinese numerals: 一四:三〇:四五
    expect(result.formatted).toBe('一四:三〇:四五')
  })

  test('should format time correctly for th-TH locale (24-hour)', () => {
    const result = formatTime(testDate, 'th-TH', 'UTC')
    expect(result.hour).toBe('๑๔')
    expect(result.minute).toBe('๓๐')
    expect(result.second).toBe('๔๕')
    expect(result.dayPeriod).toBeUndefined()
    // Thai locale uses Thai numerals: ๑๔:๓๐:๔๕
    expect(result.formatted).toBe('๑๔:๓๐:๔๕')
  })

  test('should format time correctly for ru-RU locale (24-hour)', () => {
    const result = formatTime(testDate, 'ru-RU', 'UTC')
    expect(result.hour).toBe('14')
    expect(result.minute).toBe('30')
    expect(result.second).toBe('45')
    expect(result.dayPeriod).toBeUndefined()
    expect(result.formatted).toBe('14:30:45')
  })

  test('should return formatted string property', () => {
    const result = formatTime(testDate, 'en-US', 'UTC', { hour12: true })
    expect(result.formatted).toBeDefined()
    expect(typeof result.formatted).toBe('string')
    // Verify formatted contains the time components
    expect(result.formatted).toContain('02')
    expect(result.formatted).toContain('30')
    expect(result.formatted).toContain('45')
    expect(result.formatted).toContain('PM')
    expect(result.formatted).toMatch(/02:30:45/)
    expect(result.formatted).toBe('02:30:45 PM')
  })

  test('should handle invalid timezone gracefully with fallback', () => {
    const originalWarn = console.warn
    console.warn = () => {} // Suppress expected warnings
    try {
      const result = formatTime(testDate, 'en-US', 'Invalid/Timezone')
      expect(result).toHaveProperty('hour')
      expect(result).toHaveProperty('minute')
      expect(result).toHaveProperty('second')
      expect(result).toHaveProperty('formatted')
    } finally {
      console.warn = originalWarn
    }
  })

  test('should handle locales with existing extensions', () => {
    // Test with a locale that has existing extensions
    // zh-CN-u-ca-chinese has calendar extension
    const result = formatTime(testDate, 'zh-CN-u-ca-chinese', 'UTC')
    expect(result).toHaveProperty('hour')
    expect(result).toHaveProperty('minute')
    expect(result).toHaveProperty('second')
    expect(result).toHaveProperty('formatted')
    // Should use Chinese numerals despite existing extension
    expect(result.hour).toBe('一四')
    expect(result.minute).toBe('三〇')
    expect(result.second).toBe('四五')
  })
})
