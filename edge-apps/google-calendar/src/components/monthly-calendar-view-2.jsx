import '@/scss/monthly-calendar-view.scss'
import { useState, useEffect } from 'react'
import { getFormattedTime } from '@/utils'

const MonthlyCalendarView = ({
  currentMonthName,
  currentYear,
  currentDate,
  events = [],
  locale = 'en-US'
}) => {
  const [formattedEventTimes, setFormattedEventTimes] = useState({})

  useEffect(() => {
    const times = {}
    events.forEach((event, index) => {
      getFormattedTime(new Date(event.startTime), locale)
        .then(formattedTime => {
          times[index] = formattedTime
          setFormattedEventTimes(prev => ({ ...prev, ...times }))
        })
    })
  }, [events, locale])

  return (
    <div className='MonthlyCalendarView primary-card'>
      <div className='events-heading'>
        <h1>{currentMonthName} {currentDate}, {currentYear}</h1>
      </div>
      <div className='events-container'>
        {events.length > 0
          ? (
              events.map((event, index) => (
                <div key={index} className='event-row'>
                  <div className='event-time'>
                    {
                  formattedEventTimes[index]
                }
                  </div>
                  <div className='event-details'>
                    <div className='event-title'>{event.title}</div>
                  </div>
                </div>
              ))
            )
          : (
            <div className='no-events'>No events scheduled for today</div>
            )}
      </div>
    </div>
  )
}

export default MonthlyCalendarView
