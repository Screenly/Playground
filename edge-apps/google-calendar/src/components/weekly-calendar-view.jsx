import React, { useEffect, useState } from 'react';
import { getFormattedTime, getLocale } from '../utils';
import './weekly-calendar-view.css';
import { fetchCalendarEvents } from '../events';

const WeeklyCalendarView = ({ now, events }) => {
  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [timeSlots, setTimeSlots] = useState([]);
  const WINDOW_HOURS = 12;

  useEffect(() => {
    const generateTimeSlots = async () => {
      const locale = await getLocale();
      const currentHour = now.getHours();

      // Calculate start hour to ensure we always show 12 hours
      const hoursUntilMidnight = 24 - currentHour;
      const startHour = currentHour - (WINDOW_HOURS - hoursUntilMidnight);

      return Promise.all(Array.from({ length: WINDOW_HOURS }, async (_, index) => {
        const hour = (startHour + index + 24) % 24; // Add 24 before modulo to handle negative hours
        const slotTime = new Date(now);
        slotTime.setHours(hour, 0, 0, 0);

        const formattedTime = await getFormattedTime(slotTime);

        return {
          time: formattedTime,
          hour: hour
        };
      }));
    };

    generateTimeSlots().then(setTimeSlots);
  }, [now]);

  // Get the start of the week (Sunday)
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  };

  const getEventsForTimeSlot = (hour, dayOffset) => {
    const targetDate = new Date(getStartOfWeek(now));
    targetDate.setDate(targetDate.getDate() + dayOffset);
    targetDate.setHours(hour, 0, 0, 0);

    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const eventDayOfWeek = eventStart.getDay();
      const eventHour = eventStart.getHours();

      // Get the current hour and calculate start hour
      const currentHour = now.getHours();
      const hoursUntilMidnight = 24 - currentHour;
      const startHour = currentHour - (WINDOW_HOURS - hoursUntilMidnight);

      // Check if event starts within our 12-hour window
      const isInWindow = eventHour >= startHour && eventHour < (startHour + WINDOW_HOURS);

      return eventDayOfWeek === dayOffset &&
             eventHour === hour &&
             isInWindow;
    });
  };

  // Add function to get the date for each column header
  const getHeaderDate = (dayIndex) => {
    const date = new Date(getStartOfWeek(now));
    date.setDate(date.getDate() + dayIndex);
    return date.getDate();
  };

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
    <div className="primary-card weekly-view">
      <div className="weekly-calendar">
        <div className="week-header">
          <div className="time-label-spacer"></div>
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={index} className="day-header">
              <div>{day}</div>
              <div className="date-number">{getHeaderDate(index)}</div>
            </div>
          ))}
        </div>
        <div className="week-body">
          {timeSlots.map((slot, index) => (
            <div key={index} className="week-row">
              <div className="time-label">{slot.time}</div>
              {DAYS_OF_WEEK.map((_, dayIndex) => (
                <div key={dayIndex} className="day-column">
                  <div className="hour-line"></div>
                  {getEventsForTimeSlot(slot.hour, dayIndex).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="calendar-event-item"
                      style={getEventStyle(event)}
                    >
                      <div className="event-title">{event.title}</div>
                      <TimeDisplay event={event} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
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

  return <span className="event-time">{timeString}</span>;
};

export default WeeklyCalendarView;
