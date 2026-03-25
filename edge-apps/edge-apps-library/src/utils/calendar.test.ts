import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test'
import { getDateRangeForViewMode } from './calendar'
import { CALENDAR_VIEW_MODE } from '../types/index'

const TIMEZONE = 'America/New_York'

// Fixed reference: 2026-03-18 (Wednesday) in America/New_York
const FIXED_DATE = new Date('2026-03-18T12:00:00-04:00')

describe('getDateRangeForViewMode', () => {
  let originalNow: () => number

  beforeEach(() => {
    originalNow = Date.now
    Date.now = mock(() => FIXED_DATE.getTime())
  })

  afterEach(() => {
    Date.now = originalNow
  })

  test('daily: spans exactly one day starting from today', () => {
    const { startDate, endDate } = getDateRangeForViewMode(
      CALENDAR_VIEW_MODE.DAILY,
      TIMEZONE,
    )

    expect(startDate.toISOString().slice(0, 10)).toBe('2026-03-18')
    expect(endDate.toISOString().slice(0, 10)).toBe('2026-03-19')

    const diffMs = endDate.getTime() - startDate.getTime()
    expect(diffMs).toBe(24 * 60 * 60 * 1000)
  })

  test('weekly: spans exactly 7 days starting from the beginning of the week', () => {
    const { startDate, endDate } = getDateRangeForViewMode(
      CALENDAR_VIEW_MODE.WEEKLY,
      TIMEZONE,
    )

    const diffMs = endDate.getTime() - startDate.getTime()
    expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000)

    // Week starts on Sunday (2026-03-15) for America/New_York
    expect(startDate.toISOString().slice(0, 10)).toBe('2026-03-15')
    expect(endDate.toISOString().slice(0, 10)).toBe('2026-03-22')
  })

  test('schedule: spans from the 1st of the current month to the 1st of the next month', () => {
    const { startDate, endDate } = getDateRangeForViewMode(
      CALENDAR_VIEW_MODE.SCHEDULE,
      TIMEZONE,
    )

    expect(startDate.toISOString().slice(0, 10)).toBe('2026-03-01')
    expect(endDate.toISOString().slice(0, 10)).toBe('2026-04-01')
  })

  test('endDate is always after startDate for every view mode', () => {
    for (const mode of [
      CALENDAR_VIEW_MODE.DAILY,
      CALENDAR_VIEW_MODE.WEEKLY,
      CALENDAR_VIEW_MODE.SCHEDULE,
    ]) {
      const { startDate, endDate } = getDateRangeForViewMode(mode, TIMEZONE)
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime())
    }
  })
})
