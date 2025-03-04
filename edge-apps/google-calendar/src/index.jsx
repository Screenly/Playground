import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import {
  getCurrentFormattedTime,
  generateCalendarDays,
  initializeThemeColors
} from '@/utils';
import MonthlyCalendarView from '@/components/monthly-calendar-view';
import CalendarOverview from '@/components/calendar-overview';
import InfoCard from '@/components/info-card';
import { fetchCalendarEvents } from '@/events';
import '@/css/common.css';
import '@/css/style.css';
import DailyCalendarView from '@/components/daily-calendar-view';

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
  const [calendarMode] = useState(window.screenly.settings.calendar_mode || 'monthly');

  useEffect(() => {
    // Initialize theme colors
    initializeThemeColors();

    // Update time every 30 seconds
    const timeInterval = setInterval(() => {
      setCurrentTime(getCurrentFormattedTime());
    }, 30 * 1000);

    // Update events every minute
    const eventsInterval = setInterval(async () => {
      const fetchedEvents = await fetchCalendarEvents();
      setEvents(fetchedEvents);
    }, 60 * 1000);

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
      {calendarMode === 'monthly' && (
        <MonthlyCalendarView
          currentMonthName={currentMonthName}
          currentYear={currentYear}
          weekDays={weekDays}
          calendarDays={calendarDays}
          currentDate={currentDate}
        />
      )}
      {calendarMode === 'daily' && (
        <DailyCalendarView />
      )}
    </div>
  );
};

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
