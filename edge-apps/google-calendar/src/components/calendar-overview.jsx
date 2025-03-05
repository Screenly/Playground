import React, { useEffect, useState } from 'react';

const CalendarOverview = ({ currentDate, currentMonthName, currentYear, currentTime, events }) => {
  const [formattedTime, setFormattedTime] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const updateTime = async () => {
      const time = await currentTime;
      setFormattedTime(time);
    };
    updateTime();
  }, [currentTime]);

  useEffect(() => {
    // Filter events for next 24 hours
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(now.getHours() + 24);

    const upcomingEvents = events.filter(event => {
      const eventStart = new Date(event.startTime);
      return eventStart >= now && eventStart < tomorrow;
    });

    setFilteredEvents(upcomingEvents);
  }, [events]);

  return (
    <div className="secondary-card calendar-overview-card">
      <div className="calendar-top">
        <div className="calendar-date">
          <span className="date-number-circle">{currentDate}</span>
          <span className="month-name">{currentMonthName} {currentYear}</span>
        </div>
        <div className="calendar-event">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => <p key={index}>{event.title}</p>)
          ) : (
            <p>Nothing scheduled in next 24 hours</p>
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
