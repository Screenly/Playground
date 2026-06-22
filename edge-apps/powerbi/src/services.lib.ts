import { factories, service } from 'powerbi-client'
import type { PowerBiError } from './services.types'

export const DASHBOARD_READY_DELAY_MS = 1000

// Power BI's "FailedToLoadModel" is transient (a stale/evicted dataset session); reload
// the report a few times to recover before giving up and showing the error screen. The
// delay gives the dataset time to come back and clears reload()'s 100ms throttle, so an
// immediate retry isn't silently dropped.
const MODEL_LOAD_ERROR = 'FailedToLoadModel'
export const MAX_MODEL_RELOADS = 3
export const MODEL_RELOAD_DELAY_MS = 5000

export function isModelLoadError(error: PowerBiError): boolean {
  return (error.message ?? '').includes(MODEL_LOAD_ERROR)
}

// Build a real Error (so Sentry groups/titles it instead of "Object captured as exception").
export function toReportableError(error: PowerBiError): Error {
  return new Error(
    error.message ?? error.detailedMessage ?? 'Power BI embed error',
  )
}

// Flatten errorInfo to a string so Sentry's normalizeDepth doesn't truncate the nested
// array to "[Array]".
export function powerBiErrorContext(
  error: PowerBiError,
): Record<string, unknown> {
  return {
    source: 'powerbi-embed',
    detailedMessage: error.detailedMessage,
    errorInfo: JSON.stringify(error.technicalDetails?.errorInfo ?? null),
  }
}

let embedService: service.Service | undefined

export function getEmbedService(): service.Service {
  embedService ??= new service.Service(
    factories.hpmFactory,
    factories.wpmpFactory,
    factories.routerFactory,
  )
  return embedService
}

const DEFAULT_ERROR_MESSAGE = 'Unable to load report'

export function showError(error: PowerBiError): void {
  const container = document.getElementById('embed-container') as HTMLElement
  container.innerHTML = ''

  const template = document.getElementById(
    'error-template',
  ) as HTMLTemplateElement
  const content = template.content.cloneNode(true) as DocumentFragment

  const messageEl = content.querySelector('.error-message') as HTMLElement
  messageEl.textContent =
    error.detailedMessage ?? error.message ?? DEFAULT_ERROR_MESSAGE

  const table = content.querySelector('.error-details') as HTMLElement
  const rowTemplate = document.getElementById(
    'error-row-template',
  ) as HTMLTemplateElement
  const errorInfo = error.technicalDetails && error.technicalDetails.errorInfo

  if (errorInfo) {
    errorInfo.forEach(function (item) {
      const row = rowTemplate.content.cloneNode(true) as DocumentFragment
      ;(row.querySelector('.error-key') as HTMLElement).textContent = item.key
      ;(row.querySelector('.error-value') as HTMLElement).textContent = String(
        item.value,
      )
      table.appendChild(row)
    })
  }

  container.appendChild(content)
  screenly.signalReadyForRendering()
}
