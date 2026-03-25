import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { CalendarViewMode } from '../types/index.js'
import { CALENDAR_VIEW_MODE } from '../types/index.js'
import type { WeeklyCalendarView } from '../components/calendar-views/weekly-calendar-view/index.js'
import type { DailyCalendarView } from '../components/calendar-views/daily-calendar-view/index.js'
import type { ScheduleCalendarView } from '../components/calendar-views/schedule-calendar-view/index.js'
import type { CalendarEvent } from '../components/calendar-views/event-layout.js'
import { centerAutoScalerVertically } from './screen.js'
import { getLocale, getTimeZone } from './locale.js'
import { signalReady, getSettingWithDefault } from './settings.js'

dayjs.extend(utc)
dayjs.extend(timezone)

type CalendarViewElement =
  | WeeklyCalendarView
  | DailyCalendarView
  | ScheduleCalendarView

const EVENTS_REFRESH_INTERVAL = 10_000
const NOW_TICK_INTERVAL = 30_000

export async function initCalendarApp(
  activeEl: CalendarViewElement,
  fetchEvents: (timezone: string) => Promise<CalendarEvent[]>,
): Promise<void> {
  const scaler = document.querySelector('auto-scaler')
  scaler?.addEventListener('scalechange', centerAutoScalerVertically)
  window.addEventListener('resize', centerAutoScalerVertically)
  centerAutoScalerVertically()

  const timezone = await getTimeZone()
  const locale = await getLocale()
  activeEl.setAttribute('timezone', timezone)
  activeEl.setAttribute('locale', locale)

  const tick = () => {
    activeEl.now = new Date()
  }
  tick()
  setInterval(tick, NOW_TICK_INTERVAL)

  const refresh = async () => {
    try {
      const events = await fetchEvents(timezone)
      activeEl.events = events
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
    }
  }
  await refresh()
  setInterval(refresh, EVENTS_REFRESH_INTERVAL)

  signalReady()
}

/**
 * Read the `calendar_mode` setting and return the date range for the current
 * view, anchored to today in the given timezone.
 *
 * The legacy `'monthly'` mode is treated as `'schedule'` since the schedule
 * view replaced it.
 */
export function getCalendarDateRange(timezone: string): {
  startDate: Date
  endDate: Date
} {
  const viewMode = getSettingWithDefault<string>('calendar_mode', 'schedule')
  const mappedViewMode: CalendarViewMode =
    viewMode === 'monthly'
      ? CALENDAR_VIEW_MODE.SCHEDULE
      : (viewMode as CalendarViewMode)
  return getDateRangeForViewMode(mappedViewMode, timezone)
}

/**
 * Compute the start and end dates for the given calendar view mode,
 * anchored to the current date in the specified timezone.
 */
export function getDateRangeForViewMode(
  viewMode: CalendarViewMode,
  timezone: string,
): { startDate: Date; endDate: Date } {
  const todayInTimezone = dayjs(Date.now()).tz(timezone).startOf('day')

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
