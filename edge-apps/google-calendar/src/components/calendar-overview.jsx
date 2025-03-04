const CalendarOverview = ({ currentDate, currentMonthName, currentTime, events }) => {
  return (
    <div className="secondary-card calendar-overview-card">
      <div className="calendar-top">
        <h1 className="calendar-date">
          <span className="date-number-box">{currentDate}</span>
          {currentMonthName}
        </h1>
        <div className="calendar-event">
          {events.length > 0 ? (
            events.map((event, index) => <p key={index}>{event.title}</p>)
          ) : (
            <p>Nothing scheduled on this date</p>
          )}
        </div>
      </div>
      <div className="calendar-bottom">
        <h1 className="calendar-time">{currentTime}</h1>
      </div>
    </div>
  );
};

export default CalendarOverview;
