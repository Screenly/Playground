import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import {
  getCurrentFormattedTime,
  generateCalendarDays
} from './utils';
import CalendarGrid from './components/calendar-grid';
import CalendarOverview from './components/calendar-overview';
import InfoCard from './components/info-card';
import { fetchCalendarEvents } from './events';
import './css/common.css';
import './css/style.css';

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
