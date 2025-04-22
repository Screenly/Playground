import React, { useEffect, useState } from 'react'
import { getFormattedTime } from '@/utils'

const DailyCalendarView = ({ now, events }) => {
  const TOTAL_HOURS = 12 // Total number of time slots to display
  const HOURS_BEFORE = 1 // Hours to show before current time
  const [timeSlots, setTimeSlots] = useState([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const generateTimeSlots = async (currentDate) => {
      const currentHour = currentDate.getHours()
      const startHour = currentHour - HOURS_BEFORE

      const slots = []
      for (let i = 0; i < TOTAL_HOURS; i++) {
        const hour = (startHour + i + 24) % 24 // Ensure hour is between 0-23
        const slotTime = new Date(currentDate)
        slotTime.setHours(hour, 0, 0, 0)

        try {
          const formattedTime = await getFormattedTime(slotTime)
          slots.push({
            time: formattedTime,
            hour
          })
        } catch (error) {
          console.error('Error formatting time:', error)
          // Fallback to a simple time format if the async call fails
          slots.push({
            time: `${hour}:00`,
            hour
          })
        }
      }

      setTimeSlots(slots)
      setIsReady(true)
    }

    generateTimeSlots(now)
  }, [now])

  // Helper function to check if an event belongs in a time slot
  const getEventsForTimeSlot = (hour) => {
    return events.filter(event => {
      const startHour = new Date(event.startTime).getHours()
      return startHour === hour
    })
  }

  // Helper function to calculate event position and height
  const getEventStyle = (event) => {
    const startTime = new Date(event.startTime)
    const endTime = new Date(event.endTime)

    const startHour = startTime.getHours()
    const startMinutes = startTime.getMinutes()
    const endHour = endTime.getHours()
    const endMinutes = endTime.getMinutes()

    // Calculate position from top (percentage within the slot)
    // Add 50% offset to align with hour lines
    const topOffset = startMinutes === 0 ? 50 : (startMinutes / 60) * 100 + 50

    // Calculate duration in hours and minutes
    let durationHours = endHour - startHour
    let durationMinutes = endMinutes - startMinutes

    // Handle events that span across midnight
    if (endTime.getDate() !== startTime.getDate()) {
      // Add 24 hours to account for the day change
      durationHours += 24
    }

    // Handle negative minutes
    if (durationMinutes < 0) {
      durationHours -= 1
      durationMinutes += 60
    }

    // Calculate the raw height
    const rawHeight = (durationHours + durationMinutes / 60) * 100

    // Determine the maximum visible height based on the last time slot
    const lastVisibleHour = timeSlots[timeSlots.length - 1]?.hour || 23
    const maxVisibleHeight = (lastVisibleHour - startHour) * 100

    // Limit the height to the maximum visible height
    const height = Math.min(rawHeight, maxVisibleHeight)

    // Add dotted border if event extends beyond visible area
    const style = {
      top: `${topOffset}%`,
      height: `${height}%`,
      borderRadius: '6px',
      border: '2px solid var(--border-color, white)'
    }

    // Check if the event extends beyond the visible time slots
    if (endHour >= lastVisibleHour ||
        (endTime.getDate() !== startTime.getDate() && endHour < timeSlots[0]?.hour)) {
      style.borderBottomLeftRadius = '0'
      style.borderBottomRightRadius = '0'
      style.borderBottom = '3px dotted var(--border-color, white)'
    }

    return style
  }

  // If not ready, show a simple loading state
  if (!isReady || timeSlots.length === 0) {
    return (
      <div className='primary-card'>
        <div className='daily-calendar'>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            Loading calendar...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='primary-card'>
      <div className='daily-calendar'>
        {timeSlots.map((slot, index) => (
          <div key={index} className='time-slot'>
            <div className='time-label'>{slot.time}</div>
            <div className='time-content'>
              <div className='hour-line' />
              {getEventsForTimeSlot(slot.hour).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className='calendar-event-item'
                  style={getEventStyle(event)}
                >
                  <div style={{
                    marginBottom: '0.5rem'
                  }}
                  >
                    {event.title}
                  </div>

                  <div>
                    <TimeDisplay event={event} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper component to handle async time formatting
const TimeDisplay = ({ event }) => {
  const [timeString, setTimeString] = useState('')

  useEffect(() => {
    const updateTime = async () => {
      try {
        const start = await getFormattedTime(new Date(event.startTime))
        const end = await getFormattedTime(new Date(event.endTime))
        setTimeString(`${start} - ${end}`)
      } catch (error) {
        console.error('Error formatting time:', error)
        // Fallback to a simple time format if the async call fails
        const startTime = new Date(event.startTime)
        const endTime = new Date(event.endTime)
        setTimeString(`${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`)
      }
    }
    updateTime()
  }, [event])

  return <>{timeString}</>
}

export default DailyCalendarView
