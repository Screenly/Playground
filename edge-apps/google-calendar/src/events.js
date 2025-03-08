import ICAL from 'ical.js';

export const fetchCalendarEvents = async () => {
  try {
    const { ical_url: icalUrl } = window.screenly.settings;
    const corsProxy = screenly.cors_proxy_url;
    const bypassCors = Boolean(JSON.parse(screenly.settings.bypass_cors));
    const viewMode = screenly.settings.calendar_mode;
    const icalUrlWithProxy = bypassCors ? `${corsProxy}/${icalUrl}` : icalUrl;

    const response = await fetch(icalUrlWithProxy);

    if (!response.ok) {
      throw new Error('Failed to fetch iCal feed');
    }

    const icalData = await response.text();
    const jcalData = ICAL.parse(icalData);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents('vevent');

    const today = new Date();
    let startDate, endDate;

    if (viewMode === 'daily') {
      // For daily view, start from current hour today
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);
    } else {
      // For weekly view, show full week
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    }

    const events = vevents
      .map(vevent => {
        const event = new ICAL.Event(vevent);
        const startDate = event.startDate.toJSDate();
        const endDate = event.endDate.toJSDate();

        return {
          title: event.summary,
          description: event.description,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          location: event.location,
          isAllDay: event.startDate.isDate
        };
      })
      .filter(event => {
        const eventStart = new Date(event.startTime);
        if (viewMode === 'daily') {
          // For daily view, only show events after current hour
          return eventStart >= startDate && eventStart < endDate;
        } else {
          // For weekly view, show all events in the week
          return eventStart >= startDate && eventStart < endDate;
        }
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Only limit number of events for daily view
    return viewMode === 'daily' ? events.slice(0, 5) : events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};
