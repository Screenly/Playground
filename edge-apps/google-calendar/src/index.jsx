import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import {
  getFormattedTime,
  generateCalendarDays,
  initializeThemeColors,
  getFormattedMonthName,
  getYear,
  getMonth,
  getDate
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

// Main App Component
const App = () => {
  const [now, setNow] = useState(new Date())
  const [calendarDays] = useState(
    generateCalendarDays(getYear(now), getMonth(now))
  )
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [events, setEvents] = useState([])
  const [calendarMode] = useState(
    window.screenly.settings.calendar_mode || 'monthly'
  )
  const [currentTime, setCurrentTime] = useState('')

  const updateDateTime = async () => {
    const newNow = new Date()
    setNow(newNow)
    const time = await getFormattedTime(newNow)
    setCurrentTime(time)
  }

  useEffect(() => {
    initializeThemeColors()

    const timeInterval = setInterval(updateDateTime, 1000)
    const eventsInterval = setInterval(async () => {
      const fetchedEvents = await fetchCalendarEvents()
      setEvents(fetchedEvents)
    }, 1000)

    // Initial events fetch
    fetchCalendarEvents().then(setEvents)

    setCurrentTime(getFormattedTime(now))

    // Signal ready for rendering
    try {
      window.screenly.signalReadyForRendering()
    } catch (error) {
      console.error('Error signaling ready for rendering:', error)
    }

    // Cleanup intervals
    return () => {
      clearInterval(timeInterval)
      clearInterval(eventsInterval)
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

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)
