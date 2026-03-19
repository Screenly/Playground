import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { CalendarEvent } from '../event-layout.js'
import { COMPONENT_CSS } from './schedule-calendar-view-styles.js'
import { formatEventTime } from '../weekly-calendar-view/weekly-calendar-view-utils.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export type { CalendarEvent }

const MAX_EVENTS_TOTAL = 12

export class ScheduleCalendarView extends HTMLElement {
  private _events: CalendarEvent[] = []
  private _now: Date = new Date()
  private _timezone: string = 'UTC'
  private _locale: string = 'en'
  private _initialized: boolean = false

  static get observedAttributes() {
    return ['timezone', 'locale']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this._initialized = true
    this._render()
  }

  attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
    if (name === 'timezone') this._timezone = newVal || 'UTC'
    if (name === 'locale') this._locale = newVal || 'en'
    if (this._initialized) this._render()
  }

  get events(): CalendarEvent[] {
    return this._events
  }

  set events(value: CalendarEvent[]) {
    this._events = value || []
    if (this._initialized) this._render()
  }

  get now(): Date {
    return this._now
  }

  set now(value: Date) {
    this._now = value
    if (this._initialized) this._render()
  }

  private _getVisibleEvents(): {
    todayEvents: CalendarEvent[]
    tomorrowEvents: CalendarEvent[]
  } {
    const tz = this._timezone
    const nowInTz = dayjs(this._now).tz(tz)
    const startOfToday = nowInTz.startOf('day')
    const startOfTomorrow = startOfToday.add(1, 'day')
    const startOfDayAfter = startOfTomorrow.add(1, 'day')

    const sortByStart = (a: CalendarEvent, b: CalendarEvent) =>
      dayjs(a.startTime).tz(tz).valueOf() - dayjs(b.startTime).tz(tz).valueOf()

    const todayAll = this._events
      .filter((e) => {
        if (e.isAllDay) return false
        const start = dayjs(e.startTime).tz(tz)
        return start.isAfter(nowInTz) && start.isBefore(startOfTomorrow)
      })
      .sort(sortByStart)

    const tomorrowAll = this._events
      .filter((e) => {
        if (e.isAllDay) return false
        const start = dayjs(e.startTime).tz(tz)
        return (
          !start.isBefore(startOfTomorrow) && start.isBefore(startOfDayAfter)
        )
      })
      .sort(sortByStart)

    let todayEvents: CalendarEvent[]
    let tomorrowEvents: CalendarEvent[]

    if (todayAll.length >= MAX_EVENTS_TOTAL) {
      todayEvents = todayAll.slice(0, MAX_EVENTS_TOTAL)
      tomorrowEvents = []
    } else {
      todayEvents = todayAll
      tomorrowEvents = tomorrowAll.slice(0, MAX_EVENTS_TOTAL - todayAll.length)
    }

    return { todayEvents, tomorrowEvents }
  }

  private _buildEventItem(event: CalendarEvent): HTMLElement {
    const tz = this._timezone
    const locale = this._locale

    const item = document.createElement('div')
    item.className = 'event-item'
    if (event.backgroundColor) {
      item.style.setProperty('background-color', event.backgroundColor)
    }

    const titleEl = document.createElement('div')
    titleEl.className = 'event-title'
    titleEl.textContent = event.title

    const timeEl = document.createElement('div')
    timeEl.className = 'event-time'
    timeEl.textContent = formatEventTime(
      event.startTime,
      event.endTime,
      locale,
      tz,
    )

    item.appendChild(titleEl)
    item.appendChild(timeEl)
    return item
  }

  private _buildDaySection(
    heading: string,
    events: CalendarEvent[],
    showNoEvents: boolean,
  ): HTMLElement {
    const section = document.createElement('div')
    section.className = 'day-section'

    const headingEl = document.createElement('h2')
    headingEl.className = 'day-heading'
    headingEl.textContent = heading
    section.appendChild(headingEl)

    const list = document.createElement('div')
    list.className = 'events-list'

    if (events.length === 0 && showNoEvents) {
      const empty = document.createElement('div')
      empty.className = 'no-events'
      empty.textContent = 'No upcoming events'
      list.appendChild(empty)
    } else {
      for (const event of events) {
        list.appendChild(this._buildEventItem(event))
      }
    }

    section.appendChild(list)
    return section
  }

  private _getDayLabel(offsetDays: number): string {
    const tz = this._timezone
    const locale = this._locale
    const date = dayjs(this._now).tz(tz).add(offsetDays, 'day')
    const weekday = date.toDate().toLocaleDateString(locale, {
      weekday: 'long',
      timeZone: tz,
    })
    const dayNum = date.date()
    const month = date.toDate().toLocaleDateString(locale, {
      month: 'short',
      timeZone: tz,
    })
    return `${weekday}, ${month} ${dayNum}`
  }

  private _render() {
    const shadow = this.shadowRoot!

    const { todayEvents, tomorrowEvents } = this._getVisibleEvents()

    shadow.innerHTML = `<style>${COMPONENT_CSS}</style>`

    const container = document.createElement('div')
    container.className = 'schedule-container'

    const title = document.createElement('p')
    title.className = 'schedule-title'
    title.textContent = 'Schedule'
    container.appendChild(title)

    const body = document.createElement('div')
    body.className = 'schedule-body'

    body.appendChild(
      this._buildDaySection(this._getDayLabel(0), todayEvents, true),
    )

    if (tomorrowEvents.length > 0) {
      body.appendChild(
        this._buildDaySection(this._getDayLabel(1), tomorrowEvents, false),
      )
    }

    container.appendChild(body)
    shadow.appendChild(container)
  }
}

if (
  typeof window !== 'undefined' &&
  !customElements.get('schedule-calendar-view')
) {
  customElements.define('schedule-calendar-view', ScheduleCalendarView)
}
