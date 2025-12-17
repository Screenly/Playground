import { setupTheme, getSetting, signalReady } from '@screenly/edge-apps'
import { getRenderUrl, fetchAndRenderDashboard } from './render'

window.onload = async function () {
  // Setup branding colors using the library
  setupTheme()

  // Get settings from screenly.yml
  const domain = getSetting<string>('domain') || ''
  const dashboardId = getSetting<string>('dashboard_id') || ''
  const refreshInterval = getSetting<number>('refresh_interval') || 60
  const serviceAccessToken = getSetting<string>('service_access_token') || ''

  if (!domain || !dashboardId) {
    console.error(
      'Grafana domain, and dashboard ID must be provided in the settings.',
    )
    return
  }

  const imageUrl = getRenderUrl(domain, dashboardId)

  const imgElement = document.querySelector('#content img') as HTMLImageElement

  // Fetch dashboard immediately
  await fetchAndRenderDashboard(imageUrl, serviceAccessToken, imgElement)

  // Set up interval to refresh the dashboard
  setInterval(async () => {
    await fetchAndRenderDashboard(imageUrl, serviceAccessToken, imgElement)
  }, refreshInterval * 1000)

  // Signal that the app is ready
  signalReady()
}
