import ical from 'ical.js'
import { GOOGLE_CALENDAR_API_BASE_URL, VIEW_MODE } from '@/constants'
import type { CalendarEvent, ViewMode } from '@/constants'
import { useSettingsStore } from '@/stores/settings'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import dayJsTimezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(dayJsTimezone)

// Type for raw Google Calendar API event
interface GoogleCalendarEvent {
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
}

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
  } else {
    // For weekly view, show full week starting from Sunday in the target timezone
    const weekStart = todayInTimezone.startOf('week')
    startDate = weekStart.toDate()
    endDate = weekStart.add(7, 'days').toDate()
  }

  return { startDate, endDate }
}

const formatEvents = (events: GoogleCalendarEvent[]): CalendarEvent[] => {
  const formattedEvents: CalendarEvent[] = events.map((event) => ({
    title: event.summary,
    startTime: event.start.dateTime || event.start.date || '',
    endTime: event.end.dateTime || event.end.date || '',
    isAllDay: !event.start.dateTime,
  }))

  return formattedEvents
}

export const fetchCalendarEventsFromAPI = async (
  accessToken: string,
): Promise<CalendarEvent[]> => {
  try {
    const { calendar_mode: viewMode, calendar_id: calendarId } =
      screenly.settings

    const { startDate, endDate } = getDateRangeForViewMode(viewMode as ViewMode)

    // Add timeMin and timeMax parameters to only fetch relevant events
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      orderBy: 'startTime',
      singleEvents: 'true',
      timeZone: 'UTC',
    })
    const calendarUrl =
      `${GOOGLE_CALENDAR_API_BASE_URL}/` +
      `${encodeURIComponent(calendarId as string)}/` +
      `events?${params.toString()}`

    const calendarResponse = await fetch(calendarUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const calendarData = await calendarResponse.json()

    const events = calendarData.items || []

    return formatEvents(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
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
    console.error('Error fetching calendar events:', error)
    return []
  }
}
