import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import './css/common.css';
import './css/style.css';

// Utility functions
const getCurrentFormattedTime = () => {
  return new Date().toLocaleTimeString(
    'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
  );
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const generateCalendarDays = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const days = [];

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false
    });
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true
    });
  }

  // Calculate remaining days needed to complete the last row
  const totalDaysSoFar = days.length;
  const remainingDaysInLastRow = 7 - (totalDaysSoFar % 7);
  const needsExtraRow = remainingDaysInLastRow < 7;

  // Add next month's days only for the last row if needed
  for (let i = 1; i <= (needsExtraRow ? remainingDaysInLastRow : 0); i++) {
    days.push({
      day: i,
      isCurrentMonth: false
    });
  }

  return days;
};

// Components
const CalendarGrid = ({ currentMonthName, currentYear, weekDays, calendarDays, currentDate }) => {
  return (
    <div className="primary-card">
      <div className="calendar">
        <div className="calendar-header">{currentMonthName} {currentYear}</div>
        <div className="calendar-weekdays">
          {weekDays.map((day, index) => (
            <div key={index}>{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`calendar-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${
                day.day === currentDate && day.isCurrentMonth ? 'current-day' : ''
              }`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
            events.map((event, index) => <p key={index}>{event}</p>)
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

const InfoCard = () => {
  return (
    <div className="secondary-card info-card">
      <img id="brand-logo" src="img/screenly.svg" className="brand-logo" alt="Brand Logo" />
      <span className="info-text">Powered by Screenly</span>
    </div>
  );
};

// Calendar Events API
const fetchCalendarEvents = async () => {
  try {
    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0);

    const timeMax = new Date(timeMin);
    timeMax.setHours(23, 59, 59, 999);

    const { google_calendar_api_key: googleCalendarApiKey } = window.screenly.settings;

    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${googleCalendarApiKey}`,
          Accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    return data.items.map(event => event.summary);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

// Main App Component
const App = () => {
  const now = new Date();
  const [currentYear] = useState(now.getFullYear());
  const [currentMonth] = useState(now.getMonth());
  const [currentDate] = useState(now.getDate());
  const [currentMonthName] = useState(now.toLocaleString('default', { month: 'long' }));
  const [currentTime, setCurrentTime] = useState(getCurrentFormattedTime());
  const [calendarDays] = useState(generateCalendarDays(currentYear, currentMonth));
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(getCurrentFormattedTime());
    }, 60 * 1000);

    // Update events every second
    const eventsInterval = setInterval(async () => {
      const fetchedEvents = await fetchCalendarEvents();
      setEvents(fetchedEvents);
    }, 1000);

    // Initial events fetch
    fetchCalendarEvents().then(setEvents);

    // Signal ready for rendering
    try {
      window.screenly.signalReadyForRendering();
    } catch (error) {
      console.error('Error signaling ready for rendering:', error);
    }

    // Cleanup intervals
    return () => {
      clearInterval(timeInterval);
      clearInterval(eventsInterval);
    };
  }, []);

  return (
    <div className="main-container">
      <div className="secondary-container">
        <div className="row-container">
          <CalendarOverview
            currentDate={currentDate}
            currentMonthName={currentMonthName}
            currentTime={currentTime}
            events={events}
          />
        </div>
        <div className="row-container">
          <InfoCard />
        </div>
      </div>
      <CalendarGrid
        currentMonthName={currentMonthName}
        currentYear={currentYear}
        weekDays={weekDays}
        calendarDays={calendarDays}
        currentDate={currentDate}
      />
    </div>
  );
};

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
