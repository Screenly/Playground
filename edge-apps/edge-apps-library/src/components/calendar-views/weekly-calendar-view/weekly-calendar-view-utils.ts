import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { CalendarEvent, EventLayout } from '../event-layout.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export interface TimeSlot {
  time: string
  hour: number
}

export function getWindowStartHour(currentHour: number): number {
  return currentHour > 12 ? 13 : currentHour
}

export function generateTimeSlots(
  startHour: number,
  now: Date,
  locale: string,
  tz: string,
): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let i = 0; i < 12; i++) {
    const hour = (startHour + i) % 24
    const baseDate = dayjs(now)
      .tz(tz)
      .hour(hour)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate()
    let timeString: string
    try {
      timeString = baseDate.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: tz,
      })
    } catch {
      const formattedHour = hour === 0 ? 12 : hour % 12 || 12
      const ampm = hour < 12 ? 'AM' : 'PM'
      timeString = `${formattedHour}:00 ${ampm}`
    }
    slots.push({ time: timeString, hour })
  }
  return slots
}

export function getEventStyle(
  event: CalendarEvent,
  windowStartHour: number,
  layout: EventLayout,
  tz: string,
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

  const startDt = dayjs(event.startTime).tz(tz)
  const endDt = dayjs(event.endTime).tz(tz)

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
  tz: string,
): string {
  try {
    const start = new Date(startTime)
    const opts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: tz,
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
  tz: string,
): string {
  try {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const opts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: tz,
    }
    return `${start.toLocaleTimeString(locale, opts)} – ${end.toLocaleTimeString(locale, opts)}`
  } catch {
    return ''
  }
}

export function filterEventsForWindow(
  events: CalendarEvent[],
  dayDateStr: string,
  windowStartHour: number,
  tz: string,
): CalendarEvent[] {
  const windowStart = dayjs
    .tz(`${dayDateStr}T00:00:00`, tz)
    .add(windowStartHour, 'hour')
  const windowEnd = windowStart.add(12, 'hour')
  const windowStartMs = windowStart.valueOf()
  const windowEndMs = windowEnd.valueOf()

  return events.filter((event) => {
    if (event.isAllDay) return false
    const eventStart = dayjs(event.startTime).tz(tz)
    if (eventStart.format('YYYY-MM-DD') !== dayDateStr) return false
    const eventStartMs = eventStart.valueOf()
    const eventEndMs = dayjs(event.endTime).tz(tz).valueOf()
    return eventStartMs < windowEndMs && eventEndMs > windowStartMs
  })
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
