import '@/scss/calendar-overview.scss'

const CalendarOverview = ({
  currentDate,
  currentMonthName,
  currentYear,
  currentTime,
  events,
  locale
}) => {
  // Generate week days based on locale
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Generate calendar days with proper month handling
  const generateCalendarDays = () => {
    const date = new Date(currentYear, new Date(`${currentMonthName} 1, ${currentYear}`).getMonth(), 1)
    const firstDayOfMonth = date.getDay() // 0-6 (Sunday-Saturday)
    const daysInMonth = new Date(currentYear, date.getMonth() + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, date.getMonth(), 0).getDate()

    const calendarDays = []

    // Add days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      calendarDays.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false
      })
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        isCurrentMonth: true
      })
    }

    // Calculate how many days we need to complete the last week
    const totalDays = calendarDays.length
    const remainingDays = (7 - (totalDays % 7)) % 7

    // Add days from next month only if needed to complete the last week
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        day: i,
        isCurrentMonth: false
      })
    }

    return calendarDays
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className='CalendarOverview secondary-card calendar-overview-card'>
      <div className='calendar'>
        <div className='calendar-header'>
          {currentMonthName} {currentYear}
        </div>
        <div className='calendar-weekdays'>
          {weekDays.map((day, index) => (
            <div key={index}>{day}</div>
          ))}
        </div>
        <div className='calendar-grid'>
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`calendar-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${
                day.day === currentDate && day.isCurrentMonth
                  ? 'current-day'
                  : ''
              }`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CalendarOverview
