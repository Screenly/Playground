// Constants
const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// State
let currentToken = '';
let events = [];
let currentDate = new Date();
let currentView = 'monthly'; // monthly, weekly, daily

// DOM Elements
const calendarHeaderElement = document.querySelector('.calendar-header');
const calendarWeekdaysElement = document.querySelector('.calendar-weekdays');
const calendarGridElement = document.querySelector('.calendar-grid');
const dateNumberCircleElement = document.querySelector('.date-number-circle');
const monthNameElement = document.querySelector('.month-name');
const calendarEventElement = document.querySelector('.calendar-event');
const calendarTimeElement = document.querySelector('.calendar-time');

// Utility Functions
function getFormattedTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function getFormattedMonthName(date) {
    return date.toLocaleString('default', { month: 'long' });
}

function getYear(date) {
    return date.getFullYear();
}

function getMonth(date) {
    return date.getMonth();
}

function getDate(date) {
    return date.getDate();
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
}

function getEndOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() + (6 - day));
    return d;
}

function generateCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({ day: i, isCurrentMonth: true });
    }

    return days;
}

function generateWeekDays(date) {
    const startOfWeek = getStartOfWeek(date);
    const days = [];

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        days.push({
            day: getDate(currentDay),
            isCurrentMonth: getMonth(currentDay) === getMonth(date),
            date: currentDay
        });
    }

    return days;
}

function generateDayHours() {
    return HOURS.map(hour => ({
        hour,
        events: filterEventsForHour(hour)
    }));
}

function filterEventsForHour(hour) {
    return events.filter(event => {
        const eventStart = new Date(event.startTime);
        return eventStart.getHours() === hour;
    });
}

// API Functions
async function getAccessToken(refreshToken, clientId, clientSecret) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });

    const data = await response.json();
    return data.access_token;
}

async function fetchCalendarEvents(token) {
    const calendarId = window.screenly.settings.calendar_id || 'primary';
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 7);

    const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
        `timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&` +
        `singleEvents=true&orderBy=startTime`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();
    return data.items.map(event => ({
        title: event.summary,
        startTime: event.start.dateTime || event.start.date,
        endTime: event.end.dateTime || event.end.date,
        description: event.description || '',
        location: event.location || ''
    }));
}

// UI Update Functions
function updateDateTime() {
    const now = new Date();
    currentDate = now;

    // Update date number circle
    dateNumberCircleElement.textContent = getDate(now);

    // Update month and year
    monthNameElement.textContent = `${getFormattedMonthName(now)} ${getYear(now)}`;

    // Update time
    calendarTimeElement.textContent = getFormattedTime(now);
}

function updateCalendarView() {
    const year = getYear(currentDate);
    const month = getMonth(currentDate);

    // Update calendar header
    calendarHeaderElement.textContent = `${getFormattedMonthName(currentDate)} ${year}`;

    // Update weekdays
    calendarWeekdaysElement.innerHTML = WEEKDAYS
        .map(day => `<div>${day}</div>`)
        .join('');

    // Update calendar grid based on view
    switch (currentView) {
        case 'monthly':
            updateMonthlyView(year, month);
            break;
        case 'weekly':
            updateWeeklyView();
            break;
        case 'daily':
            updateDailyView();
            break;
    }
}

function updateMonthlyView(year, month) {
    const days = generateCalendarDays(year, month);

    calendarGridElement.innerHTML = days
        .map((dayObj, index) => {
            if (dayObj.day === null) {
                return '<div class="calendar-cell other-month"></div>';
            }
            const isToday = dayObj.day === getDate(new Date()) &&
                           month === getMonth(new Date()) &&
                           year === getYear(new Date());
            return `<div class="calendar-cell ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'current-day' : ''}">${dayObj.day}</div>`;
        })
        .join('');
}

function updateWeeklyView() {
    const days = generateWeekDays(currentDate);

    calendarGridElement.innerHTML = days
        .map(dayObj => {
            const isToday = dayObj.day === getDate(new Date()) &&
                           dayObj.isCurrentMonth === (getMonth(new Date()) === getMonth(currentDate));
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.startTime);
                return eventDate.getDate() === dayObj.day &&
                       eventDate.getMonth() === dayObj.date.getMonth() &&
                       eventDate.getFullYear() === dayObj.date.getFullYear();
            });

            return `
                <div class="calendar-cell ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'current-day' : ''}">
                    <div class="day-number">${dayObj.day}</div>
                    ${dayEvents.map(event => `
                        <div class="event-item">
                            <div class="event-time">${getFormattedTime(new Date(event.startTime))}</div>
                            <div class="event-title">${event.title}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        })
        .join('');
}

function updateDailyView() {
    const hours = generateDayHours();

    calendarGridElement.innerHTML = hours
        .map(({ hour, events }) => `
            <div class="time-slot">
                <div class="time-label">${hour}:00</div>
                <div class="time-content">
                    ${events.map(event => `
                        <div class="calendar-event-item">
                            <div>${event.title}</div>
                            <div>${getFormattedTime(new Date(event.startTime))} - ${getFormattedTime(new Date(event.endTime))}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `)
        .join('');
}

function updateEventsList() {
    // Filter events for next 24 hours
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(now.getHours() + 24);

    const upcomingEvents = events.filter(event => {
        const eventStart = new Date(event.startTime);
        return eventStart >= now && eventStart < tomorrow;
    });

    if (upcomingEvents.length > 0) {
        calendarEventElement.innerHTML = upcomingEvents
            .map(event => `<p>${event.title}</p>`)
            .join('');
    } else {
        calendarEventElement.innerHTML = '<p>Nothing scheduled in next 24 hours</p>';
    }
}

// Theme Functions
function updateTheme() {
    const theme = window.screenly.settings.theme || 'light';
    document.body.setAttribute('data-theme', theme);
}

// Token Refresh Function
async function refreshAccessToken() {
    try {
        const {
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret
        } = window.screenly.settings;

        if (refreshToken && clientId && clientSecret) {
            currentToken = await getAccessToken(refreshToken, clientId, clientSecret);
            return currentToken;
        }
        return null;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return null;
    }
}

// Initialize App
async function initializeApp() {
    // Get calendar mode from settings
    currentView = window.screenly.settings.calendar_mode || 'monthly';

    // Set up theme
    updateTheme();

    // Set up intervals
    setInterval(updateDateTime, 1000);
    setInterval(refreshAccessToken, TOKEN_REFRESH_INTERVAL);

    // Initial token fetch
    const token = await refreshAccessToken();

    if (token) {
        // Set up events fetching
        setInterval(async () => {
            events = await fetchCalendarEvents(currentToken);
            updateEventsList();
            updateCalendarView();
        }, 5000);

        // Initial events fetch
        events = await fetchCalendarEvents(token);
        updateEventsList();
    }

    // Initial UI updates
    updateDateTime();
    updateCalendarView();

    // Signal ready for rendering
    try {
        window.screenly.signalReadyForRendering();
    } catch (error) {
        console.error('Error signaling ready for rendering:', error);
    }
}

// Start the app
initializeApp();
