import React, { useEffect, useState } from 'react';
import { getFormattedTime, getLocale, getTimeZone } from '../utils';
import './weekly-calendar-view.css';
import { fetchCalendarEvents } from '../events';

const WeeklyCalendarView = ({ now, events }) => {
  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [timeSlots, setTimeSlots] = useState([]);
  const WINDOW_HOURS = 12;

  useEffect(() => {
    const generateTimeSlots = async () => {
      const locale = await getLocale();
      const timezone = getTimeZone();

      // Get timezone adjusted hour
      const currentHour = new Date(now).toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone
      });

      const startHour = parseInt(currentHour) - 1; // Start 1 hour before current hour

      return Promise.all(Array.from({ length: WINDOW_HOURS }, async (_, index) => {
        const hour = (startHour + index) % 24;

        // Skip slots at or after midnight
        if (hour === 0 || (startHour + index) >= 24) {
          return null;
        }

        const slotTime = new Date(now);
        slotTime.setHours(hour, 0, 0, 0);

        const formattedTime = slotTime.toLocaleTimeString(locale, {
          hour: 'numeric',
          minute: '2-digit'
        });

        return {
          time: formattedTime,
          hour: hour
        };
      })).then(slots => slots.filter(Boolean)); // Remove null entries
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
    const timezone = getTimeZone();
    const targetDate = new Date(getStartOfWeek(now));
    targetDate.setDate(targetDate.getDate() + dayOffset);
    targetDate.setHours(hour, 0, 0, 0);

    // Get timezone adjusted current hour
    const currentHour = parseInt(new Date(now).toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone
    }));

    // Start 2 hours before current hour
    const startHour = (currentHour - 2 + 24) % 24;

    return events.filter(event => {
      // Get timezone adjusted event hour
      const eventStart = new Date(event.startTime);
      const eventHour = parseInt(eventStart.toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone
      }));

      const eventDayOfWeek = new Date(event.startTime).toLocaleString('en-US', {
        weekday: 'long',
        timeZone: timezone
      });
      const dayOfWeekIndex = DAYS_OF_WEEK.findIndex(day =>
        day.toLowerCase().startsWith(eventDayOfWeek.toLowerCase().slice(0, 3))
      );

      // Check if event is within the same day and before midnight
      const isBeforeMidnight = hour < 24;

      // Check if event starts within our 12-hour window
      const isInWindow = eventHour >= startHour && eventHour < (startHour + WINDOW_HOURS);

      return dayOfWeekIndex === dayOffset &&
             eventHour === hour &&
             isInWindow &&
             isBeforeMidnight;
    });
  };

  // Add function to get the date for each column header
  const getHeaderDate = (dayIndex) => {
    const date = new Date(getStartOfWeek(now));
    date.setDate(date.getDate() + dayIndex);
    return date.getDate();
  };

  // Add function to check if a date is today
  const isToday = (dayIndex) => {
    const date = new Date(getStartOfWeek(now));
    date.setDate(date.getDate() + dayIndex);
    const today = new Date(now);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
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

  // Update function to get formatted month and year with uppercase month
  const getMonthYearDisplay = () => {
    const date = new Date(now);
    const monthYear = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    // Split by space, uppercase the month, keep year as is, then join
    const [month, year] = monthYear.split(' ');
    return `${month.toUpperCase()} ${year}`;
  };

  return (
    <div className="primary-card weekly-view">
      <div className="weekly-calendar">
        <div className="month-year-header">
          {getMonthYearDisplay()}
        </div>
        <div className="week-header">
          <div className="time-label-spacer"></div>
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={index} className="day-header">
              <span>{day} </span>
              <span className={isToday(index) ? 'current-date' : ''}>
                {getHeaderDate(index)}
              </span>
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
      const locale = await getLocale();
      const timezone = getTimeZone();

      // Format start and end times with timezone adjustment
      const start = new Date(event.startTime).toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone
      });

      const end = new Date(event.endTime).toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone
      });

      setTimeString(`${start} - ${end}`);
    };
    updateTime();
  }, [event]);

  return <span className="event-time">{timeString}</span>;
};

export default WeeklyCalendarView;
