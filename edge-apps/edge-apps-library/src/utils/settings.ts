import type { ScreenlySettings } from '../types/index.js'

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
