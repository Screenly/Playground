// TODO: Add a utility function for formatting dates.
// Examples
// - "December 25, 2023" in en-US
// - "25 December 2023" in en-GB
// - "2023年12月25日" in ja-JP
// - "25.12.2023" in de-DE

/**
 * Get localized day names (Sunday-Saturday)
 * Returns both full and short forms
 */
export function getLocalizedDayNames(locale: string): {
  full: string[]
  short: string[]
} {
  const full: string[] = []
  const short: string[] = []

  // Get current week and iterate through each day
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)

    full.push(date.toLocaleDateString(locale, { weekday: 'long' }))
    short.push(date.toLocaleDateString(locale, { weekday: 'short' }))
  }

  return { full, short }
}

/**
 * Get localized month names (January-December)
 * Returns both full and short forms
 */
export function getLocalizedMonthNames(locale: string): {
  full: string[]
  short: string[]
} {
  const full: string[] = []
  const short: string[] = []

  // Iterate through each month of the current year
  const now = new Date()
  const year = now.getFullYear()

  for (let i = 0; i < 12; i++) {
    const date = new Date(year, i, 1)

    full.push(date.toLocaleDateString(locale, { month: 'long' }))
    short.push(date.toLocaleDateString(locale, { month: 'short' }))
  }

  return { full, short }
}

/**
 * Detect if a locale uses 12-hour or 24-hour format
 */
export function detectHourFormat(locale: string): 'hour12' | 'hour24' {
  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    const parts = formatter.formatToParts(new Date())
    // If dayPeriod (AM/PM) exists, it's 12-hour format
    const hasDayPeriod = parts.some((part) => part.type === 'dayPeriod')
    return hasDayPeriod ? 'hour12' : 'hour24'
  } catch {
    // Fallback to 24-hour for unrecognized locales
    return 'hour24'
  }
}

/**
 * Extract time parts from a DateTimeFormat formatter
 */
function extractTimePartsFromFormatter(
  date: Date,
  formatter: Intl.DateTimeFormat,
): {
  hour: string
  minute: string
  second: string
  dayPeriod?: string
} {
  const parts = formatter.formatToParts(date)
  const partMap: Record<string, string> = {}

  parts.forEach((part) => {
    if (part.type !== 'literal') {
      partMap[part.type] = part.value
    }
  })

  return {
    hour: partMap.hour || '00',
    minute: partMap.minute || '00',
    second: partMap.second || '00',
    dayPeriod: partMap.dayPeriod,
  }
}

/**
 * Format time with locale and timezone awareness
 * Returns structured time parts for flexible composition
 */
export function formatTime(
  date: Date,
  locale: string,
  timezone: string,
  options?: {
    hour12?: boolean
  },
): {
  hour: string
  minute: string
  second: string
  dayPeriod?: string
  formatted: string
} {
  try {
    // Determine hour format if not explicitly provided
    const hour12 = options?.hour12 ?? detectHourFormat(locale) === 'hour12'

    // Format with Intl API for proper localization
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12,
      timeZone: timezone,
    })

    const timeParts = extractTimePartsFromFormatter(date, formatter)

    return {
      ...timeParts,
      formatted: formatter.format(date),
    }
  } catch (error) {
    console.warn(
      `Failed to format time for locale "${locale}" and timezone "${timezone}":`,
      error,
    )
    // Fallback to UTC in English
    const fallbackFormatter = new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })

    const timeParts = extractTimePartsFromFormatter(date, fallbackFormatter)

    return {
      ...timeParts,
      formatted: fallbackFormatter.format(date),
    }
  }
}
