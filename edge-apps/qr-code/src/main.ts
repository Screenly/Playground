import {
  setupTheme,
  getSettingWithDefault,
  signalReady,
} from '@screenly/edge-apps'

window.onload = function () {
  const url = getSettingWithDefault<string>('url', '')
  const enableUtm = getSettingWithDefault<boolean>('enable_utm', false)
  const headline = getSettingWithDefault<string>('headline', '')
  const callToAction = getSettingWithDefault<string>('call_to_action', '')

  // Setup branding colors using the library
  setupTheme()

  // Signal that the app is ready using the library
  signalReady()
}
