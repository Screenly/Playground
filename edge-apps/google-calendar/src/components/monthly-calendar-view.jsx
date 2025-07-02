import '@/scss/monthly-calendar-view.scss'
import { useState, useEffect } from 'react'
import { getFormattedTime } from '@/utils'

const MAX_EVENTS = 7

const MonthlyCalendarView = ({
  currentDayOfWeek,
  events = [],
  locale = 'en-US'
}) => {
  const [filteredEvents, setFilteredEvents] = useState([])
  const [formattedEventTimes, setFormattedEventTimes] = useState({})

  useEffect(() => {
    // Filter events for next 24 hours
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setHours(now.getHours() + 24)

    const upcomingEvents = events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return eventStart >= now && eventStart < tomorrow
    })

    // Sort events by start time
    upcomingEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    const limitedEvents = upcomingEvents.slice(0, MAX_EVENTS)
    setFilteredEvents(limitedEvents)

    // Format times for all events
    const times = {}
    upcomingEvents.forEach(event => {
      getFormattedTime(new Date(event.startTime), locale)
        .then(formattedTime => {
          times[event.startTime] = formattedTime
          setFormattedEventTimes(prev => ({ ...prev, ...times }))
        })
    })
  }, [events, locale])

  return (
    <div className='MonthlyCalendarView primary-card'>
      <div className='events-heading'>
        <h1>{currentDayOfWeek}</h1>
      </div>
      <div className='events-container'>
        {filteredEvents.length > 0
          ? (
              filteredEvents.map((event, index) => (
                <div key={index} className='event-row'>
                  <div className='event-time'>
                    {formattedEventTimes[event.startTime] || '...'}
                  </div>
                  <div className='event-details'>
                    <div className='event-title'>
                      <span className='event-dot'>•</span>
                      {event.title}
                    </div>
                  </div>
                </div>
              ))
            )
          : (
            <div className='no-events'>No events scheduled for next 24 hours</div>
            )}
      </div>
    </div>
  )
}

export default MonthlyCalendarView
