import React from 'react';
import { getCurrentFormattedTime } from '../utils';

const DailyCalendarView = () => {
  const mockEvents = [
    {
      title: "Morning Meeting",
      startTime: "2024-03-20T01:30:00",
      endTime: "2024-03-20T02:30:00"
    },
    {
      title: "Team Standup",
      startTime: "2024-03-20T04:00:00",
      endTime: "2024-03-20T04:15:00"
    },
    {
      title: "Team Meeting",
      startTime: "2024-03-20T06:00:00",
      endTime: "2024-03-20T10:00:00"
    },
  ];

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return {
      time: `${hour}:00 ${ampm}`,
      hour: i
    };
  });

  // Helper function to check if an event belongs in a time slot
  const getEventsForTimeSlot = (hour) => {
    return mockEvents.filter(event => {
      const startHour = new Date(event.startTime).getHours();
      // Only show events in their starting hour slot
      return startHour === hour;
    });
  };

  // Helper function to calculate event position and height
  const getEventStyle = (event) => {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinutes = endTime.getMinutes();

    // Calculate position from top (percentage within the slot)
    // Add 50% offset to align with hour lines
    const topOffset = startMinutes === 0 ? 50 : (startMinutes / 60) * 100 + 50;

    // Calculate duration in hours and minutes
    const durationHours = endHour - startHour;
    const durationMinutes = endMinutes - startMinutes;
    const totalDuration = durationHours + (durationMinutes / 60);

    // Calculate height based on duration
    const height = totalDuration * 100;

    return {
      top: `${topOffset}%`,
      height: `${height}%`
    };
  };

  return (
    <div className="primary-card">
      <div className="daily-calendar">
        {timeSlots.map((slot, index) => (
          <div key={index} className="time-slot">
            <div className="time-label">{slot.time}</div>
            <div className="time-content">
              <div className="hour-line"></div>
              {getEventsForTimeSlot(slot.hour).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className="calendar-event-item"
                  style={getEventStyle(event)}
                >
                  <div style={{
                    marginBottom: '0.5rem'
                  }}>
                    {event.title}
                  </div>

                  <div>
                    {new Date(event.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})} - {new Date(event.endTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyCalendarView;
