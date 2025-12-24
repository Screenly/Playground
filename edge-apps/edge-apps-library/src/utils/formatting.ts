/**
 * Format a date in a locale-aware way.
 *
 * Examples:
 * - "December 25, 2023" in en-US
 * - "25 December 2023" in en-GB
 * - "2023年12月25日" in ja-JP
 * - "25.12.2023" in de-DE
 *
 * By default, formats as a full date (year, month, day). Callers can
 * override or extend the formatting via the `options` parameter.
 */
export function formatLocalizedDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const baseOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      ...baseOptions,
      ...options,
    })
    return formatter.format(date)
  } catch {
    // Fallback to a safe default for unrecognized locales
    const fallbackFormatter = new Intl.DateTimeFormat('en-US', {
      ...baseOptions,
      ...options,
    })
    return fallbackFormatter.format(date)
  }
}
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

  // Use a fixed reference date (January 1st) of the current year
  const now = new Date()
  const referenceDate = new Date(Date.UTC(now.getFullYear(), 0, 1))

  for (let i = 0; i < 7; i++) {
    const date = new Date(referenceDate)
    date.setUTCDate(referenceDate.getUTCDate() + i)

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
      hour: 'numeric',
    })

    return formatter.resolvedOptions().hour12 ? 'hour12' : 'hour24'
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
