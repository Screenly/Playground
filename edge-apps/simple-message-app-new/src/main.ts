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

  const theme = getSettingWithDefault<string>('theme', 'light')
  document.body.setAttribute('data-theme', theme)

  const messageHeader = getSettingWithDefault<string>(
    'message_header',
    'Simple Message App',
  )
  const messageHeaderEl =
    document.querySelector<HTMLHeadingElement>('#message-header')
  if (messageHeaderEl) {
    messageHeaderEl.textContent = messageHeader
  }

  const messageBody = getSettingWithDefault<string>('message_body', '')
  const messageBodyEl = document.querySelector<HTMLDivElement>('#message-body')
  if (messageBodyEl && messageBody) {
    messageBodyEl.textContent = messageBody
  }

  const overrideLocale = getSettingWithDefault<string>('override_locale', 'en')
  const overrideTimezone = getSettingWithDefault<string>(
    'override_timezone',
    '',
  )
  const dateBadgeEl = document.querySelector<HTMLDivElement>('#date-badge')
  if (dateBadgeEl) {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    }
    if (overrideTimezone) {
      options.timeZone = overrideTimezone
    }
    dateBadgeEl.textContent = now.toLocaleDateString(overrideLocale, options)
  }

  signalReady()
})
