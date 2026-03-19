import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { CalendarViewMode } from '../types/index.js'
import { CALENDAR_VIEW_MODE } from '../types/index.js'

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Compute the start and end dates for the given calendar view mode,
 * anchored to the current date in the specified timezone.
 */
export function getDateRangeForViewMode(
  viewMode: CalendarViewMode,
  tz: string,
): { startDate: Date; endDate: Date } {
  const todayInTimezone = dayjs(Date.now()).tz(tz).startOf('day')

  if (viewMode === CALENDAR_VIEW_MODE.DAILY) {
    return {
      startDate: todayInTimezone.toDate(),
      endDate: todayInTimezone.add(1, 'day').toDate(),
    }
  }

  if (viewMode === CALENDAR_VIEW_MODE.WEEKLY) {
    const weekStart = todayInTimezone.startOf('week')
    return {
      startDate: weekStart.toDate(),
      endDate: weekStart.add(7, 'days').toDate(),
    }
  }

  const monthStart = todayInTimezone.startOf('month')
  return {
    startDate: monthStart.toDate(),
    endDate: monthStart.add(1, 'month').toDate(),
  }
}
