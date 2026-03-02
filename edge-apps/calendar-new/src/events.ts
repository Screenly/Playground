import ical from 'ical.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import dayJsTimezone from 'dayjs/plugin/timezone'
import type { CalendarEvent, ViewMode } from './types.js'
import { VIEW_MODE } from './types.js'

dayjs.extend(utc)
dayjs.extend(dayJsTimezone)

interface FetchSettings {
  timezone: string
}

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

export const fetchCalendarEventsFromICal = async (
  settings: FetchSettings,
): Promise<CalendarEvent[]> => {
  try {
    const { timezone } = settings
    const screenlySettings = screenly.settings
    const { ical_url: icalUrl } = screenlySettings
    const corsProxy = screenly.cors_proxy_url
    const bypassCors = Boolean(
      JSON.parse(screenlySettings.bypass_cors as string),
    )
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

    const mappedViewMode: ViewMode =
      viewMode === 'monthly' ? VIEW_MODE.SCHEDULE : (viewMode as ViewMode)
    const { startDate, endDate } = getDateRangeForViewMode(
      mappedViewMode,
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
    throw new Error(`Error fetching calendar events: ${errorMessage}`)
  }
}
