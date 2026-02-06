import '@screenly/edge-apps/test'
import { describe, test, expect } from 'bun:test'
import { getTimeData } from './time'

let mockFormatTime: (
  date: Date,
  locale: string,
  timezone: string,
) => {
  hour: string
  minute: string
  second: string
  dayPeriod?: string
  formatted: string
}

let mockFormatLocalizedDate: (
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
) => string

// Mock the module once at the top level
const { mock } = await import('bun:test')
mock.module('@screenly/edge-apps', () => ({
  formatTime: (date: Date, locale: string, timezone: string) =>
    mockFormatTime(date, locale, timezone),
  formatLocalizedDate: (
    date: Date,
    locale: string,
    options?: Intl.DateTimeFormatOptions,
  ) => mockFormatLocalizedDate(date, locale, options),
}))

describe('time', () => {
  describe('getTimeData', () => {
    test('should return formatted time data with 12-hour format', () => {
      mockFormatTime = () => ({
        hour: '09',
        minute: '30',
        second: '00',
        dayPeriod: 'AM',
        formatted: '09:30:00 AM',
      })
      mockFormatLocalizedDate = () => 'Monday, January 15, 2024'

      const testDate = new Date('2024-01-15T09:30:00Z')
      const result = getTimeData(testDate, 'en-US', 'America/New_York')

      expect(result.hour).toBe('09')
      expect(result.minute).toBe('30')
      expect(result.period).toBe('AM')
      expect(result.date).toBe('Monday, January 15, 2024')
    })

    test('should return formatted time data with 24-hour format', () => {
      mockFormatTime = () => ({
        hour: '14',
        minute: '45',
        second: '00',
        formatted: '14:45:00',
      })
      mockFormatLocalizedDate = () => 'Monday, January 15, 2024'

      const testDate = new Date('2024-01-15T14:45:00Z')
      const result = getTimeData(testDate, 'en-GB', 'Europe/London')

      expect(result.hour).toBe('14')
      expect(result.minute).toBe('45')
      expect(result.period).toBe('')
      expect(result.date).toBe('Monday, January 15, 2024')
    })

    test('should handle missing dayPeriod by returning empty string', () => {
      mockFormatTime = () => ({
        hour: '20',
        minute: '15',
        second: '00',
        formatted: '20:15:00',
      })
      mockFormatLocalizedDate = () => 'Tuesday, January 16, 2024'

      const testDate = new Date('2024-01-16T20:15:00Z')
      const result = getTimeData(testDate, 'de-DE', 'Europe/Berlin')

      expect(result.period).toBe('')
    })
  })
})
