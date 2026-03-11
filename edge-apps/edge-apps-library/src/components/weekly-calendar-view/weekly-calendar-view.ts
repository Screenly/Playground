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
import {
  type TimeSlot,
  generateTimeSlots,
  getEventStyle,
  getWindowStartHour,
  formatEventTime,
  setAttribute,
} from './weekly-calendar-view-utils.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export type { CalendarEvent }

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

  private _buildTimeGutter(timeSlots: TimeSlot[]): HTMLElement {
    const timeGutter = document.createElement('div')
    timeGutter.className = 'time-gutter'
    for (const slot of timeSlots) {
      const label = document.createElement('div')
      label.className = 'time-label'
      label.textContent = slot.time
      timeGutter.appendChild(label)
    }
    return timeGutter
  }

  private _buildEventElement(
    event: CalendarEvent,
    windowStartHour: number,
    layout: EventLayout,
    locale: string,
    tz: string,
  ): HTMLElement {
    const style = getEventStyle(event, windowStartHour, layout, tz)

    const wrapper = document.createElement('div')
    wrapper.className = 'event-wrapper'
    wrapper.style.setProperty('top', `${style.topPct}%`)
    wrapper.style.setProperty('height', `${style.heightPct}%`)
    wrapper.style.setProperty('width', `${style.widthPct}%`)
    wrapper.style.setProperty('left', `${style.leftPct}%`)
    wrapper.style.setProperty('z-index', String(style.zIndex))

    const item = document.createElement('div')
    const itemClasses = ['event-item']
    if (style.clippedTop) itemClasses.push('clipped-top')
    if (style.clippedBottom) itemClasses.push('clipped-bottom')
    item.className = itemClasses.join(' ')
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
    wrapper.appendChild(item)
    return wrapper
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

    const dayDate = new Date(weekStart)
    dayDate.setDate(dayDate.getDate() + dayIdx)
    const dayDateStr = dayjs(dayDate).tz(tz).format('YYYY-MM-DD')
    const isToday = dayDateStr === todayStr

    const dayCol = document.createElement('div')
    dayCol.className = 'day-column'
    setAttribute(dayCol, 'data-day-index', String(dayIdx))

    const dayHeader = document.createElement('div')
    dayHeader.className = isToday ? 'day-header today' : 'day-header'
    const dayName = document.createElement('span')
    dayName.className = 'day-name'
    dayName.textContent = DAYS_OF_WEEK[dayIdx] || ''
    dayHeader.appendChild(dayName)
    const dayDateNum = document.createElement('span')
    dayDateNum.className = 'day-date'
    dayDateNum.textContent = String(dayDate.getDate())
    dayHeader.appendChild(dayDateNum)
    dayCol.appendChild(dayHeader)

    const dayBody = document.createElement('div')
    dayBody.className = 'day-body'
    for (let rowIdx = 0; rowIdx < 12; rowIdx++) {
      const hourRow = document.createElement('div')
      hourRow.className = 'hour-row'
      dayBody.appendChild(hourRow)
    }

    const windowEndHour = (windowStartHour + 12) % 24
    const normalizedWindowEnd =
      windowEndHour <= windowStartHour ? windowEndHour + 24 : windowEndHour

    const dayEvents = this._events.filter((event) => {
      if (event.isAllDay) return false
      const eventStart = dayjs(event.startTime).tz(tz)
      if (eventStart.format('YYYY-MM-DD') !== dayDateStr) return false
      const startH = eventStart.hour() + eventStart.minute() / 60
      const endDt = dayjs(event.endTime).tz(tz)
      const endH = endDt.hour() + endDt.minute() / 60
      const normStart = startH < windowStartHour ? startH + 24 : startH
      const normEnd = endH <= windowStartHour ? endH + 24 : endH
      return normStart < normalizedWindowEnd && normEnd > windowStartHour
    })

    for (const event of dayEvents) {
      const layout = eventLayouts.get(getEventKey(event)) ?? {
        event,
        column: 0,
        columnSpan: 1,
        totalColumns: 1,
      }
      dayBody.appendChild(
        this._buildEventElement(event, windowStartHour, layout, locale, tz),
      )
    }

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

    const currentHour = parseInt(
      now.toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: tz,
      }),
      10,
    )
    const windowStartHour = getWindowStartHour(currentHour)
    const timeSlots = generateTimeSlots(windowStartHour, now, locale)
    const weekStart = this._getWeekStart()
    const eventLayouts = this._getEventLayouts()
    const todayStr = dayjs(now).tz(tz).format('YYYY-MM-DD')

    const currentMinute = parseInt(
      now.toLocaleString('en-US', { minute: 'numeric', timeZone: tz }),
      10,
    )
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
    weekGrid.appendChild(this._buildTimeGutter(timeSlots))

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
