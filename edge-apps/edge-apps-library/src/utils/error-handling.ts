import panic from 'panic-overlay'
import { getSettingWithDefault, signalReady } from './settings.js'

/**
 * Set up error handling with panic-overlay
 * Configures panic-overlay to display errors on screen if the display_errors setting is enabled
 */
export function setupErrorHandling(): void {
  const displayErrors = getSettingWithDefault<boolean>('display_errors', false)
  panic.configure({
    handleErrors: displayErrors,
  })
  if (displayErrors) {
    window.addEventListener('error', signalReady)
    window.addEventListener('unhandledrejection', signalReady)
  }
}
