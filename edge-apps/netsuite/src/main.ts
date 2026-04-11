import './css/style.css'
import '@screenly/edge-apps/components'
import {
  getSettingWithDefault,
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'

document.addEventListener('DOMContentLoaded', () => {
  setupErrorHandling()
  setupTheme()

  const message = getSettingWithDefault<string>('message', '')
  const messageEl = document.querySelector<HTMLParagraphElement>('#message')
  if (messageEl && message) {
    messageEl.textContent = message
  }

  signalReady()
})
