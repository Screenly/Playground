const MonthlyCalendarView = (props) => {
  return (
    <div class='primary-card'>
      <div class='calendar'>
        <div class='calendar-header'>
          {props.currentMonthName} {props.currentYear}
        </div>
        <div class='calendar-weekdays'>
          {props.weekDays.map((day, index) => (
            <div key={index}>{day}</div>
          ))}
        </div>
        <div class='calendar-grid'>
          {props.calendarDays.map((day, index) => (
            <div
              key={index}
              class={`calendar-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${
                day.day === props.currentDate && day.isCurrentMonth
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

export default MonthlyCalendarView
