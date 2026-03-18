import './css/style.css'
import '@screenly/edge-apps/components'
import type { WeeklyCalendarView } from '@screenly/edge-apps/components'
import type { DailyCalendarView } from '@screenly/edge-apps/components'
import type { ScheduleCalendarView } from '@screenly/edge-apps/components'
import {
  setupErrorHandling,
  setupTheme,
  signalReady,
  getLocale,
  getTimeZone,
  getCredentials,
  getSettingWithDefault,
  centerAutoScalerVertically,
} from '@screenly/edge-apps'
import { fetchCalendarEventsFromGoogleAPI } from './events.js'

const EVENTS_REFRESH_INTERVAL = 10_000
const TOKEN_REFRESH_INTERVAL_SEC = 30 * 60

const initTokenRefreshLoop = (onRefresh: () => Promise<void>) => {
  let errorStep = 0
  const initErrorDelaySec = 15
  const maxErrorStep = 7

  const run = async () => {
    let nextTimeout = TOKEN_REFRESH_INTERVAL_SEC
    try {
      await onRefresh()
      errorStep = 0
    } catch {
      nextTimeout = Math.min(
        initErrorDelaySec * Math.pow(2, errorStep),
        nextTimeout,
      )
      if (errorStep >= maxErrorStep) return
      errorStep++
    }
    setTimeout(run, nextTimeout * 1000)
  }

  setTimeout(run, TOKEN_REFRESH_INTERVAL_SEC * 1000)
}

document.addEventListener('DOMContentLoaded', async () => {
  const scaler = document.querySelector('auto-scaler')
  scaler?.addEventListener('scalechange', centerAutoScalerVertically)
  window.addEventListener('resize', centerAutoScalerVertically)
  centerAutoScalerVertically()
  setupErrorHandling()
  setupTheme()

  const calendarMode = getSettingWithDefault('calendar_mode', 'schedule')

  const scheduleEl = document.getElementById(
    'schedule-calendar',
  ) as ScheduleCalendarView
  const weeklyEl = document.getElementById(
    'weekly-calendar',
  ) as WeeklyCalendarView
  const dailyEl = document.getElementById('daily-calendar') as DailyCalendarView

  const activeEl =
    calendarMode === 'daily'
      ? dailyEl
      : calendarMode === 'weekly'
        ? weeklyEl
        : scheduleEl

  activeEl.classList.add('active')

  const timezone = await getTimeZone()
  const locale = await getLocale()
  activeEl.setAttribute('timezone', timezone)
  activeEl.setAttribute('locale', locale)

  const tick = () => {
    activeEl.now = new Date()
  }
  tick()
  setInterval(tick, 30_000)

  // Token management
  let accessToken: string | null =
    getSettingWithDefault('access_token', '') || null

  const refreshToken = async () => {
    try {
      const { token } = await getCredentials()
      accessToken = token
    } catch (error) {
      console.warn('Failed to refresh access token:', error)
    }
  }

  // If no static token, fetch dynamically
  if (!accessToken) {
    await refreshToken()
  }
  initTokenRefreshLoop(refreshToken)

  const refresh = async () => {
    if (!accessToken) return
    try {
      const events = await fetchCalendarEventsFromGoogleAPI(
        accessToken,
        timezone,
      )
      activeEl.events = events
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
    }
  }
  await refresh()
  setInterval(refresh, EVENTS_REFRESH_INTERVAL)

  signalReady()
})
