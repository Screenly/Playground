import './css/style.css'

import {
  setupTheme,
  getSettingWithDefault,
  signalReady,
} from '@screenly/edge-apps'

function extractUrlFromEmbedSetting(settingValue: string): string | null {
  if (settingValue.includes('<iframe')) {
    const match = settingValue.match(/<iframe.*?src=["'](.*?)["']/)
    if (match && match[1]) {
      return match[1]
    }
    return null
  }
  return settingValue
}

window.onload = function () {
  const embedSettingValue = getSettingWithDefault<string>('embed_url', '')
  const refreshInterval = getSettingWithDefault<number>('refresh_interval', 60)
  const embedUrl = extractUrlFromEmbedSetting(embedSettingValue)
  const iframeElement = document.getElementById(
    'looker-studio-iframe',
  ) as HTMLIFrameElement | null

  // Setup branding colors using the library
  setupTheme()

  if (!iframeElement) {
    console.error('Iframe element not found')
    signalReady()
    return
  }

  if (!embedUrl) {
    console.error('Embed URL not configured or invalid')
    signalReady()
    return
  }

  let refreshTimer: number | null = null

  const loadIframe = () => {
    iframeElement.src = embedUrl
  }

  const setupRefreshTimer = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }

    if (refreshInterval > 0) {
      refreshTimer = window.setInterval(() => {
        loadIframe()
      }, refreshInterval * 1000)
    }
  }

  iframeElement.onload = () => {
    signalReady()
    setupRefreshTimer()
  }

  loadIframe()
}
