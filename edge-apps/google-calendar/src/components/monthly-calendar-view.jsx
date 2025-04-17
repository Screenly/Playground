const MonthlyCalendarView = ({
  currentMonthName,
  currentYear,
  weekDays,
  calendarDays,
  currentDate
}) => {
  return (
    <div className='primary-card'>
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

export default MonthlyCalendarView
