import type { CalendarEvent, EventLayout } from './event-layout.js'
import {
  type TimeSlot,
  getEventStyle,
  formatEventStartTime,
  formatEventTime,
} from './weekly-calendar-view-utils.js'

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

export function buildEventElement(
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
  wrapper.style.setProperty('left', `${style.leftPct}%`)
  wrapper.style.setProperty('z-index', String(style.zIndex))
  if (style.isLastColumn) {
    wrapper.style.setProperty('right', '0')
  } else {
    wrapper.style.setProperty('width', `${style.widthPct}%`)
  }

  const item = document.createElement('div')
  const itemClasses = ['event-item']
  if (style.clippedTop) itemClasses.push('clipped-top')
  if (style.clippedBottom) itemClasses.push('clipped-bottom')
  item.className = itemClasses.join(' ')
  if (event.backgroundColor) {
    item.style.setProperty('background-color', event.backgroundColor)
  }

  const fortyFiveMinPercent = (45 / 60) * (100 / 12)
  const isCompact = style.heightPct <= fortyFiveMinPercent
  if (isCompact) {
    item.classList.add('event-compact')
  }

  const titleEl = document.createElement('div')
  titleEl.className = 'event-title'
  if (isCompact) {
    titleEl.textContent = `${event.title}, `
    const inlineTimeEl = document.createElement('span')
    inlineTimeEl.className = 'event-inline-time'
    inlineTimeEl.textContent = formatEventStartTime(event.startTime, locale, tz)
    titleEl.appendChild(inlineTimeEl)
    item.appendChild(titleEl)
  } else {
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
  }

  wrapper.appendChild(item)
  return wrapper
}
