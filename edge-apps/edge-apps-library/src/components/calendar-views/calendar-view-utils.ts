import type { CalendarEvent, EventLayout } from './event-layout.js'
import type { TimeSlot } from './calendar-window-utils.js'
import {
  getEventStyle,
  formatEventStartTime,
  formatEventTime,
} from './weekly-calendar-view/weekly-calendar-view-utils.js'

export function buildTimeGutter(timeSlots: TimeSlot[]): HTMLElement {
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

function buildCompactEventItem(
  event: CalendarEvent,
  locale: string,
  timezone: string,
): HTMLElement {
  const item = document.createElement('div')
  item.className = 'event-item event-compact'
  if (event.backgroundColor) {
    item.style.setProperty('background-color', event.backgroundColor)
  }

  const titleEl = document.createElement('div')
  titleEl.className = 'event-title'
  titleEl.textContent = `${event.title}, `

  const inlineTimeEl = document.createElement('span')
  inlineTimeEl.className = 'event-inline-time'
  inlineTimeEl.textContent = formatEventStartTime(
    event.startTime,
    locale,
    timezone,
  )
  titleEl.appendChild(inlineTimeEl)
  item.appendChild(titleEl)

  return item
}

function buildFullEventItem(
  event: CalendarEvent,
  style: { clippedTop: boolean; clippedBottom: boolean },
  locale: string,
  timezone: string,
): HTMLElement {
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
    timezone,
  )

  item.appendChild(titleEl)
  item.appendChild(timeEl)

  return item
}

export function buildEventElement(
  event: CalendarEvent,
  windowStartHour: number,
  layout: EventLayout,
  locale: string,
  timezone: string,
): HTMLElement {
  const style = getEventStyle(event, windowStartHour, layout, timezone)

  const wrapper = document.createElement('div')
  wrapper.className = 'event-wrapper'
  wrapper.style.setProperty('top', `${style.topPercent}%`)
  wrapper.style.setProperty('height', `${style.heightPercent}%`)
  wrapper.style.setProperty('left', `${style.leftPercent}%`)
  wrapper.style.setProperty('z-index', String(style.zIndex))
  if (style.isLastColumn) {
    wrapper.style.setProperty('right', '0')
  } else {
    wrapper.style.setProperty('width', `${style.widthPercent}%`)
  }

  // Events shorter than 45 minutes don't have room for a stacked title + time range,
  // so they get the compact inline layout instead.
  const COMPACT_THRESHOLD_PCT = (45 / 60) * (100 / 12)
  const isCompact = style.heightPercent <= COMPACT_THRESHOLD_PCT

  const item = isCompact
    ? buildCompactEventItem(event, locale, timezone)
    : buildFullEventItem(event, style, locale, timezone)

  wrapper.appendChild(item)
  return wrapper
}
