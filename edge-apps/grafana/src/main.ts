import {
  setupTheme,
  setupErrorHandling,
  getSettingWithDefault,
  signalReady,
  getToken,
} from '@screenly/edge-apps'
import { getRenderUrl, fetchAndRenderDashboard } from './render'

window.onload = async function () {
  // Setup error handling with panic-overlay
  setupErrorHandling()

  // Setup branding colors using the library
  setupTheme()

  // Get settings from screenly.yml
  const domain = getSettingWithDefault<string>('domain', '')
  const dashboardId = getSettingWithDefault<string>('dashboard_id', '')
  const refreshInterval = getSettingWithDefault<number>('refresh_interval', 60)

  if (!domain || !dashboardId) {
    throw new Error(
      'Grafana domain and dashboard ID must be provided in the settings.',
    )
  }

  // Get service access token from OAuth service
  const serviceAccessToken = await getToken()

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
