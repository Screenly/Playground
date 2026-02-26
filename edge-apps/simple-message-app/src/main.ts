import './css/style.css'
import '@screenly/edge-apps/components'
import {
  formatLocalizedDate,
  getLocale,
  getSettingWithDefault,
  getTimeZone,
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()
  setupTheme()

  const messageHeader = getSettingWithDefault<string>(
    'message_header',
    'Simple Message App',
  )
  const messageHeaderEl =
    document.querySelector<HTMLHeadingElement>('#message-header')
  if (messageHeaderEl) {
    messageHeaderEl.textContent = messageHeader
  }

  const messageBody = getSettingWithDefault<string>(
    'message_body',
    'A simple message app allows users to display text on a screen, making it a\nbasic tool for digital signage. Users can input and edit both the heading\nand message body directly from the Screenly dashboard.\n',
  )
  const messageBodyEl = document.querySelector<HTMLDivElement>('#message-body')
  if (messageBodyEl) {
    messageBodyEl.textContent = messageBody
  }

  const dateBadgeEl = document.querySelector<HTMLDivElement>('#date-badge')
  if (dateBadgeEl) {
    const [locale, timezone] = await Promise.all([getLocale(), getTimeZone()])
    const now = new Date()
    dateBadgeEl.textContent = formatLocalizedDate(now, locale, {
      month: 'long',
      year: 'numeric',
      timeZone: timezone,
    })
  }

  signalReady()
})
