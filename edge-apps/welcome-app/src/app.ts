import { getSettingWithDefault, signalReady } from '@screenly/edge-apps'

export default function init() {
  const welcomeHeading = getSettingWithDefault<string>(
    'welcome_heading',
    'Welcome',
  )
  const welcomeMessage = getSettingWithDefault<string>(
    'welcome_message',
    'to the team',
  )

  const headingEl =
    document.querySelector<HTMLParagraphElement>('#welcome-heading')!
  headingEl.textContent = welcomeHeading

  const messageEl =
    document.querySelector<HTMLParagraphElement>('#welcome-message')!
  messageEl.textContent = welcomeMessage

  signalReady()
}
