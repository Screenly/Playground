import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {
  type CalendarEvent,
  type EventLayout,
  findEventClusters,
  calculateClusterLayouts,
  getEventKey,
} from '../event-layout.js'
import { COMPONENT_CSS } from './daily-calendar-view-styles.js'
import {
  generateTimeSlots,
  getWindowStartHour,
  filterEventsForWindow,
} from '../weekly-calendar-view/weekly-calendar-view-utils.js'
import { buildTimeGutter, buildEventElement } from '../calendar-view-utils.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export type { CalendarEvent }

export class DailyCalendarView extends HTMLElement {
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

  private _getEventLayouts(
    todayEvents: CalendarEvent[],
  ): Map<string, EventLayout> {
    const timezone = this._timezone
    const layoutMap = new Map<string, EventLayout>()

    if (todayEvents.length === 0) return layoutMap

    const clusters = findEventClusters(todayEvents, timezone)
    for (const cluster of clusters) {
      const clusterLayouts = calculateClusterLayouts(cluster, timezone)
      for (const [event, layout] of clusterLayouts) {
        layoutMap.set(getEventKey(event), layout)
      }
    }

    return layoutMap
  }

  private _buildDayBody(
    todayEvents: CalendarEvent[],
    windowStartHour: number,
    timeIndicatorPct: number,
    eventLayouts: Map<string, EventLayout>,
  ): HTMLElement {
    const timezone = this._timezone
    const locale = this._locale

    const dayBody = document.createElement('div')
    dayBody.className = 'day-body'
    for (let rowIdx = 0; rowIdx < 12; rowIdx++) {
      const hourRow = document.createElement('div')
      hourRow.className = 'hour-row'
      dayBody.appendChild(hourRow)
    }

    const eventsArea = document.createElement('div')
    eventsArea.className = 'events-area'

    for (const event of todayEvents) {
      const layout = eventLayouts.get(getEventKey(event)) ?? {
        event,
        column: 0,
        columnSpan: 1,
        totalColumns: 1,
      }
      eventsArea.appendChild(
        buildEventElement(event, windowStartHour, layout, locale, timezone),
      )
    }

    dayBody.appendChild(eventsArea)

    if (timeIndicatorPct >= 0 && timeIndicatorPct <= 100) {
      const indicator = document.createElement('div')
      indicator.className = 'current-time-indicator'
      indicator.style.setProperty('top', `${timeIndicatorPct}%`)
      dayBody.appendChild(indicator)
    }

    return dayBody
  }

  private _render() {
    const shadow = this.shadowRoot!
    const timezone = this._timezone
    const locale = this._locale
    const now = this._now

    const nowInTz = dayjs(now).tz(timezone)
    const currentHour = nowInTz.hour()
    const currentMinute = nowInTz.minute()
    const windowStartHour = getWindowStartHour(currentHour)
    const timeSlots = generateTimeSlots(windowStartHour, now, locale, timezone)
    const todayStr = nowInTz.format('YYYY-MM-DD')
    const todayEvents = filterEventsForWindow(
      this._events,
      todayStr,
      windowStartHour,
      timezone,
    )
    const eventLayouts = this._getEventLayouts(todayEvents)
    const currentSlotIndex = timeSlots.findIndex(
      (slot) => slot.hour === currentHour,
    )
    const timeIndicatorPct =
      currentSlotIndex >= 0
        ? ((currentSlotIndex + currentMinute / 60) / 12) * 100
        : -1

    shadow.innerHTML = `<style>${COMPONENT_CSS}</style>`

    const container = document.createElement('div')
    container.className = 'daily-calendar-container'

    const title = document.createElement('p')
    title.className = 'today-title'
    title.textContent = 'Today'
    container.appendChild(title)

    const dayGrid = document.createElement('div')
    dayGrid.className = 'day-grid'
    dayGrid.appendChild(buildTimeGutter(timeSlots))
    dayGrid.appendChild(
      this._buildDayBody(
        todayEvents,
        windowStartHour,
        timeIndicatorPct,
        eventLayouts,
      ),
    )

    container.appendChild(dayGrid)
    shadow.appendChild(container)
  }
}

if (
  typeof window !== 'undefined' &&
  !customElements.get('daily-calendar-view')
) {
  customElements.define('daily-calendar-view', DailyCalendarView)
}
