import './css/style.css'
import 'highlight.js/styles/monokai.css'
import '@screenly/edge-apps/components'

import {
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'

import { initScreens } from './core/screen'
import { initTimers } from './core/timer'
import { initPublicClock } from './features/public-clock'
import { initOperatorDashboard } from './features/operator-dashboard'
import { initSafetyCarousel } from './features/safety-carousel'
import { initPeripherals } from './features/peripherals'

document.addEventListener('DOMContentLoaded', () => {
  setupErrorHandling()
  setupTheme()

  initScreens()
  initTimers()
  initPublicClock()
  initOperatorDashboard()
  initSafetyCarousel()
  initPeripherals()

  signalReady()
})
