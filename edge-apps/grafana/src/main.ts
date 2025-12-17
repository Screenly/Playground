import {
  setupTheme,
  getSetting,
  getSettingWithDefault,
  signalReady,
  getAccessToken,
} from '@screenly/edge-apps'
import { getRenderUrl, fetchAndRenderDashboard } from './render'

function displayError(message: string): void {
  const errorElement = document.createElement('div')
  errorElement.className = 'error-message'
  errorElement.textContent = message
  const content = document.querySelector('#content')
  if (content) {
    content.appendChild(errorElement)
  }
  signalReady()
}

window.onload = async function () {
  // Setup branding colors using the library
  setupTheme()

  let errorMessage = ''

  // Get settings from screenly.yml
  const domain = getSettingWithDefault<string>('domain', '')
  const dashboardId = getSettingWithDefault<string>('dashboard_id', '')
  const refreshInterval = getSettingWithDefault<number>('refresh_interval', 60)

  if (!domain || !dashboardId) {
    errorMessage =
      'Grafana domain and dashboard ID must be provided in the settings.'
    displayError(errorMessage)
    return
  }

  // Get service access token from OAuth service
  let serviceAccessToken = ''
  try {
    serviceAccessToken = await getAccessToken()
  } catch (error) {
    errorMessage = `Failed to retrieve access token: ${error instanceof Error ? error.message : 'Unknown error'}`
    displayError(errorMessage)
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
