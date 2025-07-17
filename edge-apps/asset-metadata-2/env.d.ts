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
    settings: Record<string, unknown>
    cors_proxy_url: string
  }
}

export {}
