import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import componentCss from './weekly-calendar-view.css?inline'
import {
  type CalendarEvent,
  type EventLayout,
  findEventClusters,
  calculateClusterLayouts,
  getEventKey,
} from './event-layout.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export type { CalendarEvent }

interface TimeSlot {
  time: string
  hour: number
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWindowStartHour(currentHour: number): number {
  return currentHour > 12 ? 13 : currentHour
}

function generateTimeSlots(
  startHour: number,
  now: Date,
  locale: string,
): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let i = 0; i < 12; i++) {
    const hour = (startHour + i) % 24
    const baseDate = new Date(now)
    baseDate.setHours(hour, 0, 0, 0)
    let timeString: string
    try {
      timeString = baseDate.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch {
      const formattedHour = hour === 0 ? 12 : hour % 12 || 12
      const ampm = hour < 12 ? 'AM' : 'PM'
      timeString = `${formattedHour}:00 ${ampm}`
    }
    slots.push({ time: timeString, hour })
  }
  return slots
}

function getEventStyle(
  event: CalendarEvent,
  windowStartHour: number,
  layout: EventLayout,
  tz: string,
): {
  topPct: number
  heightPct: number
  widthPct: number
  leftPct: number
  zIndex: number
  clippedTop: boolean
  clippedBottom: boolean
} {
  const windowSize = 12
  const windowEndHour = (windowStartHour + windowSize) % 24

  const startDt = dayjs(event.startTime).tz(tz)
  const endDt = dayjs(event.endTime).tz(tz)

  const startHour = startDt.hour() + startDt.minute() / 60
  const endHour = endDt.hour() + endDt.minute() / 60

  const normalizedWindowEnd =
    windowEndHour <= windowStartHour
      ? windowEndHour + 24
      : windowEndHour

  const normalizedStart =
    startHour < windowStartHour ? startHour + 24 : startHour
  const normalizedEnd =
    endHour <= windowStartHour ? endHour + 24 : endHour

  const visibleStart = Math.max(normalizedStart, windowStartHour)
  const visibleEnd = Math.min(normalizedEnd, normalizedWindowEnd)

  const topPct = ((visibleStart - windowStartHour) / windowSize) * 100
  const heightPct = Math.max(
    ((visibleEnd - visibleStart) / windowSize) * 100,
    0.5,
  )

  const clippedTop = normalizedStart < windowStartHour
  const clippedBottom = normalizedEnd > normalizedWindowEnd

  const columnWidth = 100 / layout.totalColumns
  const span = layout.columnSpan > 0 ? layout.columnSpan : 1
  const isLastColumn = layout.column + span >= layout.totalColumns
  const overlapBonus = isLastColumn ? 0 : columnWidth * 0.7
  const widthPct = columnWidth * span + overlapBonus
  const leftPct = layout.column * columnWidth
  const zIndex = 2 + layout.column

  return { topPct, heightPct, widthPct, leftPct, zIndex, clippedTop, clippedBottom }
}

function formatEventTime(
  startTime: string,
  endTime: string,
  locale: string,
  tz: string,
): string {
  try {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const opts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: tz,
    }
    const s = start.toLocaleTimeString(locale, opts)
    const e = end.toLocaleTimeString(locale, opts)
    return `${s} – ${e}`
  } catch {
    return ''
  }
}

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
      now.toLocaleString('en-US', {
        minute: 'numeric',
        timeZone: tz,
      }),
      10,
    )
    const currentSlotIndex = timeSlots.findIndex(
      (slot) => slot.hour === currentHour,
    )
    const minuteFraction = currentMinute / 60
    const timeIndicatorPct =
      currentSlotIndex >= 0
        ? ((currentSlotIndex + minuteFraction) / 12) * 100
        : -1

    shadow.innerHTML = `<style>${componentCss}</style>`

    const container = document.createElement('div')
    container.className = 'weekly-calendar-container'

    const title = document.createElement('p')
    title.className = 'this-week-title'
    title.textContent = 'This week'
    container.appendChild(title)

    const weekGrid = document.createElement('div')
    weekGrid.className = 'week-grid'

    const timeGutter = document.createElement('div')
    timeGutter.className = 'time-gutter'
    for (const slot of timeSlots) {
      const label = document.createElement('div')
      label.className = 'time-label'
      label.textContent = slot.time
      timeGutter.appendChild(label)
    }
    weekGrid.appendChild(timeGutter)

    const daysGrid = document.createElement('div')
    daysGrid.className = 'days-grid'

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
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

      const dayEvents = this._events.filter((event) => {
        if (event.isAllDay) return false
        const eventStart = dayjs(event.startTime).tz(tz)
        const eventDate = eventStart.format('YYYY-MM-DD')
        if (eventDate !== dayDateStr) return false

        const startH = eventStart.hour() + eventStart.minute() / 60
        const endDt = dayjs(event.endTime).tz(tz)
        const endH = endDt.hour() + endDt.minute() / 60

        const normalizedWindowEnd =
          windowEndHour <= windowStartHour
            ? windowEndHour + 24
            : windowEndHour
        const normalizedStart =
          startH < windowStartHour ? startH + 24 : startH
        const normalizedEnd =
          endH <= windowStartHour ? endH + 24 : endH

        return normalizedStart < normalizedWindowEnd && normalizedEnd > windowStartHour
      })

      for (const event of dayEvents) {
        const key = getEventKey(event)
        const layout = eventLayouts.get(key) ?? {
          event,
          column: 0,
          columnSpan: 1,
          totalColumns: 1,
        }

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
        dayBody.appendChild(wrapper)
      }

      if (isToday && timeIndicatorPct >= 0 && timeIndicatorPct <= 100) {
        const indicator = document.createElement('div')
        indicator.className = 'current-time-indicator'
        indicator.style.setProperty('top', `${timeIndicatorPct}%`)
        dayBody.appendChild(indicator)
      }

      dayCol.appendChild(dayBody)
      daysGrid.appendChild(dayCol)
    }

    weekGrid.appendChild(daysGrid)
    container.appendChild(weekGrid)
    shadow.appendChild(container)
  }
}

function setAttribute(el: HTMLElement, name: string, value: string) {
  const allowed = new Set([
    'class',
    'style',
    'data-day-index',
    'data-hour',
    'title',
    'aria-label',
  ])
  if (allowed.has(name) || name.startsWith('data-')) {
    el.setAttribute(name, value)
  }
}
