import './css/style.css'

import { getSettingWithDefault, signalReady } from '@screenly/edge-apps'
import { getEmbedSDK } from '@looker/embed-sdk'

declare const screenly: {
  settings: {
    looker_host?: string
    dashboard_id?: string
    embed_token?: string
    screenly_oauth_tokens_url?: string
    screenly_app_auth_token?: string
  }
}

interface TokenResponse {
  authentication_token: string
  navigation_token: string
  api_token: string
  authentication_token_ttl: number
  navigation_token_ttl: number
  api_token_ttl: number
}

async function acquireEmbedSession(): Promise<TokenResponse> {
  if (screenly.settings.embed_token) {
    return {
      authentication_token: screenly.settings.embed_token,
      navigation_token: screenly.settings.embed_token,
      api_token: screenly.settings.embed_token,
      authentication_token_ttl: 30,
      navigation_token_ttl: 600,
      api_token_ttl: 600,
    }
  }

  const response = await fetch(
    `${screenly.settings.screenly_oauth_tokens_url}acquire-session/`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to acquire session: ${response.status}`)
  }

  return response.json()
}

async function generateEmbedTokens(tokens: {
  api_token: string
  navigation_token: string
}): Promise<TokenResponse> {
  const response = await fetch(
    `${screenly.settings.screenly_oauth_tokens_url}generate-tokens/`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokens),
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to generate tokens: ${response.status}`)
  }

  return response.json()
}

async function initializeLooker() {
  const lookerHost = getSettingWithDefault<string>('looker_host', '')
  const dashboardId = getSettingWithDefault<string>('dashboard_id', '')

  if (!lookerHost || !dashboardId) {
    console.error('Looker host and dashboard ID are required')
    signalReady()
    return
  }

  try {
    getEmbedSDK().initCookieless(
      lookerHost,
      acquireEmbedSession,
      generateEmbedTokens,
    )

    const connection = await getEmbedSDK()
      .createDashboardWithId(dashboardId)
      .appendTo('#embed-container')
      .on('dashboard:run:complete', () => {
        signalReady()
      })
      .build()
      .connect()

    console.log('Looker dashboard connected:', connection.getPageType())
  } catch (error) {
    console.error('Failed to initialize Looker:', error)
    signalReady()
  }
}

window.onload = initializeLooker
