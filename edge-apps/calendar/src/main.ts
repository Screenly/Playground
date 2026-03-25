import './css/style.css'
import '@screenly/edge-apps/components'
import type { WeeklyCalendarView } from '@screenly/edge-apps/components'
import type { DailyCalendarView } from '@screenly/edge-apps/components'
import type { ScheduleCalendarView } from '@screenly/edge-apps/components'
import {
  getSettingWithDefault,
  initCalendarApp,
  setupErrorHandling,
  setupTheme,
} from '@screenly/edge-apps'
import { fetchCalendarEventsFromICal } from './events.js'

document.addEventListener('DOMContentLoaded', async () => {
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

  await initCalendarApp(activeEl, (timezone) =>
    fetchCalendarEventsFromICal({ timezone }),
  )
})
