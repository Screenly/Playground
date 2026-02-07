import { formatTime, formatLocalizedDate } from '@screenly/edge-apps'

export interface TimeData {
  hour: string
  minute: string
  period: string
  date: string
}

// Update time display
export function getTimeData(
  now: Date,
  locale: string,
  timezone: string,
): TimeData {
  const timeData = formatTime(now, locale, timezone)

  // Format as "HH:MM" or "H:MM" depending on locale
  const timeStr = timeData.formatted.split(' ')[0] // Remove AM/PM if present
  const [hour, minute] = timeStr.split(':')

  const period = timeData.dayPeriod || ''

  const date = formatLocalizedDate(now, locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return {
    hour,
    minute,
    period,
    date,
  }
}
