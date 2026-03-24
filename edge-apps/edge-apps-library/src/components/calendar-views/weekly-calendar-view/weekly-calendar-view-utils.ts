import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { CalendarEvent, EventLayout } from '../event-layout.js'
export type { TimeSlot } from '../calendar-window-utils.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export function getEventStyle(
  event: CalendarEvent,
  windowStartHour: number,
  layout: EventLayout,
  timezone: string,
): {
  topPct: number
  heightPct: number
  widthPct: number
  leftPct: number
  zIndex: number
  clippedTop: boolean
  clippedBottom: boolean
  isLastColumn: boolean
} {
  const windowSize = 12

  const startDt = dayjs(event.startTime).tz(timezone)
  const endDt = dayjs(event.endTime).tz(timezone)

  // Anchor window to the event's calendar date in the target timezone
  const windowStart = startDt.startOf('day').add(windowStartHour, 'hour')
  const windowEnd = windowStart.add(windowSize, 'hour')

  const startMs = startDt.valueOf()
  const endMs = endDt.valueOf()
  const windowStartMs = windowStart.valueOf()
  const windowEndMs = windowEnd.valueOf()
  const windowDurationMs = windowEnd.diff(windowStart)

  const visibleStartMs = Math.max(startMs, windowStartMs)
  const visibleEndMs = Math.min(endMs, windowEndMs)

  const topPct = ((visibleStartMs - windowStartMs) / windowDurationMs) * 100
  const heightPct = Math.max(
    ((visibleEndMs - visibleStartMs) / windowDurationMs) * 100,
    0.5,
  )

  const clippedTop = startMs < windowStartMs
  const clippedBottom = endMs > windowEndMs

  const columnWidth = 100 / layout.totalColumns
  const span = layout.columnSpan > 0 ? layout.columnSpan : 1
  const isLastColumn = layout.column + span >= layout.totalColumns
  const overlapBonus = isLastColumn ? 0 : columnWidth * 0.7
  const widthPct = columnWidth * span + overlapBonus
  const leftPct = layout.column * columnWidth
  const zIndex = 2 + layout.column

  return {
    topPct,
    heightPct,
    widthPct,
    leftPct,
    zIndex,
    clippedTop,
    clippedBottom,
    isLastColumn,
  }
}

export function formatEventStartTime(
  startTime: string,
  locale: string,
  timezone: string,
): string {
  try {
    const start = new Date(startTime)
    const opts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }
    return start.toLocaleTimeString(locale, opts)
  } catch {
    return ''
  }
}

export function formatEventTime(
  startTime: string,
  endTime: string,
  locale: string,
  timezone: string,
): string {
  try {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const opts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }
    return `${start.toLocaleTimeString(locale, opts)} – ${end.toLocaleTimeString(locale, opts)}`
  } catch {
    return ''
  }
}

const ALLOWED_ATTRIBUTES = new Set([
  'class',
  'style',
  'data-day-index',
  'data-hour',
  'title',
  'aria-label',
])

export function setAttribute(
  el: HTMLElement,
  name: string,
  value: string,
): void {
  if (ALLOWED_ATTRIBUTES.has(name) || name.startsWith('data-')) {
    el.setAttribute(name, value)
  }
}
