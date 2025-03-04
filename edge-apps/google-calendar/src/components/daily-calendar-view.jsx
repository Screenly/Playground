import React from 'react';
import { getFormattedTime } from '../utils';

const DailyCalendarView = ({ now, events }) => {
  const TOTAL_HOURS = 12; // Total number of time slots to display
  const HOURS_BEFORE = 1; // Hours to show before current time

  const generateTimeSlots = (currentDate) => {
    const currentHour = currentDate.getHours();
    const startHour = currentHour - HOURS_BEFORE;

    return Array.from({ length: TOTAL_HOURS }, (_, index) => {
      const hour = (startHour + index + 24) % 24; // Ensure hour is between 0-23
      const displayHour = hour % 12 || 12; // Convert to 12-hour format
      const ampm = hour < 12 ? 'AM' : 'PM';

      return {
        time: `${displayHour}:00 ${ampm}`,
        hour: hour
      };
    });
  };

  const timeSlots = generateTimeSlots(now);

  // Helper function to check if an event belongs in a time slot
  const getEventsForTimeSlot = (hour) => {
    return events.filter(event => {
      const startHour = new Date(event.startTime).getHours();
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
                    {getFormattedTime(new Date(event.startTime))} - {getFormattedTime(new Date(event.endTime))}
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
