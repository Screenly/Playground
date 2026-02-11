import type { ScreenlySettings } from '../types/index.js'
import { getMeasurementUnitByCountry } from './locale.js'

/**
 * Get all Screenly settings
 */
export function getSettings(): ScreenlySettings {
  return screenly.settings
}

/**
 * Get a specific setting value
 */
export function getSetting<T = unknown>(key: string): T | undefined {
  return screenly.settings[key] as T | undefined
}

/**
 * Get a setting with a default value
 */
export function getSettingWithDefault<T>(key: string, defaultValue: T): T {
  const value = screenly.settings[key]
  if (value === undefined) return defaultValue

  if (typeof value === 'string' && value === '') {
    return defaultValue
  }

  // If the value is a string and the default is a number, try to parse it
  if (typeof value === 'string' && typeof defaultValue === 'number') {
    const trimmed = value.trim()
    if (trimmed === '') return defaultValue
    const parsed = Number(trimmed)
    if (!isNaN(parsed)) return parsed as T
    return defaultValue
  }

  // If the value is a string and the default is a boolean, try to parse it
  if (typeof value === 'string' && typeof defaultValue === 'boolean') {
    const lowerValue = value.toLowerCase()
    if (lowerValue === 'true') return true as T
    if (lowerValue === 'false') return false as T
    return defaultValue
  }

  return value as T
}

/**
 * Check if a setting exists
 */
export function hasSetting(key: string): boolean {
  return key in screenly.settings
}

/**
 * Get the theme mode
 */
export function getTheme(): 'light' | 'dark' | undefined {
  return screenly.settings.theme
}

/**
 * Get the CORS proxy URL
 */
export function getCorsProxyUrl(): string {
  return screenly.cors_proxy_url
}

/**
 * Signal that the app is ready for rendering
 * This should be called when your app has finished loading and is ready to be displayed
 */
export function signalReady(): void {
  screenly.signalReadyForRendering()
}

// Types
export type MeasurementUnit = 'metric' | 'imperial'

/**
 * Resolve measurement unit from settings with auto-detection fallback
 * @param countryCode - Two-character ISO country code for auto-detection
 * @returns Resolved measurement unit ('metric' or 'imperial')
 */
export function resolveMeasurementUnit(countryCode: string): MeasurementUnit {
  const unitSetting = getSettingWithDefault<string>('unit', 'auto')

  if (unitSetting === 'auto') {
    // Auto-detect based on country when setting is explicitly 'auto'
    return getMeasurementUnitByCountry(countryCode)
  } else if (unitSetting === 'metric' || unitSetting === 'imperial') {
    // Only accept known valid units
    return unitSetting
  } else {
    // Fallback for invalid/corrupted settings: auto-detect based on country
    return getMeasurementUnitByCountry(countryCode)
  }
}
