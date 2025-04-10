import {
  GOOGLE_CALENDAR_API_BASE_URL,
  VIEW_MODE,
  DAILY_VIEW_EVENT_LIMIT,
  GOOGLE_OAUTH_TOKEN_URL
} from '@/constants'

const getAccessToken = async (refreshToken, clientId, clientSecret) => {
  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token'
    })
  })
  const data = await response.json()

  return data.access_token
}

export const fetchCalendarEvents = async () => {
  try {
    const {
      refresh_token: refreshToken,
      calendar_mode: viewMode,
      calendar_id: calendarId,
      client_id: clientId,
      client_secret: clientSecret
    } = window.screenly.settings

    // Create date objects for filtering
    const today = new Date()
    const startDate = new Date(today)
    const endDate = new Date(today)

    // TODO: Only obtain new access token if it's expired.
    const accessToken = await getAccessToken(refreshToken, clientId, clientSecret)

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
