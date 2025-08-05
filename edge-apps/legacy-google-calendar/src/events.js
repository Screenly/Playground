/* global screenly */

import ical from 'ical.js'
import {
  GOOGLE_CALENDAR_API_BASE_URL,
  VIEW_MODE,
  DAILY_VIEW_EVENT_LIMIT
} from '@/constants'

const getDateRangeForViewMode = (viewMode) => {
  const today = new Date()
  const startDate = new Date(today)
  const endDate = new Date(today)

  if (viewMode === VIEW_MODE.DAILY) {
    // For daily view, start from current hour today
    endDate.setDate(endDate.getDate() + 1)
    endDate.setHours(0, 0, 0, 0)
  } else {
    // For weekly view, show full week
    const currentDay = startDate.getDay()
    startDate.setDate(startDate.getDate() - currentDay)
    startDate.setHours(0, 0, 0, 0)

    endDate.setTime(startDate.getTime())
    endDate.setDate(startDate.getDate() + 7)
  }

  return { startDate, endDate }
}

const formatEvents = (events, viewMode) => {
  const formattedEvents = events.map((event) => ({
    title: event.summary,
    startTime: event.start.dateTime || event.start.date,
    endTime: event.end.dateTime || event.end.date,
    isAllDay: !event.start.dateTime
  }))

  return viewMode === VIEW_MODE.DAILY
    ? formattedEvents.slice(0, DAILY_VIEW_EVENT_LIMIT)
    : formattedEvents
}

export const fetchCalendarEventsFromAPI = async (accessToken) => {
  try {
    const {
      calendar_mode: viewMode,
      calendar_id: calendarId
    } = screenly.settings

    const { startDate, endDate } = getDateRangeForViewMode(viewMode)

    // Add timeMin and timeMax parameters to only fetch relevant events
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      orderBy: 'startTime',
      singleEvents: 'true',
      timeZone: 'UTC'
    })
    const calendarUrl = `${GOOGLE_CALENDAR_API_BASE_URL}/` +
      `${encodeURIComponent(calendarId)}/` +
      `events?${params.toString()}`

    const calendarResponse = await fetch(calendarUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    const calendarData = await calendarResponse.json()

    const events = calendarData.items || []
    return formatEvents(events, viewMode)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}

export const fetchCalendarEventsFromICal = async () => {
  try {
    const { ical_url: icalUrl } = window.screenly.settings
    const corsProxy = screenly.cors_proxy_url
    const bypassCors = Boolean(JSON.parse(screenly.settings.bypass_cors))
    const {
      calendar_mode: viewMode
    } = screenly.settings
    const icalUrlWithProxy = bypassCors ? `${corsProxy}/${icalUrl}` : icalUrl

    const response = await fetch(icalUrlWithProxy)

    if (!response.ok) {
      throw new Error('Failed to fetch iCal feed')
    }

    const icalData = await response.text()
    const jcalData = ical.parse(icalData)
    const vcalendar = new ical.Component(jcalData)
    const vevents = vcalendar.getAllSubcomponents('vevent')

    const { startDate, endDate } = getDateRangeForViewMode(viewMode)

    // Pre-calculate the timestamp for faster comparisons
    const startTimestamp = startDate.getTime()
    const endTimestamp = endDate.getTime()

    // Process events in chunks to prevent blocking
    const chunkSize = 50
    const events = []

    for (let i = 0; i < vevents.length; i += chunkSize) {
      const chunk = vevents.slice(i, i + chunkSize)

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
          isAllDay: event.startDate.isDate
        })
      })

      // Allow other operations to process
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    // Sort events once
    events.sort((a, b) => a.startTime.localeCompare(b.startTime))

    return viewMode === VIEW_MODE.DAILY
      ? events.slice(0, DAILY_VIEW_EVENT_LIMIT)
      : events
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}
