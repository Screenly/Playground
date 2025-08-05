export interface ScreenlyMetadata {
  coordinates: [number, number]
  hardware: string
  hostname: string
  location: string
  screenly_version: string
  screen_name: string
  tags: string[]
}

export interface ScreenlySettings extends Record<string, unknown> {
  screenly_color_accent?: string
  screenly_color_light?: string
  screenly_color_dark?: string
  screenly_logo_light?: string
  screenly_logo_dark?: string
  theme?: 'light' | 'dark'
}

export interface ScreenlyObject {
  signalReadyForRendering: () => void
  metadata: ScreenlyMetadata
  settings: ScreenlySettings
  cors_proxy_url: string
}
