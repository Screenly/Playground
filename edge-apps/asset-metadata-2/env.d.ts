/// <reference types="vite/client" />

declare global {
  var screenly: {
    signalReadyForRendering: () => void
    metadata: {
      coordinates: [number, number],
      hardware: string,
      hostname: string,
      location: string,
      screenly_version: string,
      screen_name: string,
      tags: string[]
    }
    settings: Record<string, unknown> & {
      screenly_color_accent?: string
      screenly_color_light?: string
      screenly_color_dark?: string
      theme?: 'light' | 'dark'
    }
    cors_proxy_url: string
  }
}

export {}
