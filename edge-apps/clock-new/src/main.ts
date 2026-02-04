import './css/style.css'

import {
  setupTheme,
  setupErrorHandling,
  signalReady,
} from '@screenly/edge-apps'

window.onload = function () {
  // Setup error handling with panic-overlay
  setupErrorHandling()

  // Setup branding colors using the library
  setupTheme()

  // Signal that the app is ready using the library
  signalReady()
}
