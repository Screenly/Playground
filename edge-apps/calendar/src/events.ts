import ical from 'ical.js'
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
        'Failed to fetch calendar events from Google Calendar API',
      )
    }

    data = await response.json()
  } catch {
    return []
  }

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
      title: item.subject || '(No title)',
      startTime,
      endTime,
      isAllDay,
    })
  }

  return events
}

export const fetchCalendarEventsFromICal = async (): Promise<
  CalendarEvent[]
> => {
  try {
    const { ical_url: icalUrl } = screenly.settings
    const corsProxy = screenly.cors_proxy_url
    const bypassCors = Boolean(
      JSON.parse(screenly.settings.bypass_cors as string),
    )
    const { calendar_mode: viewMode } = screenly.settings
    const icalUrlWithProxy = bypassCors
      ? `${corsProxy}/${icalUrl as string}`
      : (icalUrl as string)

    const response = await fetch(icalUrlWithProxy)

    if (!response.ok) {
      throw new Error('Failed to fetch iCal feed')
    }

    const icalData = await response.text()
    const jcalData = ical.parse(icalData)
    const vcalendar = new ical.Component(jcalData)
    const vevents = vcalendar.getAllSubcomponents('vevent')

    const { startDate, endDate } = getDateRangeForViewMode(viewMode as ViewMode)

    // Pre-calculate the timestamp for faster comparisons
    const startTimestamp = startDate.getTime()
    const endTimestamp = endDate.getTime()

    // Process events in larger chunks for better performance
    const chunkSize = 100
    const events: CalendarEvent[] = []

    for (let i = 0; i < vevents.length; i += chunkSize) {
      const chunk = vevents.slice(i, i + chunkSize)

      // Process chunk synchronously for better performance
      chunk.forEach((vevent) => {
        const event = new ical.Event(vevent)
        const eventStart = event.startDate.toJSDate()
        const eventTimestamp = eventStart.getTime()

        // Quick timestamp comparison before proceeding
        if (eventTimestamp >= endTimestamp || eventTimestamp < startTimestamp) {
          return
        }

        const eventEnd = event.endDate.toJSDate()

        events.push({
          title: event.summary,
          startTime: eventStart.toISOString(),
          endTime: eventEnd.toISOString(),
          isAllDay: event.startDate.isDate,
        })
      })

      // Only yield control every few chunks to reduce overhead
      if (i % (chunkSize * 3) === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }

    // Sort events once
    events.sort((a, b) => a.startTime.localeCompare(b.startTime))

    return events
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Error fetching calendar events: ${errorMessage}`)
  }
}
