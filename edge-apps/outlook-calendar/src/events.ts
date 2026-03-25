import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import dayjsTimezone from 'dayjs/plugin/timezone'
import {
  getSettingWithDefault,
  getCalendarDateRange,
} from '@screenly/edge-apps'
import type { CalendarEvent } from '@screenly/edge-apps'

dayjs.extend(utc)
dayjs.extend(dayjsTimezone)

// The Microsoft Graph /calendarview endpoint defaults to a page size of 10,
// which silently truncates results for busy weeks. We pass $top to ensure
// the full date range is returned.
const GRAPH_MAX_EVENTS = 100

export const fetchCalendarEventsFromMicrosoftAPI = async (
  accessToken: string,
  timezone: string,
): Promise<CalendarEvent[]> => {
  const { startDate, endDate } = getCalendarDateRange(timezone)

  const startDateTime = startDate.toISOString()
  const endDateTime = endDate.toISOString()
  const calendarId = getSettingWithDefault('calendar_id', '')
  const baseUrl = calendarId
    ? `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/calendarview`
    : 'https://graph.microsoft.com/v1.0/me/calendarview'
  const apiUrl = `${baseUrl}?$select=subject,start,end,isAllDay&startDateTime=${encodeURIComponent(startDateTime)}&endDateTime=${encodeURIComponent(endDateTime)}&$orderby=start/dateTime&$top=${GRAPH_MAX_EVENTS}`

  const response = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events from Microsoft Graph API')
  }

  const data = await response.json()

  if (!data.value) return []

  const events: CalendarEvent[] = []

  for (const item of data.value) {
    const isAllDay = !!item.isAllDay
    const startTime = dayjs
      .tz(item.start.dateTime, item.start.timeZone)
      .toISOString()
    const endTime = dayjs.tz(item.end.dateTime, item.end.timeZone).toISOString()

    events.push({
      id: item.id,
      title: item.subject || 'Busy',
      startTime,
      endTime,
      isAllDay,
    })
  }

  return events
}
