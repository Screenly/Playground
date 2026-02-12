import './css/style.css'

import {
  getSettingWithDefault,
  getTimeZone,
  getLocale,
  setupTheme,
  signalReady,
  setupErrorHandling,
  formatLocalizedDate,
} from '@screenly/edge-apps'
import '@screenly/edge-apps/components'
import { createTimerState } from './timer'
import { createProgressRingSVG, updateProgressRing } from './progress-ring'

const DATE_UPDATE_INTERVAL_MS = 60 * 1000
const TIMER_UPDATE_INTERVAL_MS = 1000

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()
  setupTheme()

  const dateEl = document.querySelector('[data-date]')
  const digitsEl = document.querySelector('[data-timer-digits]')
  const totalEl = document.querySelector('[data-timer-total]')
  const ringContainer = document.querySelector('[data-progress-ring]')

  const durationStr = getSettingWithDefault<string>('duration', '60')
  const totalDuration = Math.max(1, Math.floor(Number(durationStr) || 60))

  const timezone = await getTimeZone()
  const locale = await getLocale()

  // Update date display
  function updateDate() {
    if (dateEl) {
      const now = new Date()
      dateEl.textContent = formatLocalizedDate(now, locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: timezone,
      })
    }
  }

  // Create progress ring
  const ringSvg = createProgressRingSVG(400)
  if (ringContainer) {
    ringContainer.appendChild(ringSvg)
  }

  let elapsedSeconds = 0

  function updateDisplay(state: ReturnType<typeof createTimerState>) {
    if (digitsEl) {
      digitsEl.innerHTML = `${state.hours}:${state.minutes}:<span class="accent">${state.seconds}</span>`
    }

    if (totalEl) {
      totalEl.textContent = state.totalLabel
    }

    updateProgressRing(ringSvg, state.progress)
  }

  updateDate()
  updateDisplay(createTimerState(totalDuration, elapsedSeconds))

  // Keep the date display fresh in case the app runs across midnight
  setInterval(updateDate, DATE_UPDATE_INTERVAL_MS)

  const intervalId = setInterval(() => {
    elapsedSeconds++
    const state = createTimerState(totalDuration, elapsedSeconds)
    updateDisplay(state)

    if (state.finished) {
      clearInterval(intervalId)
    }
  }, TIMER_UPDATE_INTERVAL_MS)

  signalReady()
})
