import './css/style.css'
import '@screenly/edge-apps/components'

import {
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'

import { initScreens } from './core/screen'
import { initTimers } from './core/timer'
import { initPublicClock } from './features/publicClock'
import { initOperatorDashboard } from './features/operatorDashboard'
import { initSafetyCarousel } from './features/safetyCarousel'

document.addEventListener('DOMContentLoaded', () => {
  setupErrorHandling()
  setupTheme()

  initScreens()
  initTimers()
  initPublicClock()
  initOperatorDashboard()
  initSafetyCarousel()

  signalReady()
})
