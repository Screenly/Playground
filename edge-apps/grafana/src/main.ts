import { setupTheme, getSetting, signalReady } from '@screenly/edge-apps'

window.onload = function () {
  // Setup branding colors using the library
  setupTheme()

  // Get settings from screenly.yml
  const grafanaUrl = getSetting<string>('grafana_url') || ''

  if (!grafanaUrl) {
    console.error('Grafana URL is not configured')
    return
  }

  // Create iframe for Grafana
  const container = document.querySelector('#content')
  if (container) {
    const iframe = document.createElement('iframe')
    iframe.src = grafanaUrl
    iframe.style.width = '100%'
    iframe.style.height = '100vh'
    iframe.style.border = 'none'
    container.appendChild(iframe)
  }

  // Signal that the app is ready
  signalReady()
}
