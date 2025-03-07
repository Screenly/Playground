import ICAL from 'ical.js';

export const fetchCalendarEvents = async () => {
  try {
    const { ical_url: icalUrl } = window.screenly.settings;
    const corsProxy = screenly.cors_proxy_url;
    const bypassCors = Boolean(JSON.parse(screenly.settings.bypass_cors));
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
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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
          isAllDay: event.startDate.isDate // true for all-day events
        };
      })
      .filter(event => {
        const eventStart = new Date(event.startTime);
        return eventStart >= today && eventStart < tomorrow;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5);

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};
