import { formatTime, formatLocalizedDate } from '@screenly/edge-apps'

export interface TimeFormatResult {
  timeStr: string
  dateStr: string
  dateStrShort: string
}

export function formatDisplayTime(
  now: Date,
  locale: string,
  timezone: string,
): TimeFormatResult {
  const timeData = formatTime(now, locale, timezone, { hour12: undefined })
  const timeStr = timeData.dayPeriod
    ? `${timeData.hour}:${timeData.minute} ${timeData.dayPeriod}`
    : `${timeData.hour}:${timeData.minute}`

  const dateStr = formatLocalizedDate(now, locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  })

  const dateStrShort = formatLocalizedDate(now, locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: timezone,
  })

  return { timeStr, dateStr, dateStrShort }
}
