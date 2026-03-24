import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { CalendarEvent } from './event-layout.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export interface TimeSlot {
  time: string
  hour: number
}

// Once the current hour is past noon, lock the window to 1 PM so the view
// always shows 13:00–01:00 for the rest of the afternoon and evening.
// Before 1 PM the window simply starts at the current hour.
export function getWindowStartHour(currentHour: number): number {
  return currentHour > 12 ? 13 : currentHour
}

export function generateTimeSlots(
  startHour: number,
  now: Date,
  locale: string,
  timezone: string,
): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let i = 0; i < 12; i++) {
    const hour = (startHour + i) % 24
    const baseDate = dayjs(now)
      .tz(timezone)
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
        timeZone: timezone,
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

export function filterEventsForWindow(
  events: CalendarEvent[],
  dayDateStr: string,
  windowStartHour: number,
  timezone: string,
): CalendarEvent[] {
  const windowStart = dayjs
    .tz(`${dayDateStr}T00:00:00`, timezone)
    .add(windowStartHour, 'hour')
  const windowEnd = windowStart.add(12, 'hour')
  const windowStartMs = windowStart.valueOf()
  const windowEndMs = windowEnd.valueOf()

  return events.filter((event) => {
    if (event.isAllDay) return false
    const eventStart = dayjs(event.startTime).tz(timezone)
    if (eventStart.format('YYYY-MM-DD') !== dayDateStr) return false
    const eventStartMs = eventStart.valueOf()
    const eventEndMs = dayjs(event.endTime).tz(timezone).valueOf()
    return eventStartMs < windowEndMs && eventEndMs > windowStartMs
  })
}
