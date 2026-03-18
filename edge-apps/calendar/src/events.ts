import ical from 'ical.js'
import { getSettingWithDefault, getDateRangeForViewMode } from '@screenly/edge-apps'
import type { CalendarEvent } from './types.js'
import { CALENDAR_VIEW_MODE } from './types.js'

interface FetchSettings {
  timezone: string
}

export const fetchCalendarEventsFromICal = async (
  settings: FetchSettings,
): Promise<CalendarEvent[]> => {
  try {
    const { timezone } = settings
    const screenlySettings = screenly.settings
    const { ical_url: icalUrl } = screenlySettings
    const corsProxy = screenly.cors_proxy_url
    const bypassCors = getSettingWithDefault('bypass_cors', false)
    const viewMode = screenlySettings.calendar_mode as string

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

    const mappedCalendarViewMode: CalendarViewMode =
      viewMode === 'monthly' ? CALENDAR_VIEW_MODE.SCHEDULE : (viewMode as CalendarViewMode)
    const { startDate, endDate } = getDateRangeForViewMode(
      mappedCalendarViewMode,
      timezone,
    )

    const startTimestamp = startDate.getTime()
    const endTimestamp = endDate.getTime()

    const chunkSize = 100
    const events: CalendarEvent[] = []

    for (let i = 0; i < vevents.length; i += chunkSize) {
      const chunk = vevents.slice(i, i + chunkSize)

      chunk.forEach((vevent) => {
        const event = new ical.Event(vevent)
        const eventStart = event.startDate.toJSDate()
        const eventTimestamp = eventStart.getTime()

        if (eventTimestamp >= endTimestamp || eventTimestamp < startTimestamp) {
          return
        }

        const eventEnd = event.endDate.toJSDate()

        events.push({
          title: event.summary || 'Busy',
          startTime: eventStart.toISOString(),
          endTime: eventEnd.toISOString(),
          isAllDay: event.startDate.isDate,
        })
      })

      if (i % (chunkSize * 3) === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }

    events.sort((a, b) => a.startTime.localeCompare(b.startTime))

    return events
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Error fetching calendar events: ${errorMessage}`, {
      cause: error,
    })
  }
}
