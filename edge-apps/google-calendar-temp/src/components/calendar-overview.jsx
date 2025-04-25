import { createSignal, createEffect } from 'solid-js'

const CalendarOverview = (props) => {
  const [formattedTime, setFormattedTime] = createSignal('')
  const [filteredEvents, setFilteredEvents] = createSignal([])

  createEffect(async () => {
    const time = await props.currentTime
    setFormattedTime(time)
  })

  createEffect(() => {
    // Filter events for next 24 hours
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setHours(now.getHours() + 24)

    const upcomingEvents = props.events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return eventStart >= now && eventStart < tomorrow
    })

    setFilteredEvents(upcomingEvents)
  })

  return (
    <div class='secondary-card calendar-overview-card'>
      <div class='calendar-top'>
        <div class='calendar-date'>
          <span class='date-number-circle'>{props.currentDate}</span>
          <span class='month-name'>
            {props.currentMonthName} {props.currentYear}
          </span>
        </div>
        <div class='calendar-event'>
          {filteredEvents().length > 0
            ? (
                filteredEvents().map((event, index) => (
                  <p key={index}>{event.title}</p>
                ))
              )
            : (
              <p>Nothing scheduled in next 24 hours</p>
              )}
        </div>
      </div>
      <div class='calendar-bottom'>
        <h1 class='calendar-time'>{formattedTime()}</h1>
      </div>
    </div>
  )
}

export default CalendarOverview
