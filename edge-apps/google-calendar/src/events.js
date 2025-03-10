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

    // Create date objects once
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    if (viewMode === 'daily') {
      // For daily view, start from current hour today
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);
    } else {
      // For weekly view, show full week
      const currentDay = startDate.getDay();
      startDate.setDate(startDate.getDate() - currentDay);
      startDate.setHours(0, 0, 0, 0);

      endDate.setTime(startDate.getTime());
      endDate.setDate(startDate.getDate() + 7);
    }

    // Pre-calculate the timestamp for faster comparisons
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    // Process events in chunks to prevent blocking
    const chunkSize = 50;
    const events = [];

    for (let i = 0; i < vevents.length; i += chunkSize) {
      const chunk = vevents.slice(i, i + chunkSize);

      chunk.forEach((vevent) => {
        const event = new ICAL.Event(vevent);
        const eventStart = event.startDate.toJSDate();
        const eventTimestamp = eventStart.getTime();

        // Quick timestamp comparison before proceeding
        if (eventTimestamp >= endTimestamp || eventTimestamp < startTimestamp) {
          return;
        }

        const eventEnd = event.endDate.toJSDate();

        events.push({
          title: event.summary,
          startTime: eventStart.toISOString(),
          endTime: eventEnd.toISOString(),
          isAllDay: event.startDate.isDate,
        });
      });

      // Allow other operations to process
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // Sort events once
    events.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Only limit events for daily view
    return viewMode === 'daily' ? events.slice(0, 5) : events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};
