import dayjs from 'dayjs'
import type { CalendarEvent, EventLayout } from './event-layout.js'

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
): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let i = 0; i < 12; i++) {
    const hour = (startHour + i) % 24
    const baseDate = new Date(now)
    baseDate.setHours(hour, 0, 0, 0)
    let timeString: string
    try {
      timeString = baseDate.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
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
} {
  const windowSize = 12
  const windowEndHour = (windowStartHour + windowSize) % 24

  const startDt = dayjs(event.startTime).tz(tz)
  const endDt = dayjs(event.endTime).tz(tz)

  const startHour = startDt.hour() + startDt.minute() / 60
  const endHour = endDt.hour() + endDt.minute() / 60

  const normalizedWindowEnd =
    windowEndHour <= windowStartHour ? windowEndHour + 24 : windowEndHour
  const normalizedStart =
    startHour < windowStartHour ? startHour + 24 : startHour
  const normalizedEnd = endHour <= windowStartHour ? endHour + 24 : endHour

  const visibleStart = Math.max(normalizedStart, windowStartHour)
  const visibleEnd = Math.min(normalizedEnd, normalizedWindowEnd)

  const topPct = ((visibleStart - windowStartHour) / windowSize) * 100
  const heightPct = Math.max(
    ((visibleEnd - visibleStart) / windowSize) * 100,
    0.5,
  )

  const clippedTop = normalizedStart < windowStartHour
  const clippedBottom = normalizedEnd > normalizedWindowEnd

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

export function setAttribute(
  el: HTMLElement,
  name: string,
  value: string,
): void {
  const allowed = new Set([
    'class',
    'style',
    'data-day-index',
    'data-hour',
    'title',
    'aria-label',
  ])
  if (allowed.has(name) || name.startsWith('data-')) {
    el.setAttribute(name, value)
  }
}
