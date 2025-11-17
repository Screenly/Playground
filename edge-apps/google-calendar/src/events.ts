import { VIEW_MODE } from '@/constants'
import type { CalendarEvent, ViewMode } from '@/constants'
import { useSettingsStore } from '@/stores/settings'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import dayJsTimezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(dayJsTimezone)

const getDateRangeForViewMode = (viewMode: ViewMode) => {
  const settingsStore = useSettingsStore()
  const timezone = settingsStore.overrideTimezone || 'UTC'

  // Use dayjs to get current time in the target timezone, ignoring browser timezone
  const nowInTimezone = dayjs().tz(timezone)
  const todayInTimezone = nowInTimezone.startOf('day')

  let startDate: Date
  let endDate: Date

  if (viewMode === VIEW_MODE.DAILY) {
    // For daily view, start at midnight in the target timezone
    startDate = todayInTimezone.toDate()
    endDate = todayInTimezone.add(1, 'day').toDate()
  } else if (viewMode === VIEW_MODE.WEEKLY) {
    // For weekly view, show full week starting from Sunday in the target timezone
    const weekStart = todayInTimezone.startOf('week')
    startDate = weekStart.toDate()
    endDate = weekStart.add(7, 'days').toDate()
  } else if (viewMode === VIEW_MODE.MONTHLY) {
    // For monthly view, show full month starting from the first day of the month
    const monthStart = todayInTimezone.startOf('month')
    startDate = monthStart.toDate()
    endDate = monthStart.add(1, 'month').toDate()
  } else {
    // Default to daily view
    startDate = todayInTimezone.toDate()
    endDate = todayInTimezone.add(1, 'day').toDate()
  }

  return { startDate, endDate }
}

export const fetchCalendarEventsFromGoogleAPI = async (
  accessToken: string,
): Promise<CalendarEvent[]> => {
  const { calendar_mode: viewMode } = screenly.settings
  const { startDate, endDate } = getDateRangeForViewMode(viewMode as ViewMode)

  // Fetch events from Google Calendar API
  const settingsStore = useSettingsStore()
  const calendarId = settingsStore.calendarId
  const encodedCalendarId = encodeURIComponent(calendarId as string)
  const timeMin = startDate.toISOString()
  const timeMax = endDate.toISOString()
  const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events from Google Calendar API')
  }

  const data = await response.json()

  if (!data.items) {
    return []
  }

  const events: CalendarEvent[] = []

  for (const item of data.items) {
    const isAllDay = !!item.start.date
    const startTime = item.start.dateTime || item.start.date
    const endTime = item.end.dateTime || item.end.date

    events.push({
      title: item.summary || '(No title)',
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      isAllDay,
    })
  }

  return events
}
