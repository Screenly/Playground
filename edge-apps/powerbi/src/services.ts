import { models, type Embed } from 'powerbi-client'
import {
  getEmbedTypeFromUrl,
  getErrorBackoffSec,
  getRefreshDelaySec,
  getTokenRefreshInterval,
} from './utils'
import {
  DASHBOARD_READY_DELAY_MS,
  MAX_MODEL_RELOADS,
  MODEL_RELOAD_DELAY_MS,
  getEmbedService,
  isModelLoadError,
  powerBiErrorContext,
  showError,
  toReportableError,
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

// Drives model-load recovery. Both a fresh error event and a failed reload funnel through
// reloadOrShowError so they share one retry budget. While a reload is pending, further
// errors are ignored so duplicates don't stack overlapping reloads. A successful render
// calls reset(), cancelling any reload still waiting on its delay.
function createReloadController(report: Embed) {
  let attempts = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  function reset() {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    attempts = 0
  }

  function reloadOrShowError(detail: PowerBiError) {
    if (timer !== undefined) {
      return
    }

    if (attempts >= MAX_MODEL_RELOADS) {
      showError(detail)
      return
    }

    attempts += 1
    timer = setTimeout(() => {
      timer = undefined
      report.reload().catch((reloadError) => {
        reportError(reloadError, { source: 'powerbi-reload' })
        reloadOrShowError(detail)
      })
    }, MODEL_RELOAD_DELAY_MS)
  }

  return { reset, reloadOrShowError }
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

  const container = document.getElementById('embed-container') as HTMLElement
  const report = getEmbedService().embed(container, {
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
  })

  // powerbi-client also dispatches a DOM 'error' CustomEvent that bubbles to window, where
  // Sentry's global handler double-captures it; we report it explicitly below instead.
  container.addEventListener('error', (event) => event.stopPropagation())

  const reloadController = createReloadController(report)

  if (resourceType === 'report') {
    report.on('rendered', () => {
      reloadController.reset()
      screenly.signalReadyForRendering()
    })
  } else if (resourceType === 'dashboard') {
    report.on('loaded', () => {
      setTimeout(screenly.signalReadyForRendering, DASHBOARD_READY_DELAY_MS)
    })
  }

  report.on('error', (event) => {
    const detail = event.detail as PowerBiError
    reportError(toReportableError(detail), powerBiErrorContext(detail))

    if (isModelLoadError(detail)) {
      reloadController.reloadOrShowError(detail)
      return
    }

    showError(detail)
  })

  if (!screenly.settings.embed_token) {
    initTokenRefreshLoop(report, initialToken.expiration)
  }

  return report
}
