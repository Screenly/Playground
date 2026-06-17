interface PowerBiSettings {
  embed_token?: string
  embed_url: string
  refresh_interval: string
  display_errors: string
  screenly_oauth_tokens_url: string
  screenly_app_auth_token: string
}

declare global {
  const screenly: {
    settings: PowerBiSettings
    signalReadyForRendering: () => void
  }
}

export {}
