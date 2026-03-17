import './css/style.css'
import '@screenly/edge-apps/components'
import type { WeeklyCalendarView } from '@screenly/edge-apps/components'
import {
  setupErrorHandling,
  setupTheme,
  signalReady,
  getLocale,
  getTimeZone,
} from '@screenly/edge-apps'
import { fetchCalendarEventsFromICal } from './events.js'

const EVENTS_REFRESH_INTERVAL = 10_000

function centerAutoScalerVertically() {
  const scaler = document.querySelector('auto-scaler') as HTMLElement | null
  if (!scaler) return
  const scaledHeight = scaler.getBoundingClientRect().height
  const offsetY = Math.max(0, (window.innerHeight - scaledHeight) / 2)
  scaler.style.top = `${offsetY}px`
}

document.addEventListener('DOMContentLoaded', async () => {
  const scaler = document.querySelector('auto-scaler')
  scaler?.addEventListener('scalechange', centerAutoScalerVertically)
  window.addEventListener('resize', centerAutoScalerVertically)
  centerAutoScalerVertically()
  setupErrorHandling()
  setupTheme()

  const calendarEl = document.getElementById('calendar') as WeeklyCalendarView

  const timezone = await getTimeZone()
  const locale = await getLocale()

  calendarEl.setAttribute('timezone', timezone)
  calendarEl.setAttribute('locale', locale)

  const tick = () => {
    calendarEl.now = new Date()
  }
  tick()
  setInterval(tick, 1000)

  const refresh = async () => {
    try {
      const events = await fetchCalendarEventsFromICal({ timezone })
      calendarEl.events = events
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
    }
  }
  await refresh()
  setInterval(refresh, EVENTS_REFRESH_INTERVAL)

  signalReady()
})
