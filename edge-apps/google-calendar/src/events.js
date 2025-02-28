import ICAL from 'ical.js';

export const fetchCalendarEvents = async () => {
  try {
    const { ical_url: icalUrl } = window.screenly.settings;
    const corsProxy = screenly.cors_proxy_url;
    const icalUrlWithProxy = `${corsProxy}/${icalUrl}`;

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

        return {
          summary: event.summary,
          startDate: startDate
        };
      })
      .filter(event => {
        return event.startDate >= today && event.startDate < tomorrow;
      })
      .sort((a, b) => a.startDate - b.startDate)
      .slice(0, 5)
      .map(event => event.summary);

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};
