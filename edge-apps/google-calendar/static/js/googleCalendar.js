/* global screenly */
const CALENDAR_ID = 'primary'

export const fetchCalendarEvents = async () => {
  try {
  const timeMin = new Date()
  timeMin.setHours(0, 0, 0, 0)

  const timeMax = new Date(timeMin)
  timeMax.setHours(23, 59, 59, 999)

  const {
    google_calendar_api_key: googleCalendarApiKey
  } = screenly.settings

  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    maxResults: 5,
    singleEvents: true,
    orderBy: 'startTime'
  })

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?${params}`,
    {
    headers: {
      'Authorization': `Bearer ${googleCalendarApiKey}`,
      'Accept': 'application/json'
    }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events')
  }

  const data = await response.json()
  return data.items.map(event => event.summary)
  } catch (error) {
  console.error('Error fetching calendar events:', error)
  return []
  }
}
