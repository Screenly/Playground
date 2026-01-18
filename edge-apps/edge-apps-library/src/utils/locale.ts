import tzlookup from '@photostructure/tz-lookup'
import clm from 'country-locale-map'
import { getSettingWithDefault } from './settings.js'
import { getMetadata } from './metadata.js'

/**
 * Validate timezone using native Intl API
 */
function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

/**
 * Validate locale using native Intl API
 * Ensures the resolved locale's language code matches the requested locale
 */
function isValidLocale(locale: string): boolean {
  // Basic format validation: should be at least 2 characters
  // and not end with a hyphen
  if (!locale || locale.length < 2 || locale.endsWith('-')) {
    return false
  }

  // Language code should be 2-3 characters, followed by optional region/script
  const localeRegex = /^[a-z]{2,3}(-[a-z]{2,})*$/i
  if (!localeRegex.test(locale)) {
    return false
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale)
    const resolved = formatter.resolvedOptions().locale
    // Check if the resolved locale's language code matches the requested one
    // e.g., 'zh-CN' → language 'zh', 'en-US' → language 'en'
    const requestedLanguage = locale.toLowerCase().split('-')[0]
    const resolvedLanguage = resolved.toLowerCase().split('-')[0]

    if (requestedLanguage !== resolvedLanguage) {
      return false
    }

    // If request includes a region/script, verify it's preserved in resolution
    // This catches cases like 'en-INVALID' resolving to 'en'
    const requestedParts = locale.toLowerCase().split('-')
    if (requestedParts.length > 1) {
      const resolvedParts = resolved.toLowerCase().split('-')
      // If we requested more than just language, the resolved should have similar depth
      // (or not drop the requested parts entirely)
      if (resolvedParts.length < requestedParts.length) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * Resolve timezone configuration with fallback chain
 * Fallback order: override setting (validated) → GPS-based detection → 'UTC'
 */
export async function getTimeZone(): Promise<string> {
  // Priority 1: Use override setting if provided and valid
  const overrideTimezone = getSettingWithDefault<string>(
    'override_timezone',
    '',
  )
  if (overrideTimezone) {
    // Validate using native Intl API
    if (isValidTimezone(overrideTimezone)) {
      return overrideTimezone
    }
    console.warn(
      `Invalid timezone override: "${overrideTimezone}", falling back to GPS detection`,
    )
  }

  try {
    const [latitude, longitude] = getMetadata().coordinates
    return tzlookup(latitude, longitude)
  } catch (error) {
    console.warn('Failed to get timezone from coordinates, using UTC:', error)
    return 'UTC'
  }
}

/**
 * Resolve locale configuration with fallback chain
 * Fallback order: override setting (validated) → GPS-based detection → browser locale → 'en'
 */
export async function getLocale(): Promise<string> {
  // Priority 1: Use override setting if provided and valid
  const overrideLocale = getSettingWithDefault<string>('override_locale', '')
  if (overrideLocale) {
    const normalizedLocale = overrideLocale.replaceAll('_', '-')
    // Validate the override locale
    if (isValidLocale(normalizedLocale)) {
      return normalizedLocale
    }
    console.warn(
      `Invalid locale override: "${overrideLocale}", falling back to GPS detection`,
    )
  }

  const [lat, lng] = getMetadata().coordinates

  const defaultLocale =
    (navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language) || 'en'

  try {
    // Lazy-load offline-geocode-city so apps that never call getLocale
    // don't need to bundle it (and won't hit its lz-string dependency).
    const { getNearestCity } = await import('offline-geocode-city')

    const data = await getNearestCity(lat, lng)
    const countryCode = data.countryIso2.toUpperCase()

    const locale = clm.getLocaleByAlpha2(countryCode) || defaultLocale
    return locale.replace('_', '-')
  } catch (error) {
    console.warn('Failed to get locale from coordinates, using default:', error)
    return defaultLocale
  }
}

/**
 * Format coordinates into a human-readable string
 * Example: "37.3861° N, 122.0839° W"
 */
export function formatCoordinates(coordinates: [number, number]): string {
  const [latitude, longitude] = coordinates

  const latString = `${Math.abs(latitude).toFixed(4)}\u00B0`
  const latDirection = latitude > 0 ? 'N' : 'S'
  const lngString = `${Math.abs(longitude).toFixed(4)}\u00B0`
  const lngDirection = longitude > 0 ? 'E' : 'W'

  return `${latString} ${latDirection}, ${lngString} ${lngDirection}`
}

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

  // Find the first Sunday of the current year
  const now = new Date()
  const year = now.getFullYear()
  const firstDay = new Date(Date.UTC(year, 0, 1))
  const dayOfWeek = firstDay.getUTCDay() // 0 = Sunday, 1 = Monday, etc.

  // Calculate offset to get to the first Sunday
  const offset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const firstSunday = new Date(Date.UTC(year, 0, 1 + offset))

  for (let i = 0; i < 7; i++) {
    const date = new Date(firstSunday)
    date.setUTCDate(firstSunday.getUTCDate() + i)

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
 * Get locale extension for numeral system based on language
 * This enables locale-specific number representations (e.g., Thai numerals, Chinese numerals)
 * Uses Intl.Locale API to robustly handle existing extensions
 */
function getLocaleWithNumeralSystem(locale: string): string {
  const language = locale.toLowerCase().split('-')[0]

  // Map of languages to their numeral system extensions
  const numeralSystemMap: Record<string, string> = {
    th: 'thai', // Thai numerals: ๐๑๒๓๔๕๖๗๘๙
    zh: 'hanidec', // Chinese numerals: 〇一二三四五六七八九
  }

  const numeralSystem = numeralSystemMap[language]
  if (!numeralSystem) {
    return locale
  }

  try {
    // Use Intl.Locale API to robustly handle existing extensions
    // This properly merges extensions instead of creating duplicates
    const localeObj = new Intl.Locale(locale, {
      numberingSystem: numeralSystem,
    })
    return localeObj.toString()
  } catch (error) {
    // Fallback to original locale if Intl.Locale fails
    console.warn(`Failed to apply numeral system to locale "${locale}":`, error)
    return locale
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

    // Get locale with numeral system extension if applicable
    const localeWithNumerals = getLocaleWithNumeralSystem(locale)

    // Format with Intl API for proper localization
    const formatter = new Intl.DateTimeFormat(localeWithNumerals, {
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
