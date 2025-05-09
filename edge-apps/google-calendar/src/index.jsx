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
  getAccessToken,
  getLocale
} from '@/utils'
import MonthlyCalendarView from '@/components/monthly-calendar-view'
import CalendarOverview from '@/components/calendar-overview'
import InfoCard from '@/components/info-card'
import { fetchCalendarEventsFromAPI, fetchCalendarEventsFromICal } from '@/events'
import '@/css/common.css'
import '@/css/style.css'
import DailyCalendarView from '@/components/daily-calendar-view'
import AnalogClock from '@/components/analog-clock'
import WeeklyCalendarView from '@/components/weekly-calendar-view'
import { TOKEN_REFRESH_INTERVAL } from '@/constants'

// Main App Component
const App = () => {
  const [now, setNow] = useState(new Date())
  const [weeklyViewTime, setWeeklyViewTime] = useState(new Date())
  const [calendarDays] = useState(
    generateCalendarDays(getYear(now), getMonth(now))
  )
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [events, setEvents] = useState([])
  const [calendarMode] = useState(
    screenly.settings.calendar_mode || 'monthly'
  )
  const [currentTime, setCurrentTime] = useState('')
  const [locale, setLocale] = useState('en-US')
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

    const weeklyViewTimeInterval = setInterval(() => {
      setWeeklyViewTime(new Date())
    }, 60000)

    const tokenInterval = setInterval(refreshAccessToken, TOKEN_REFRESH_INTERVAL)

    let eventsInterval

    const setupEventsFetching = async () => {
      const { calendar_source_type: sourceType } = screenly.settings

      if (sourceType === 'api') {
        const token = await refreshAccessToken()

        if (token) {
          eventsInterval = setInterval(async () => {
            const fetchedEvents = await fetchCalendarEventsFromAPI(currentTokenRef.current)
            setEvents(fetchedEvents)
          }, 5000)

          const initialEvents = await fetchCalendarEventsFromAPI(token)
          setEvents(initialEvents)
        }
      } else if (sourceType === 'ical') {
        // For iCal, fetch events immediately and set up interval
        const fetchICalEvents = async () => {
          const fetchedEvents = await fetchCalendarEventsFromICal()
          setEvents(fetchedEvents)
        }

        eventsInterval = setInterval(fetchICalEvents, 5000)
        await fetchICalEvents()
      }
    }

    const setupLocale = async () => {
      try {
        const fetchedLocale = await getLocale()
        setLocale(fetchedLocale)
      } catch (error) {
        console.error('Error fetching locale:', error)
      }
    }

    setupEventsFetching()

    setupLocale()

    getFormattedTime(now)
      .then((time) => {
        setCurrentTime(time)
      })
      .catch((error) => {
        console.error('Error setting up time:', error)
      })

    try {
      screenly.signalReadyForRendering()
    } catch (error) {
      console.error('Error signaling ready for rendering:', error)
    }

    return () => {
      clearInterval(timeInterval)
      clearInterval(weeklyViewTimeInterval)
      clearInterval(tokenInterval)
      if (eventsInterval) clearInterval(eventsInterval)
    }
  }, [])

  return (
    <div className='main-container'>
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
        <WeeklyCalendarView now={weeklyViewTime} events={events} />
      )}
      <div className='secondary-container'>
        <div className='row-container'>
          <InfoCard />
        </div>
        <div className='row-container'>
          {calendarMode === 'monthly'
            ? (
              <CalendarOverview
                currentDate={getDate(now)}
                currentMonthName={getFormattedMonthName(now)}
                currentYear={getYear(now)}
                currentTime={currentTime}
                events={events}
                locale={locale}
              />
              )
            : (
              <AnalogClock now={now} />
              )}
        </div>
      </div>
    </div>
  )
}

initializeSentrySettings()

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)
