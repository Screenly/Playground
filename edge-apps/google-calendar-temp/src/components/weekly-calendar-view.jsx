import { createEffect, createMemo, createSignal, Show, For } from 'solid-js'
import { getLocale, getTimeZone } from '@/utils'
import '@/components/weekly-calendar-view.css'

const WeeklyCalendarView = (props) => {
  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [timeSlots, setTimeSlots] = createSignal([])
  const [locale, setLocale] = createSignal(null)
  const [isReady, setIsReady] = createSignal(false)
  const WINDOW_HOURS = 12
  const timezone = getTimeZone()

  // Calculate current hour info - memoized for performance
  const currentHourInfo = createMemo(() => {
    const currentHour = parseInt(
      new Date(props.now).toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone
      })
    )
    return {
      current: currentHour,
      start: currentHour - 1,
      windowStart: (currentHour - 2 + 24) % 24
    }
  })

  // Calculate start of week date - memoized for performance
  const weekStart = createMemo(() => {
    const d = new Date(props.now)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  })

  // Generate time slots - optimized for performance
  createEffect(() => {
    const generateTimeSlots = async () => {
      try {
        const userLocale = await getLocale()
        setLocale(userLocale)

        const slots = []
        const baseDate = new Date(props.now)

        for (let i = 0; i < WINDOW_HOURS; i++) {
          const hour = (currentHourInfo().start + i) % 24

          // Skip slots at or after midnight
          if (hour === 0 || currentHourInfo().start + i >= 24) {
            continue
          }

          // Use toLocaleTimeString for proper formatting
          baseDate.setHours(hour, 0, 0, 0)
          const timeString = baseDate.toLocaleTimeString(userLocale, {
            hour: 'numeric',
            minute: '2-digit'
          })

          slots.push({
            time: timeString,
            hour
          })
        }

        setTimeSlots(slots)
        setIsReady(true)
      } catch (error) {
        console.error('Error generating time slots:', error)
        // Fallback to simple time slots if locale fetch fails
        const slots = []
        for (let i = 0; i < WINDOW_HOURS; i++) {
          const hour = (currentHourInfo().start + i) % 24
          if (hour === 0 || currentHourInfo().start + i >= 24) continue

          const formattedHour = hour % 12 || 12
          const ampm = hour < 12 ? 'AM' : 'PM'

          slots.push({
            time: `${formattedHour}:00 ${ampm}`,
            hour
          })
        }
        setTimeSlots(slots)
        setIsReady(true)
      }
    }

    generateTimeSlots()
  })

  // Get events for a specific time slot and day - memoized for performance
  const getEventsForTimeSlot = (hour, dayOffset) => {
    if (!props.events) return []

    return props.events.filter(event => {
      const eventStart = new Date(event.startTime)

      // Use toLocaleString for proper hour and day extraction
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

      const isBeforeMidnight = hour < 24
      const isInWindow =
        hour >= currentHourInfo().windowStart &&
        hour < currentHourInfo().windowStart + WINDOW_HOURS

      return dayIndex === dayOffset && eventHour === hour && isBeforeMidnight && isInWindow
    })
  }

  // Get header date for a specific day - memoized for performance
  const getHeaderDate = (dayIndex) => {
    const date = new Date(weekStart())
    date.setDate(date.getDate() + dayIndex)
    return date.getDate()
  }

  // Check if a day is today - memoized for performance
  const isToday = (dayIndex) => {
    const date = new Date(weekStart())
    date.setDate(date.getDate() + dayIndex)
    const today = new Date(props.now)
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Get style for an event - memoized for performance
  const getEventStyle = (event) => {
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
    const lastVisibleHour = timeSlots()[timeSlots().length - 1]?.hour || 23
    const maxVisibleHeight = (lastVisibleHour - startTime.getHours()) * 100

    // Limit the height to the maximum visible height
    const height = Math.min(rawHeight, maxVisibleHeight)

    const endHour = endTime.getHours()

    // Create the base style object
    const baseStyle = {
      top: `${topOffset}%`,
      height: `${height}%`,
      borderRadius: '6px',
      border: '2px solid var(--border-color, white)'
    }

    // Check if the event extends beyond the visible time slots
    if (endHour >= lastVisibleHour ||
        (endTime.getDate() !== startTime.getDate() && endHour < timeSlots()[0]?.hour)) {
      // Add the dotted border to indicate the event continues beyond the visible area
      baseStyle.borderBottomLeftRadius = '0'
      baseStyle.borderBottomRightRadius = '0'
      baseStyle.borderBottom = '3px dotted var(--border-color, white)'
    }

    return baseStyle
  }

  // Get month/year display - memoized for performance
  const monthYearDisplay = createMemo(() => {
    if (!locale()) return ''
    try {
      const date = new Date(props.now)
      const monthYear = date.toLocaleDateString(locale(), {
        month: 'long',
        year: 'numeric'
      })
      const [month, year] = monthYear.split(' ')
      return `${month.toUpperCase()} ${year}`
    } catch (error) {
      console.error('Error formatting month/year:', error)
      // Fallback to simple format
      const date = new Date(props.now)
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      return `${monthNames[date.getMonth()].toUpperCase()} ${date.getFullYear()}`
    }
  })

  // If not ready, show a simple loading state
  return (
    <div className='primary-card weekly-view'>
      <div className='weekly-calendar'>
        <Show when={!isReady() || timeSlots().length === 0}>
          <div style={{ padding: '2rem', 'text-align': 'center' }}>
            Loading calendar...
          </div>
        </Show>
        <Show when={isReady() && timeSlots().length > 0}>
          <div className='month-year-header'>{monthYearDisplay()}</div>
          <div className='week-header'>
            <div className='time-label-spacer' />
            <For each={DAYS_OF_WEEK}>
              {(day, index) => (
                <div className='day-header'>
                  <span>{day} </span>
                  <span className={isToday(index()) ? 'current-date' : ''}>
                    {getHeaderDate(index())}
                  </span>
                </div>
              )}
            </For>
          </div>
          <div className='week-body'>
            <For each={timeSlots()}>
              {(slot) => (
                <div className='week-row'>
                  <div className='time-label'>{slot.time}</div>
                  <For each={DAYS_OF_WEEK}>
                    {(_, dayIndex) => (
                      <div className='day-column'>
                        <div className='hour-line' />
                        <For each={getEventsForTimeSlot(slot.hour, dayIndex())}>
                          {(event) => (
                            <div
                              className='calendar-event-item'
                              style={getEventStyle(event)}
                            >
                              <div className='event-title'>{event.title}</div>
                              <TimeDisplay
                                startTime={event.startTime}
                                endTime={event.endTime}
                                locale={locale()}
                                timezone={timezone}
                              />
                            </div>
                          )}
                        </For>
                      </div>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}

// Optimized TimeDisplay component
const TimeDisplay = (props) => {
  const [timeString, setTimeString] = createSignal('')

  createEffect(() => {
    const updateTime = () => {
      try {
        // Use toLocaleTimeString for proper formatting
        const start = new Date(props.startTime).toLocaleTimeString(props.locale, {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: props.timezone
        })

        const end = new Date(props.endTime).toLocaleTimeString(props.locale, {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: props.timezone
        })

        setTimeString(`${start} - ${end}`)
      } catch (error) {
        console.error('Error formatting time:', error)
        // Fallback to simple format
        const start = new Date(props.startTime)
        const end = new Date(props.endTime)
        setTimeString(`${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`)
      }
    }

    updateTime()
  })

  return <span className='event-time'>{timeString()}</span>
}

export default WeeklyCalendarView
