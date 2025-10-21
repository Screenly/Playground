import ical from 'ical.js'
import { VIEW_MODE } from '@/constants'
import type { CalendarEvent, ViewMode } from '@/constants'
import { useSettingsStore } from '@/stores/settings'
import { getAccessToken } from '@/utils'
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

export const fetchCalendarEventsFromAPI = async (): Promise<
  CalendarEvent[]
> => {
  try {
    const { calendar_mode: viewMode } = screenly.settings
    const { startDate, endDate } = getDateRangeForViewMode(viewMode as ViewMode)

    console.log('Fetching access token...')
    // Get access token
    const accessToken = await getAccessToken()
    console.log('Access token retrieved:', accessToken ? 'Success' : 'Failed')

    // Fetch events from Google Calendar API
    const calendarId = 'primary'
    const timeMin = startDate.toISOString()
    const timeMax = endDate.toISOString()
    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`

    console.log('Fetching calendar events from Google Calendar API...')
    console.log('API URL:', apiUrl)
    console.log('Time range:', { timeMin, timeMax })

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    console.log('Google Calendar API response status:', response.status)

    if (!response.ok) {
      throw new Error(
        'Failed to fetch calendar events from Google Calendar API',
      )
    }

    const data = await response.json()
    console.log(
      'Calendar events data received:',
      data.items ? `${data.items.length} events` : 'No events',
    )

    const events: CalendarEvent[] = []

    if (data.items && Array.isArray(data.items)) {
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
    }

    console.log('Returning', events.length, 'calendar events')
    return events
  } catch (error) {
    console.error('Error fetching calendar events from API:', error)
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
