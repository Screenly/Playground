/**
 * Hardware types for Screenly devices
 */
export enum Hardware {
  Anywhere = 'Anywhere',
  RaspberryPi = 'RaspberryPi',
  ScreenlyPlayerMax = 'ScreenlyPlayerMax',
  Unknown = 'Unknown',
}

/**
 * Screenly metadata provided by the Edge Apps runtime
 */
export interface ScreenlyMetadata {
  /** GPS coordinates [latitude, longitude] */
  coordinates: [number, number]
  /** Hardware identifier */
  hardware: string | undefined
  /** Device hostname */
  hostname: string
  /** Physical location description */
  location: string
  /** Screenly software version */
  screenly_version: string
  /** Screen display name */
  screen_name: string
  /** Tags associated with the screen */
  tags: string[]
}

/**
 * Screenly settings provided by the Edge Apps runtime
 * This interface can be extended with custom settings
 */
export interface ScreenlySettings extends Record<string, unknown> {
  /** Primary accent color for branding */
  screenly_color_accent?: string
  /** Light theme color */
  screenly_color_light?: string
  /** Dark theme color */
  screenly_color_dark?: string
  /** Light theme logo URL */
  screenly_logo_light?: string
  /** Dark theme logo URL */
  screenly_logo_dark?: string
  /** Theme mode: light or dark */
  theme?: 'light' | 'dark'
  /** Sentry DSN for error tracking */
  sentry_dsn?: string
}

/**
 * The global screenly object provided by screenly.js
 */
export interface ScreenlyObject {
  /** Signal that the app is ready to be displayed */
  signalReadyForRendering: () => void
  /** Device and screen metadata */
  metadata: ScreenlyMetadata
  /** App settings and configuration */
  settings: ScreenlySettings
  /** CORS proxy URL for fetching external resources */
  cors_proxy_url: string
}

/**
 * Theme colors configuration
 */
export interface ThemeColors {
  primary: string
  secondary: string
  tertiary: string
  background: string
}

/**
 * Branding configuration
 */
export interface BrandingConfig {
  colors: ThemeColors
  logoUrl?: string
}

/**
 * Core UI/Layout types
 */

/**
 * Orientation type for edge apps
 */
export type Orientation = 'landscape' | 'portrait' | 'auto'

/**
 * Reference resolution configuration
 */
export interface ReferenceResolution {
  width: number
  height: number
  orientation?: Orientation
}

/**
 * Safe zone configuration
 */
export interface SafeZoneConfig {
  top?: number | string
  right?: number | string
  bottom?: number | string
  left?: number | string
  all?: number | string
}

/**
 * AutoScaler options
 */
export interface AutoScalerOptions {
  padding?: number | string
  referenceWidth: number
  referenceHeight: number
  orientation?: Orientation
  centerContent?: boolean
  debounceMs?: number
  onScaleChange?: (scale: number) => void
}

/**
 * Edge app configuration
 */
export interface EdgeAppConfig {
  referenceResolution: ReferenceResolution
  enableDevTools?: boolean
}

declare global {
  interface Window {
    screenly: ScreenlyObject
  }
  const screenly: ScreenlyObject
}

export {}
