import React, { useEffect, useState } from 'react'

const CalendarOverview = ({
  currentDate,
  currentMonthName,
  currentYear,
  currentTime,
  events
}) => {
  const [formattedTime, setFormattedTime] = useState('')
  const [filteredEvents, setFilteredEvents] = useState([])

  const getStyledFormattedTime = () => {
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

  useEffect(() => {
    const updateTime = async () => {
      const time = await currentTime
      setFormattedTime(time)
    }
    updateTime()
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

    setFilteredEvents(upcomingEvents)
  }, [events])

  return (
    <div className='secondary-card calendar-overview-card'>
      <div className='calendar-top'>
        <div className='calendar-date'>
          <span className='date-number-circle'>{currentDate}</span>
          <span className='month-name'>
            {currentMonthName} {currentYear}
          </span>
        </div>
        <div className='calendar-event'>
          {filteredEvents.length > 0
            ? (
                filteredEvents.map((event, index) => (
                  <p key={index}>{event.title}</p>
                ))
              )
            : (
              <p>Nothing scheduled in next 24 hours</p>
              )}
        </div>
      </div>
      <div className='calendar-bottom'>
        <h1 className='calendar-time'>
          {getStyledFormattedTime()}
        </h1>
      </div>
    </div>
  )
}

export default CalendarOverview
