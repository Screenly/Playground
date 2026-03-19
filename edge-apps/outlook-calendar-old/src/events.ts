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
  } else if (viewMode === VIEW_MODE.SCHEDULE) {
    // For schedule view, show full month starting from the first day of the month
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

export const fetchCalendarEventsFromMicrosoftAPI = async (
  accessToken: string,
): Promise<CalendarEvent[]> => {
  const { calendar_mode: viewMode } = screenly.settings
  const { startDate, endDate } = getDateRangeForViewMode(viewMode as ViewMode)

  // Fetch events from Microsoft Graph API
  const startDateTime = startDate.toISOString()
  const endDateTime = endDate.toISOString()
  // NOTE: start and end automatically include dateTime and timeZone properties
  const apiUrl = `https://graph.microsoft.com/v1.0/me/calendarview?$select=subject,start,end,isAllDay&startDateTime=${encodeURIComponent(startDateTime)}&endDateTime=${encodeURIComponent(endDateTime)}&$orderby=start/dateTime`

  let response
  let data

  try {
    response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(
        'Failed to fetch calendar events from Microsoft Graph API',
      )
    }

    data = await response.json()
  } catch {
    return []
  }

  if (!data.value) {
    return []
  }

  const events: CalendarEvent[] = []

  for (const item of data.value) {
    const isAllDay = !!item.isAllDay

    // Microsoft Graph API returns dateTime with timezone info
    // We need to parse them properly considering the timezone
    const startDateTime = item.start.dateTime
    const startTimeZone = item.start.timeZone
    const endDateTime = item.end.dateTime
    const endTimeZone = item.end.timeZone

    // Parse the datetime with its timezone and convert to UTC ISO string
    const startTime = dayjs.tz(startDateTime, startTimeZone).toISOString()
    const endTime = dayjs.tz(endDateTime, endTimeZone).toISOString()

    events.push({
      title: item.subject || 'Busy',
      startTime,
      endTime,
      isAllDay,
    })
  }

  return events
}
