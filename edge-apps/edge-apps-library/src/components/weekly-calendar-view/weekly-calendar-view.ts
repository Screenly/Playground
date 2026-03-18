import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {
  type CalendarEvent,
  type EventLayout,
  findEventClusters,
  calculateClusterLayouts,
  getEventKey,
} from './event-layout.js'
import { COMPONENT_CSS } from './weekly-calendar-view-styles.js'
import { getLocalizedDayNames } from '../../utils/index.js'
import {
  generateTimeSlots,
  getWindowStartHour,
  filterEventsForWindow,
  setAttribute,
} from './weekly-calendar-view-utils.js'
import { buildTimeGutter, buildEventElement } from '../calendar-view-utils.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export type { CalendarEvent }

export class WeeklyCalendarView extends HTMLElement {
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

  private _getWeekStart(): Date {
    const tz = this._timezone
    const nowInTz = dayjs(this._now).tz(tz)
    const weekStart = nowInTz.startOf('week')
    return weekStart.toDate()
  }

  private _getEventLayouts(): Map<string, EventLayout> {
    const tz = this._timezone
    const weekStartDate = dayjs(this._getWeekStart()).tz(tz)
    const layoutMap = new Map<string, EventLayout>()
    const eventsByDay = new Map<number, CalendarEvent[]>()

    const weekEvents = this._events.filter((event) => {
      const eventStart = dayjs(event.startTime).tz(tz)
      return (
        !eventStart.isBefore(weekStartDate) &&
        eventStart.isBefore(weekStartDate.add(7, 'day'))
      )
    })

    weekEvents.forEach((event) => {
      const eventStart = dayjs(event.startTime).tz(tz)
      const dayDiff = eventStart.diff(weekStartDate, 'day')
      const dayIndex = ((dayDiff % 7) + 7) % 7

      if (!eventsByDay.has(dayIndex)) {
        eventsByDay.set(dayIndex, [])
      }
      eventsByDay.get(dayIndex)!.push(event)
    })

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayEvents = eventsByDay.get(dayIndex) || []
      if (dayEvents.length === 0) continue

      const clusters = findEventClusters(dayEvents, tz)
      for (const cluster of clusters) {
        const clusterLayouts = calculateClusterLayouts(cluster, tz)
        for (const [event, layout] of clusterLayouts) {
          layoutMap.set(getEventKey(event), layout)
        }
      }
    }

    return layoutMap
  }

  private _buildDayColumn(
    dayIdx: number,
    weekStart: Date,
    windowStartHour: number,
    todayStr: string,
    timeIndicatorPct: number,
    eventLayouts: Map<string, EventLayout>,
  ): HTMLElement {
    const tz = this._timezone
    const locale = this._locale

    const dayDayjs = dayjs(weekStart).tz(tz).add(dayIdx, 'day')
    const dayDateStr = dayDayjs.format('YYYY-MM-DD')
    const isToday = dayDateStr === todayStr

    const dayCol = document.createElement('div')
    dayCol.className = 'day-column'
    setAttribute(dayCol, 'data-day-index', String(dayIdx))

    const dayHeader = document.createElement('div')
    dayHeader.className = isToday ? 'day-header today' : 'day-header'
    const dayName = document.createElement('span')
    dayName.className = 'day-name'
    dayName.textContent = getLocalizedDayNames(locale).short[dayIdx] || ''
    dayHeader.appendChild(dayName)
    const dayDateNum = document.createElement('span')
    dayDateNum.className = 'day-date'
    dayDateNum.textContent = String(dayDayjs.date())
    dayHeader.appendChild(dayDateNum)
    dayCol.appendChild(dayHeader)

    const dayBody = document.createElement('div')
    dayBody.className = 'day-body'
    for (let rowIdx = 0; rowIdx < 12; rowIdx++) {
      const hourRow = document.createElement('div')
      hourRow.className = 'hour-row'
      dayBody.appendChild(hourRow)
    }

    const eventsArea = document.createElement('div')
    eventsArea.className = 'events-area'

    const dayEvents = filterEventsForWindow(
      this._events,
      dayDateStr,
      windowStartHour,
      tz,
    )

    for (const event of dayEvents) {
      const layout = eventLayouts.get(getEventKey(event)) ?? {
        event,
        column: 0,
        columnSpan: 1,
        totalColumns: 1,
      }
      eventsArea.appendChild(
        buildEventElement(event, windowStartHour, layout, locale, tz),
      )
    }

    dayBody.appendChild(eventsArea)

    if (isToday && timeIndicatorPct >= 0 && timeIndicatorPct <= 100) {
      const indicator = document.createElement('div')
      indicator.className = 'current-time-indicator'
      indicator.style.setProperty('top', `${timeIndicatorPct}%`)
      dayBody.appendChild(indicator)
    }
    dayCol.appendChild(dayBody)
    return dayCol
  }

  private _render() {
    const shadow = this.shadowRoot!
    const tz = this._timezone
    const locale = this._locale
    const now = this._now

    const nowInTz = dayjs(now).tz(tz)
    const currentHour = nowInTz.hour()
    const currentMinute = nowInTz.minute()
    const windowStartHour = getWindowStartHour(currentHour)
    const timeSlots = generateTimeSlots(windowStartHour, now, locale, tz)
    const weekStart = this._getWeekStart()
    const eventLayouts = this._getEventLayouts()
    const todayStr = nowInTz.format('YYYY-MM-DD')
    const currentSlotIndex = timeSlots.findIndex(
      (slot) => slot.hour === currentHour,
    )
    const timeIndicatorPct =
      currentSlotIndex >= 0
        ? ((currentSlotIndex + currentMinute / 60) / 12) * 100
        : -1

    shadow.innerHTML = `<style>${COMPONENT_CSS}</style>`

    const container = document.createElement('div')
    container.className = 'weekly-calendar-container'
    const title = document.createElement('p')
    title.className = 'this-week-title'
    title.textContent = 'This week'
    container.appendChild(title)

    const weekGrid = document.createElement('div')
    weekGrid.className = 'week-grid'
    weekGrid.appendChild(buildTimeGutter(timeSlots))

    const daysGrid = document.createElement('div')
    daysGrid.className = 'days-grid'
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      daysGrid.appendChild(
        this._buildDayColumn(
          dayIdx,
          weekStart,
          windowStartHour,
          todayStr,
          timeIndicatorPct,
          eventLayouts,
        ),
      )
    }

    weekGrid.appendChild(daysGrid)
    container.appendChild(weekGrid)
    shadow.appendChild(container)
  }
}

if (
  typeof window !== 'undefined' &&
  !customElements.get('weekly-calendar-view')
) {
  customElements.define('weekly-calendar-view', WeeklyCalendarView)
}
