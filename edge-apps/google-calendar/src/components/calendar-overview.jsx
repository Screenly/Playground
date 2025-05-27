import React, { useEffect, useState } from 'react'
import { getFormattedTime } from '@/utils'

const StyledFormattedTime = ({ formattedTime }) => {
  if (!formattedTime || typeof formattedTime !== 'string') {
    return ''
  }

  if (formattedTime.endsWith('AM') || formattedTime.endsWith('PM')) {
    return (
      <span>
        {formattedTime.slice(0, -2)}
        <span
          style={{
            fontSize: '0.75em',
            color: 'var(--theme-color-accent)'
          }}
        >
          {formattedTime.slice(-2)}
        </span>
      </span>
    )
  } else {
    return formattedTime
  }
}

const CalendarOverview = ({
  currentDate,
  currentMonthName,
  currentYear,
  currentTime,
  events,
  locale
}) => {
  const [formattedTime, setFormattedTime] = useState('')
  const [filteredEvents, setFilteredEvents] = useState([])
  const [formattedEventTimes, setFormattedEventTimes] = useState({})

  useEffect(() => {
    setFormattedTime(currentTime)
  }, [currentTime])

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

    setFilteredEvents(upcomingEvents)

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
    <div className='secondary-card calendar-overview-card'>
      <div className='calendar-top'>
        <div className='calendar-date'>
          <span className='date-number-circle'>{currentDate}</span>
          <span className='month-name'>
            {currentMonthName} {currentYear}
          </span>
        </div>
        <div className='calendar-event' style={{ width: '100%' }}>
          {filteredEvents.length > 0
            ? (
                filteredEvents.map((event, index) => (
                  <div
                    key={index}
                    className='calendar-overview-event-item'
                    style={{
                      display: 'flex'
                    }}
                  >
                    <div style={{ marginRight: '1rem', flexShrink: 0 }}>•</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 'bold' }}>
                        {formattedEventTimes[event.startTime] || '...'}
                      </span>
                      <br />
                      {event.title}
                    </div>
                  </div>
                ))
              )
            : (
              <p style={{ fontSize: '0.9em' }}>Nothing scheduled in next 24 hours</p>
              )}
        </div>
      </div>
      <div className='calendar-bottom'>
        <h1 className='calendar-time'>
          <StyledFormattedTime formattedTime={formattedTime} />
        </h1>
      </div>
    </div>
  )
}

export default CalendarOverview
