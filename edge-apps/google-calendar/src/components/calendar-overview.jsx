import React, { useEffect, useState } from 'react';

const CalendarOverview = ({ currentDate, currentMonthName, currentYear, currentTime, events }) => {
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    const updateTime = async () => {
      const time = await currentTime;
      setFormattedTime(time);
    };
    updateTime();
  }, [currentTime]);

  return (
    <div className="secondary-card calendar-overview-card">
      <div className="calendar-top">
        <div className="calendar-date">
          <span className="date-number-circle">{currentDate}</span>
          <span className="month-name">{currentMonthName} {currentYear}</span>
        </div>
        <div className="calendar-event">
          {events.length > 0 ? (
            events.map((event, index) => <p key={index}>{event.title}</p>)
          ) : (
            <p>Nothing scheduled on this date</p>
          )}
        </div>
      </div>
      <div className="calendar-bottom">
        <h1 className="calendar-time">{formattedTime}</h1>
      </div>
    </div>
  );
};

export default CalendarOverview;
