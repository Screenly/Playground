import './css/style.css'

import {
  setupTheme,
  setupErrorHandling,
  getSettingWithDefault,
  signalReady,
  getCredentials,
} from '@screenly/edge-apps'
import { getRenderUrl, fetchAndRenderDashboard } from './render'

window.onload = async function () {
  // Setup error handling with panic-overlay
  setupErrorHandling()

  // Setup branding colors using the library
  setupTheme()

  // Get settings from screenly.yml
  const dashboardId = getSettingWithDefault<string>('dashboard_id', '')
  const refreshInterval = getSettingWithDefault<number>('refresh_interval', 60)

  if (!dashboardId) {
    throw new Error('Grafana dashboard ID must be provided in the settings.')
  }

  // Get service access token and metadata from OAuth service
  const { token: serviceAccessToken, metadata } = await getCredentials()

  // Get domain from metadata
  const grafanaDomain = metadata?.domain as string
  if (!grafanaDomain) {
    throw new Error('Grafana domain must be provided by the OAuth service.')
  }

  const imageUrl = getRenderUrl(grafanaDomain, dashboardId)

  const imgElement = document.querySelector('#content img') as HTMLImageElement

  // Fetch dashboard immediately
  const success = await fetchAndRenderDashboard(
    imageUrl,
    serviceAccessToken,
    imgElement,
  )

  if (!success) {
    throw new Error('Failed to load the Grafana dashboard image.')
  }

  // Set up interval to refresh the dashboard
  setInterval(async () => {
    await fetchAndRenderDashboard(imageUrl, serviceAccessToken, imgElement)
  }, refreshInterval * 1000)

  // Signal that the app is ready
  signalReady()
}
