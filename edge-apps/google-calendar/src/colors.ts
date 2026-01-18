interface ColorDefinition {
  background: string
  foreground: string
}

interface CalendarColors {
  kind: string
  updated: string
  event: Record<string, ColorDefinition>
}

let cachedColors: CalendarColors | null = null

export const fetchCalendarColors = async (
  accessToken: string,
): Promise<CalendarColors> => {
  if (cachedColors) {
    return cachedColors
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
