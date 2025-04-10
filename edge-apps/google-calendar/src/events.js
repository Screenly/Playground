import {
  GOOGLE_CALENDAR_API_BASE_URL,
  VIEW_MODE,
  DAILY_VIEW_EVENT_LIMIT
} from '@/constants'

export const fetchCalendarEvents = async (accessToken) => {
  try {
    const {
      calendar_mode: viewMode,
      calendar_id: calendarId
    } = window.screenly.settings

    // Create date objects for filtering
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

    // Add timeMin and timeMax parameters to only fetch relevant events
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      orderBy: 'startTime',
      singleEvents: 'true'
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
    const eventsFormatted = events.map((event) => ({
      title: event.summary,
      startTime: event.start.dateTime || event.start.date,
      endTime: event.end.dateTime || event.end.date,
      isAllDay: !event.start.dateTime
    }))

    // Only limit events for daily view
    return viewMode === VIEW_MODE.DAILY
      ? eventsFormatted.slice(1, DAILY_VIEW_EVENT_LIMIT)
      : eventsFormatted
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}
