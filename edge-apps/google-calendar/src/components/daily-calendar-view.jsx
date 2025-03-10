import React, { useEffect, useState } from 'react';
import { getFormattedTime, getLocale } from '../utils';
import { fetchCalendarEvents } from '../events';

const DailyCalendarView = ({ now, events }) => {
  const TOTAL_HOURS = 12; // Total number of time slots to display
  const HOURS_BEFORE = 1; // Hours to show before current time
  const [formattedStartTime, setFormattedStartTime] = useState('');
  const [formattedEndTime, setFormattedEndTime] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const generateTimeSlots = async (currentDate) => {
      const currentHour = currentDate.getHours();
      const startHour = currentHour - HOURS_BEFORE;
      const locale = await getLocale();

      return Promise.all(
        Array.from({ length: TOTAL_HOURS }, async (_, index) => {
          const hour = (startHour + index + 24) % 24; // Ensure hour is between 0-23
          const slotTime = new Date(currentDate);
          slotTime.setHours(hour, 0, 0, 0);

          const formattedTime = await getFormattedTime(slotTime);

          return {
            time: formattedTime,
            hour: hour,
          };
        }),
      );
    };

    generateTimeSlots(now).then(setTimeSlots);
  }, [now]);

  // Helper function to check if an event belongs in a time slot
  const getEventsForTimeSlot = (hour) => {
    return events.filter((event) => {
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
    const totalDuration = durationHours + durationMinutes / 60;

    // Calculate height based on duration
    const height = totalDuration * 100;

    return {
      top: `${topOffset}%`,
      height: `${height}%`,
    };
  };

  const formatEventTimes = async (event) => {
    const start = await getFormattedTime(new Date(event.startTime));
    const end = await getFormattedTime(new Date(event.endTime));
    return `${start} - ${end}`;
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
                  <div
                    style={{
                      marginBottom: '0.5rem',
                    }}
                  >
                    {event.title}
                  </div>

                  <div>
                    <TimeDisplay event={event} />
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

// Helper component to handle async time formatting
const TimeDisplay = ({ event }) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = async () => {
      const start = await getFormattedTime(new Date(event.startTime));
      const end = await getFormattedTime(new Date(event.endTime));
      setTimeString(`${start} - ${end}`);
    };
    updateTime();
  }, [event]);

  return <>{timeString}</>;
};

export default DailyCalendarView;
