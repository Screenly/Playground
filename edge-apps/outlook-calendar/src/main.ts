import './css/style.css'
import '@screenly/edge-apps/components'
import type { WeeklyCalendarView } from '@screenly/edge-apps/components'
import type { DailyCalendarView } from '@screenly/edge-apps/components'
import type { ScheduleCalendarView } from '@screenly/edge-apps/components'
import {
  getCredentials,
  getSettingWithDefault,
  initCalendarApp,
  initTokenRefreshLoop,
  setupErrorHandling,
  setupTheme,
} from '@screenly/edge-apps'
import { fetchCalendarEventsFromMicrosoftAPI } from './events.js'

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()
  setupTheme()

  const calendarMode = getSettingWithDefault(
    'calendar_mode',
    'schedule',
  ) as string

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

  let accessToken: string | null =
    getSettingWithDefault('access_token', '') || null

  const refreshToken = async () => {
    const { token } = await getCredentials()
    accessToken = token
  }

  if (!accessToken) {
    try {
      await refreshToken()
    } catch (error) {
      console.warn('Failed to fetch initial access token:', error)
    }
  }
  initTokenRefreshLoop(refreshToken)

  await initCalendarApp(activeEl, async (timezone) => {
    if (!accessToken) return []
    return fetchCalendarEventsFromMicrosoftAPI(accessToken, timezone)
  })
})
