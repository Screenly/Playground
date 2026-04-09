import './css/style.css'
import '@screenly/edge-apps/components'
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

  const { colors, logoUrl } = await setupBranding()

  const theme = screenly.settings.theme ?? 'light'
  document.body.classList.add(`theme-${theme}`)

  document.documentElement.style.setProperty(
    '--app-bg',
    theme === 'dark' ? '#0D1117' : '#E8ECF1',
  )
  document.documentElement.style.setProperty(
    '--card-bg',
    theme === 'dark'
      ? 'rgba(255, 255, 255, 0.07)'
      : 'rgba(255, 255, 255, 0.88)',
  )
  document.documentElement.style.setProperty(
    '--card-border',
    theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
  )
  document.documentElement.style.setProperty(
    '--text-primary',
    theme === 'dark' ? '#F2F2F3' : '#0D0E1A',
  )
  document.documentElement.style.setProperty(
    '--text-secondary',
    theme === 'dark' ? '#9CA3AF' : '#6B7280',
  )
  document.documentElement.style.setProperty('--chip-bg', colors.primary + '22')
  document.documentElement.style.setProperty('--chip-color', colors.primary)

  const logoImg = document.querySelector<HTMLImageElement>('#brand-logo')!
  if (logoUrl) {
    logoImg.src = logoUrl
    logoImg.hidden = false
  }

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
