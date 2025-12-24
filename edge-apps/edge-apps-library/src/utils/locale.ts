import tzlookup from '@photostructure/tz-lookup'
import clm from 'country-locale-map'
import { getNearestCity } from 'offline-geocode-city'
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
  try {
    const formatter = new Intl.DateTimeFormat(locale)
    const resolved = formatter.resolvedOptions().locale
    // Check if the resolved locale's language code matches the requested one
    // e.g., 'zh-CN' → language 'zh', 'en-US' → language 'en'
    const requestedLanguage = locale.toLowerCase().split('-')[0]
    const resolvedLanguage = resolved.toLowerCase().split('-')[0]
    return requestedLanguage === resolvedLanguage
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
    const normalizedLocale = overrideLocale.replace('_', '-')
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
