import './css/style.css'

import { setupTheme, signalReady } from '@screenly/edge-apps'

window.onload = function () {
  setupTheme()
  signalReady()
}
