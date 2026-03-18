import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import dayJsTimezone from 'dayjs/plugin/timezone'
import { getSettingWithDefault } from '@screenly/edge-apps'
import type { CalendarEvent, ViewMode } from './types.js'
import { VIEW_MODE } from './types.js'
import { fetchCalendarColors, getEventBackgroundColor } from './colors.js'

dayjs.extend(utc)
dayjs.extend(dayJsTimezone)

const getDateRangeForViewMode = (viewMode: ViewMode, timezone: string) => {
  const nowInTimezone = dayjs().tz(timezone)
  const todayInTimezone = nowInTimezone.startOf('day')

  let startDate: Date
  let endDate: Date

  if (viewMode === VIEW_MODE.DAILY) {
    startDate = todayInTimezone.toDate()
    endDate = todayInTimezone.add(1, 'day').toDate()
  } else if (viewMode === VIEW_MODE.WEEKLY) {
    const weekStart = todayInTimezone.startOf('week')
    startDate = weekStart.toDate()
    endDate = weekStart.add(7, 'days').toDate()
  } else {
    const monthStart = todayInTimezone.startOf('month')
    startDate = monthStart.toDate()
    endDate = monthStart.add(1, 'month').toDate()
  }

  return { startDate, endDate }
}

export const fetchCalendarEventsFromGoogleAPI = async (
  accessToken: string,
  timezone: string,
): Promise<CalendarEvent[]> => {
  const viewMode = getSettingWithDefault('calendar_mode', 'schedule')
  const mappedViewMode: ViewMode =
    viewMode === 'monthly' ? VIEW_MODE.SCHEDULE : (viewMode as ViewMode)
  const { startDate, endDate } = getDateRangeForViewMode(
    mappedViewMode,
    timezone,
  )

  let colors = null
  try {
    colors = await fetchCalendarColors(accessToken)
  } catch (error) {
    console.warn('Failed to fetch calendar colors, using defaults:', error)
  }

  const calendarId = getSettingWithDefault('calendar_id', 'primary')
  const encodedCalendarId = encodeURIComponent(calendarId)
  const timeMin = startDate.toISOString()
  const timeMax = endDate.toISOString()
  const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`

  const response = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events from Google Calendar API')
  }

  const data = await response.json()

  if (!data.items) return []

  const events: CalendarEvent[] = []

  for (const item of data.items) {
    const isAllDay = !!item.start.date
    const startTime = item.start.dateTime || item.start.date
    const endTime = item.end.dateTime || item.end.date
    const colorId = item.colorId
    const backgroundColor = getEventBackgroundColor(colorId, colors)

    events.push({
      title: item.summary || 'Busy',
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      isAllDay,
      colorId,
      backgroundColor,
    })
  }

  return events
}
