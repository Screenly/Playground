/* global screenly */

import { createRoot } from 'react-dom/client'
import { useState, useEffect, useRef } from 'react'
import {
  getFormattedTime,
  generateCalendarDays,
  initializeGlobalBrandingSettings,
  initializeSentrySettings,
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
  const [now, setNow] = useState(new Date())
  const [calendarDays] = useState(
    generateCalendarDays(getYear(now), getMonth(now))
  )
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [events, setEvents] = useState([])
  const [calendarMode] = useState(
    screenly.settings.calendar_mode || 'monthly'
  )
  const [currentTime, setCurrentTime] = useState('')
  const currentTokenRef = useRef('')

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
        currentTokenRef.current = newToken
        return newToken
      }
      return null
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return null
    }
  }

  useEffect(() => {
    initializeGlobalBrandingSettings()

    const timeInterval = setInterval(updateDateTime, 1000)

    // Set up token refresh interval
    const tokenInterval = setInterval(refreshAccessToken, TOKEN_REFRESH_INTERVAL)

    // Initial token fetch and events setup
    let eventsInterval

    const setupEventsFetching = async () => {
      // Get initial token
      const token = await refreshAccessToken()

      if (token) {
        // Set up events interval only after we have a token
        eventsInterval = setInterval(async () => {
          const fetchedEvents = await fetchCalendarEvents(currentTokenRef.current)
          setEvents(fetchedEvents)
        }, 5000)

        // Initial events fetch
        const initialEvents = await fetchCalendarEvents(token)
        setEvents(initialEvents)
      }
    }

    // Start the setup process
    setupEventsFetching()

    setCurrentTime(getFormattedTime(now))

    // Signal ready for rendering
    try {
      screenly.signalReadyForRendering()
    } catch (error) {
      console.error('Error signaling ready for rendering:', error)
    }

    // Cleanup intervals
    return () => {
      clearInterval(timeInterval)
      clearInterval(tokenInterval)
      if (eventsInterval) clearInterval(eventsInterval)
    }
  }, [])

  return (
    <div className='main-container'>
      <div className='secondary-container'>
        <div className='row-container'>
          {calendarMode === 'monthly'
            ? (
              <CalendarOverview
                currentDate={getDate(now)}
                currentMonthName={getFormattedMonthName(now)}
                currentYear={getYear(now)}
                currentTime={currentTime}
                events={events}
              />
              )
            : (
              <AnalogClock now={now} />
              )}
        </div>
        <div className='row-container'>
          <InfoCard />
        </div>
      </div>
      {calendarMode === 'monthly' && (
        <MonthlyCalendarView
          currentMonthName={getFormattedMonthName(now)}
          currentYear={getYear(now)}
          weekDays={weekDays}
          calendarDays={calendarDays}
          currentDate={getDate(now)}
        />
      )}
      {calendarMode === 'daily' && (
        <DailyCalendarView now={now} events={events} />
      )}
      {calendarMode === 'weekly' && (
        <WeeklyCalendarView now={now} events={events} />
      )}
    </div>
  )
}

initializeSentrySettings()

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)
