import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { getLocale, getTimeZone } from '@/utils'
import '@/components/weekly-calendar-view.css'

const WeeklyCalendarView = ({ now, events }) => {
  const DAYS_OF_WEEK = useMemo(
    () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    []
  )
  const [timeSlots, setTimeSlots] = useState([])
  const [locale, setLocale] = useState(null)
  const WINDOW_HOURS = 12
  const timezone = useMemo(() => getTimeZone(), [])

  // Cache current hour calculation
  const currentHourInfo = useMemo(() => {
    const hour = parseInt(
      new Date(now).toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone
      })
    )
    return {
      current: hour,
      start: hour - 1,
      windowStart: (hour - 2 + 24) % 24
    }
  }, [now, timezone])

  // Cache start of week date
  const weekStart = useMemo(() => {
    const d = new Date(now)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  }, [now])

  // Generate time slots with memoized locale
  useEffect(() => {
    const generateTimeSlots = async () => {
      const userLocale = await getLocale()
      setLocale(userLocale)

      const slots = []
      const baseDate = new Date(now)

      for (let i = 0; i < WINDOW_HOURS; i++) {
        const hour = (currentHourInfo.start + i) % 24

        // Skip slots at or after midnight
        if (hour === 0 || currentHourInfo.start + i >= 24) {
          continue
        }

        baseDate.setHours(hour, 0, 0, 0)
        slots.push({
          time: baseDate.toLocaleTimeString(userLocale, {
            hour: 'numeric',
            minute: '2-digit'
          }),
          hour
        })
      }

      setTimeSlots(slots)
    }

    generateTimeSlots()
  }, [now, timezone, currentHourInfo])

  // Cache event day indices for faster lookup
  const eventDayIndices = useMemo(() => {
    if (!events) return new Map()

    const indices = new Map()
    events.forEach((event) => {
      const eventStart = new Date(event.startTime)
      const eventHour = parseInt(
        eventStart.toLocaleString('en-US', {
          hour: 'numeric',
          hour12: false,
          timeZone: timezone
        })
      )

      const eventDayOfWeek = eventStart.toLocaleString('en-US', {
        weekday: 'long',
        timeZone: timezone
      })

      const dayIndex = DAYS_OF_WEEK.findIndex((day) =>
        day.toLowerCase().startsWith(eventDayOfWeek.toLowerCase().slice(0, 3))
      )

      const key = `${dayIndex}-${eventHour}`
      if (!indices.has(key)) {
        indices.set(key, [])
      }
      indices.get(key).push(event)
    })

    return indices
  }, [events, DAYS_OF_WEEK, timezone])

  // Optimized event filtering using cached indices
  const getEventsForTimeSlot = useCallback(
    (hour, dayOffset) => {
      const key = `${dayOffset}-${hour}`
      const slotEvents = eventDayIndices.get(key) || []

      return slotEvents.filter((event) => {
        const isBeforeMidnight = hour < 24
        const isInWindow =
          hour >= currentHourInfo.windowStart &&
          hour < currentHourInfo.windowStart + WINDOW_HOURS

        return isBeforeMidnight && isInWindow
      })
    },
    [eventDayIndices, currentHourInfo]
  )

  // Memoize header date calculation
  const getHeaderDate = useCallback(
    (dayIndex) => {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + dayIndex)
      return date.getDate()
    },
    [weekStart]
  )

  // Memoize today check
  const isToday = useCallback(
    (dayIndex) => {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + dayIndex)
      const today = new Date(now)
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      )
    },
    [weekStart, now]
  )

  // Cache event style calculations
  const eventStyles = useMemo(() => {
    const styles = new Map()

    if (!events) return styles

    events.forEach((event) => {
      const startTime = new Date(event.startTime)
      const endTime = new Date(event.endTime)

      const startMinutes = startTime.getMinutes()
      const topOffset = startMinutes === 0 ? 50 : (startMinutes / 60) * 100 + 50

      // Calculate duration in hours and minutes
      let durationHours = endTime.getHours() - startTime.getHours()
      let durationMinutes = endTime.getMinutes() - startTime.getMinutes()

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
      const lastVisibleHour = timeSlots[timeSlots.length - 1].hour
      const maxVisibleHeight = (lastVisibleHour - startTime.getHours()) * 100

      // Limit the height to the maximum visible height
      let height = Math.min(rawHeight, maxVisibleHeight)

      const endHour = endTime.getHours()
      // Check if the event extends beyond the visible time slots
      if (endHour >= timeSlots[timeSlots.length - 1].hour ||
          (endTime.getDate() !== startTime.getDate() && endHour < timeSlots[0].hour)) {
        // Add the dotted border to indicate the event continues beyond the visible area
        styles.set(event.startTime, {
          ...styles.get(event.startTime),
          borderBottomLeftRadius: '0',
          borderBottomRightRadius: '0',
          borderBottom: '3px dotted white'
        })
      }

      styles.set(event.startTime, {
        ...styles.get(event.startTime),
        top: `${topOffset}%`,
        height: `${height}%`
      })
    })

    return styles
  }, [events])

  // Memoize month/year display
  const monthYearDisplay = useMemo(() => {
    if (!locale) return ''
    const date = new Date(now)
    const monthYear = date.toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric'
    })
    const [month, year] = monthYear.split(' ')
    return `${month.toUpperCase()} ${year}`
  }, [now, locale])

  if (!locale) return null

  return (
    <div className='primary-card weekly-view'>
      <div className='weekly-calendar'>
        <div className='month-year-header'>{monthYearDisplay}</div>
        <div className='week-header'>
          <div className='time-label-spacer' />
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className='day-header'>
              <span>{day} </span>
              <span className={isToday(index) ? 'current-date' : ''}>
                {getHeaderDate(index)}
              </span>
            </div>
          ))}
        </div>
        <div className='week-body'>
          {timeSlots.map((slot) => (
            <div key={slot.hour} className='week-row'>
              <div className='time-label'>{slot.time}</div>
              {DAYS_OF_WEEK.map((_, dayIndex) => (
                <div key={`${dayIndex}-${slot.hour}`} className='day-column'>
                  <div className='hour-line' />
                  {getEventsForTimeSlot(slot.hour, dayIndex).map((event) => (
                    <div
                      key={event.startTime}
                      className='calendar-event-item'
                      style={eventStyles.get(event.startTime)}
                    >
                      <div className='event-title'>{event.title}</div>
                      <TimeDisplay
                        startTime={event.startTime}
                        endTime={event.endTime}
                        locale={locale}
                        timezone={timezone}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Optimized TimeDisplay component
const TimeDisplay = React.memo(({ startTime, endTime, locale, timezone }) => {
  const timeString = useMemo(() => {
    const start = new Date(startTime).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone
    })

    const end = new Date(endTime).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone
    })

    return `${start} - ${end}`
  }, [startTime, endTime, locale, timezone])

  return <span className='event-time'>{timeString}</span>
})

export default React.memo(WeeklyCalendarView)
