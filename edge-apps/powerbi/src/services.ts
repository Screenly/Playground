import { models, type Embed } from 'powerbi-client'
import {
  getEmbedTypeFromUrl,
  getErrorBackoffSec,
  getRefreshDelaySec,
  getTokenRefreshInterval,
} from './utils'
import {
  DASHBOARD_READY_DELAY_MS,
  getEmbedService,
  showError,
} from './services.lib'
import type { EmbedToken, PowerBiError } from './services.types'
import { reportError } from '@screenly/edge-apps/utils'

export async function getEmbedToken(): Promise<EmbedToken> {
  if (screenly.settings.embed_token) {
    return { token: screenly.settings.embed_token, expiration: null }
  }

  const response = await fetch(
    screenly.settings.screenly_oauth_tokens_url + 'embed_token/',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
      },
    },
  )

  if (!response.ok) {
    let detailedMessage: string
    try {
      detailedMessage = (await response.json())['error']
    } catch {
      detailedMessage = `Failed to get embed token.`
    }

    const error = new Error(detailedMessage) as Error & { status: number }
    error.status = response.status
    throw error
  }

  const { token, expiration } = await response.json()
  return { token, expiration: expiration ?? null }
}

export function initTokenRefreshLoop(
  report: Embed,
  initialExpiration: string | null,
): void {
  let currentErrorStep = 0
  const maxRefreshIntervalSec = getTokenRefreshInterval()

  async function run() {
    let nextTimeout: number
    try {
      const { token, expiration } = await getEmbedToken()
      await report.setAccessToken(token)
      currentErrorStep = 0
      nextTimeout = getRefreshDelaySec(expiration, maxRefreshIntervalSec)
    } catch (error) {
      if (currentErrorStep === 0) {
        reportError(error, { source: 'token-refresh' })
      }
      nextTimeout = getErrorBackoffSec(currentErrorStep, maxRefreshIntervalSec)
      currentErrorStep += 1
    }
    setTimeout(run, nextTimeout * 1000)
  }

  setTimeout(
    run,
    getRefreshDelaySec(initialExpiration, maxRefreshIntervalSec) * 1000,
  )
}

export async function initializePowerBI(): Promise<Embed> {
  const embedUrl = screenly.settings.embed_url
  const resourceType = getEmbedTypeFromUrl(embedUrl)

  let initialToken: EmbedToken
  try {
    initialToken = await getEmbedToken()
  } catch (error) {
    reportError(error, { source: 'embed-token' })
    const failure = error as Error & { status?: number }
    showError({
      detailedMessage: failure.message,
      technicalDetails: {
        errorInfo: [{ key: 'status', value: failure.status }],
      },
    })
    throw error
  }

  const report = getEmbedService().embed(
    document.getElementById('embed-container') as HTMLElement,
    {
      embedUrl: embedUrl,
      accessToken: initialToken.token,
      type: resourceType,
      tokenType: models.TokenType.Embed,
      permissions: models.Permissions.All,
      settings: {
        filterPaneEnabled: false,
        navContentPaneEnabled: false,
        hideErrors: true,
      },
    },
  )

  if (resourceType === 'report') {
    report.on('rendered', screenly.signalReadyForRendering)
  } else if (resourceType === 'dashboard') {
    report.on('loaded', () => {
      setTimeout(screenly.signalReadyForRendering, DASHBOARD_READY_DELAY_MS)
    })
  }

  report.on('error', function (event) {
    reportError(event.detail, { source: 'powerbi-embed' })
    showError(event.detail as PowerBiError)
  })

  if (!screenly.settings.embed_token) {
    initTokenRefreshLoop(report, initialToken.expiration)
  }

  return report
}
