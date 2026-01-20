interface ColorDefinition {
  background: string
  foreground: string
}

interface CalendarColors {
  kind: string
  updated: string
  event: Record<string, ColorDefinition>
}

const CACHE_EXPIRATION_MS = 60 * 60 * 1000 // 1 hour in milliseconds

let cachedColors: CalendarColors | null = null
let cacheTimestamp: number | null = null

const isCacheValid = (): boolean => {
  if (!cachedColors || !cacheTimestamp) {
    return false
  }

  const now = Date.now()
  const cacheAge = now - cacheTimestamp

  return cacheAge < CACHE_EXPIRATION_MS
}

export const fetchCalendarColors = async (
  accessToken: string,
): Promise<CalendarColors> => {
  if (isCacheValid()) {
    return cachedColors!
  }

  const apiUrl = 'https://www.googleapis.com/calendar/v3/colors'

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch calendar colors from Google Calendar API')
  }

  const data = await response.json()
  cachedColors = data
  cacheTimestamp = Date.now()

  return data
}

export const getEventBackgroundColor = (
  colorId: string | undefined,
  colors: CalendarColors | null,
  defaultColor: string = '#e6e7e7',
): string => {
  if (!colorId || !colors || !colors.event || !colors.event[colorId]) {
    return defaultColor
  }

  return colors.event[colorId].background
}
