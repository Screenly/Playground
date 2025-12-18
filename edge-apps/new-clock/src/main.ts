import { setupTheme, getSetting, signalReady } from '@screenly/edge-apps'

window.onload = function () {
  const message = getSetting<string>('message') || 'Hello, world!'

  // Setup branding colors using the library
  setupTheme()

  // Set the message
  const messageElement =
    document.querySelector<HTMLParagraphElement>('#message')
  if (messageElement) {
    messageElement.textContent = message
  }

  // Signal that the app is ready using the library
  signalReady()
}
