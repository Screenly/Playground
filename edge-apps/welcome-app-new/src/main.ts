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

  const welcomeHeading = getSettingWithDefault<string>(
    'welcome_heading',
    'Welcome',
  )
  const welcomeMessage = getSettingWithDefault<string>(
    'welcome_message',
    'to the team',
  )

  const headingEl =
    document.querySelector<HTMLParagraphElement>('#welcome-heading')
  if (headingEl) {
    headingEl.textContent = welcomeHeading
  }

  const messageEl =
    document.querySelector<HTMLParagraphElement>('#welcome-message')
  if (messageEl) {
    messageEl.textContent = welcomeMessage
  }

  signalReady()
})
