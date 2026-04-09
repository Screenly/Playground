import './css/style.css'
import {
  getFormattedCoordinates,
  getHostname,
  getScreenName,
  getScreenlyVersion,
  getTags,
  setupBranding,
  setupErrorHandling,
  signalReady,
} from '@screenly/edge-apps'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function setText(id: string, value: string | undefined): void {
  const el = document.getElementById(id)
  if (el) el.textContent = value || 'N/A'
}

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()

  await setupBranding()

  setText('hostname', getHostname())
  setText('screen-name', getScreenName())
  setText('hardware', screenly.metadata.hardware)
  setText('version', getScreenlyVersion())
  setText('coordinates', getFormattedCoordinates())

  const tags = getTags()
  const labelsContainer = document.getElementById('labels')
  if (labelsContainer) {
    if (tags && tags.length > 0) {
      labelsContainer.innerHTML = tags
        .map((tag) => `<span class="label-chip">${escapeHtml(tag)}</span>`)
        .join('')
    } else {
      labelsContainer.innerHTML =
        '<span class="no-labels">No labels assigned</span>'
    }
  }

  signalReady()
})
