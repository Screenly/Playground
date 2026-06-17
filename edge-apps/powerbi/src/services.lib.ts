import { factories, service } from 'powerbi-client'
import type { PowerBiError } from './services.types'

export const DASHBOARD_READY_DELAY_MS = 1000

let embedService: service.Service | undefined

export function getEmbedService(): service.Service {
  embedService ??= new service.Service(
    factories.hpmFactory,
    factories.wpmpFactory,
    factories.routerFactory,
  )
  return embedService
}

export function showError(error: PowerBiError): void {
  const container = document.getElementById('embed-container') as HTMLElement
  container.innerHTML = ''

  const template = document.getElementById(
    'error-template',
  ) as HTMLTemplateElement
  const content = template.content.cloneNode(true) as DocumentFragment

  const messageEl = content.querySelector('.error-message') as HTMLElement
  if (error.detailedMessage) {
    messageEl.textContent = error.detailedMessage
  }

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
