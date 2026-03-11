import {
  formatLocalizedDate,
  getLocale,
  getSettingWithDefault,
  getTimeZone,
  signalReady,
} from '@screenly/edge-apps'

export default async function init() {
  const messageHeader = getSettingWithDefault<string>(
    'message_header',
    'Simple Message App',
  )
  const messageHeaderEl =
    document.querySelector<HTMLHeadingElement>('#message-header')!
  messageHeaderEl.textContent = messageHeader

  const messageBody = getSettingWithDefault<string>(
    'message_body',
    'A simple message app allows users to display text on a screen, making it a\nbasic tool for digital signage. Users can input and edit both the heading\nand message body directly from the Screenly dashboard.\n',
  )
  const messageBodyEl = document.querySelector<HTMLDivElement>('#message-body')!
  messageBodyEl.textContent = messageBody

  const dateBadgeEl = document.querySelector<HTMLDivElement>('#date-badge')!
  const [locale, timezone] = await Promise.all([getLocale(), getTimeZone()])
  const now = new Date()
  dateBadgeEl.textContent = formatLocalizedDate(now, locale, {
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  })

  signalReady()
}
