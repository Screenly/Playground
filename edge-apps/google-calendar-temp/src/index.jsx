/* global screenly */

import { createSignal, createEffect, onCleanup } from 'solid-js'
import { render } from 'solid-js/web'
import {
  getFormattedTime,
  generateCalendarDays,
  initializeGlobalBrandingSettings,
  // initializeSentrySettings, // TODO: Uncomment this when we have a proper Sentry setup.
  getFormattedMonthName,
  getYear,
  getMonth,
  getDate,
  getAccessToken
} from '@/utils'
import MonthlyCalendarView from '@/components/monthly-calendar-view'
import CalendarOverview from '@/components/calendar-overview'
import InfoCard from '@/components/info-card'
import { fetchCalendarEvents } from '@/events'
import '@/css/common.css'
import '@/css/style.css'
import DailyCalendarView from '@/components/daily-calendar-view'
import AnalogClock from '@/components/analog-clock'
import WeeklyCalendarView from '@/components/weekly-calendar-view'
import { TOKEN_REFRESH_INTERVAL } from '@/constants'

// Main App Component
const App = () => {
  const [now, setNow] = createSignal(new Date())
  const [weeklyViewTime, setWeeklyViewTime] = createSignal(new Date())
  const [calendarDays] = createSignal(
    generateCalendarDays(getYear(now()), getMonth(now()))
  )
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [events, setEvents] = createSignal([])
  const [calendarMode] = createSignal(
    screenly.settings.calendar_mode || 'monthly'
  )
  const [currentTime, setCurrentTime] = createSignal('')
  let currentToken = ''

  const updateDateTime = async () => {
    const newNow = new Date()
    setNow(newNow)
    const time = await getFormattedTime(newNow)
    setCurrentTime(time)
  }

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    try {
      const {
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      } = screenly.settings

      if (refreshToken && clientId && clientSecret) {
        const newToken = await getAccessToken(refreshToken, clientId, clientSecret)
        currentToken = newToken
        return newToken
      }
      return null
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return null
    }
  }

  createEffect(() => {
    initializeGlobalBrandingSettings()

    const timeInterval = setInterval(updateDateTime, 1000)

    const weeklyViewTimeInterval = setInterval(() => {
      setWeeklyViewTime(new Date())
    }, 60000)

    const tokenInterval = setInterval(refreshAccessToken, TOKEN_REFRESH_INTERVAL)

    let eventsInterval

    const setupEventsFetching = async () => {
      const token = await refreshAccessToken()

      if (token) {
        eventsInterval = setInterval(async () => {
          const fetchedEvents = await fetchCalendarEvents(currentToken)
          setEvents(fetchedEvents)
        }, 5000)

        const initialEvents = await fetchCalendarEvents(token)
        setEvents(initialEvents)
      }
    }

    setupEventsFetching()

    setCurrentTime(getFormattedTime(now()))

    try {
      screenly.signalReadyForRendering()
    } catch (error) {
      console.error('Error signaling ready for rendering:', error)
    }

    onCleanup(() => {
      clearInterval(timeInterval)
      clearInterval(weeklyViewTimeInterval)
      clearInterval(tokenInterval)
      if (eventsInterval) clearInterval(eventsInterval)
    })
  })

  return (
    <div class='main-container'>
      <div class='secondary-container'>
        <div class='row-container'>
          {calendarMode() === 'monthly'
            ? (
              <CalendarOverview
                currentDate={getDate(now())}
                currentMonthName={getFormattedMonthName(now())}
                currentYear={getYear(now())}
                currentTime={currentTime()}
                events={events()}
              />
              )
            : (
              <AnalogClock now={now()} />
              )}
        </div>
        <div class='row-container'>
          <InfoCard />
        </div>
      </div>
      {calendarMode() === 'monthly' && (
        <MonthlyCalendarView
          currentMonthName={getFormattedMonthName(now())}
          currentYear={getYear(now())}
          weekDays={weekDays}
          calendarDays={calendarDays()}
          currentDate={getDate(now())}
        />
      )}
      {calendarMode() === 'daily' && (
        <DailyCalendarView now={now()} events={events()} />
      )}
      {calendarMode() === 'weekly' && (
        <WeeklyCalendarView now={weeklyViewTime()} events={events()} />
      )}
    </div>
  )
}

// TODO: Uncomment this when we have a proper Sentry setup.
// initializeSentrySettings()

const container = document.getElementById('app')
render(() => <App />, container)
