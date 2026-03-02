import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export interface CalendarEvent {
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
  backgroundColor?: string
}

export interface EventLayout {
  event: CalendarEvent
  column: number
  columnSpan: number
  totalColumns: number
}

const eventsOverlap = (
  a: CalendarEvent,
  b: CalendarEvent,
  tz: string,
): boolean => {
  const aStart = dayjs(a.startTime).tz(tz)
  const aEnd = dayjs(a.endTime).tz(tz)
  const bStart = dayjs(b.startTime).tz(tz)
  const bEnd = dayjs(b.endTime).tz(tz)
  return aStart.isBefore(bEnd) && bStart.isBefore(aEnd)
}

export const findEventClusters = (
  allEvents: CalendarEvent[],
  tz: string,
): CalendarEvent[][] => {
  if (allEvents.length === 0) return []

  const sortedEvents = [...allEvents].sort((a, b) =>
    dayjs(a.startTime).tz(tz).diff(dayjs(b.startTime).tz(tz)),
  )

  const adjacencyList = new Map<CalendarEvent, Set<CalendarEvent>>()
  for (let i = 0; i < sortedEvents.length; i++) {
    const eventI = sortedEvents[i]!
    adjacencyList.set(eventI, new Set())
    const eventAEnd = dayjs(eventI.endTime).tz(tz)

    for (let j = i + 1; j < sortedEvents.length; j++) {
      const eventJ = sortedEvents[j]!
      const eventBStart = dayjs(eventJ.startTime).tz(tz)
      if (eventBStart.isSameOrAfter(eventAEnd)) break

      if (eventsOverlap(eventI, eventJ, tz)) {
        adjacencyList.get(eventI)!.add(eventJ)
        if (!adjacencyList.has(eventJ)) {
          adjacencyList.set(eventJ, new Set())
        }
        adjacencyList.get(eventJ)!.add(eventI)
      }
    }
  }

  const visited = new Set<CalendarEvent>()
  const clusters: CalendarEvent[][] = []

  for (const event of sortedEvents) {
    if (visited.has(event)) continue

    const cluster: CalendarEvent[] = []
    const queue: CalendarEvent[] = [event]
    let queueIndex = 0

    while (queueIndex < queue.length) {
      const current = queue[queueIndex++]!
      if (visited.has(current)) continue

      visited.add(current)
      cluster.push(current)

      const neighbors = adjacencyList.get(current) || new Set()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
        }
      }
    }

    cluster.sort((a, b) => {
      const startDiff = dayjs(a.startTime)
        .tz(tz)
        .diff(dayjs(b.startTime).tz(tz))
      if (startDiff !== 0) return startDiff
      const aDuration = dayjs(a.endTime).diff(dayjs(a.startTime))
      const bDuration = dayjs(b.endTime).diff(dayjs(b.startTime))
      return bDuration - aDuration
    })

    clusters.push(cluster)
  }

  return clusters
}

export const calculateClusterLayouts = (
  cluster: CalendarEvent[],
  tz: string,
): Map<CalendarEvent, EventLayout> => {
  const layouts = new Map<CalendarEvent, EventLayout>()
  const columns: dayjs.Dayjs[] = []
  const eventColumnAssignments = new Map<CalendarEvent, number>()

  for (const event of cluster) {
    const eventStart = dayjs(event.startTime).tz(tz)

    let assignedColumn = -1
    for (let col = 0; col < columns.length; col++) {
      if (columns[col]?.isSameOrBefore(eventStart)) {
        assignedColumn = col
        break
      }
    }

    if (assignedColumn === -1) {
      assignedColumn = columns.length
      columns.push(dayjs(0))
    }

    columns[assignedColumn] = dayjs(event.endTime).tz(tz)
    eventColumnAssignments.set(event, assignedColumn)
  }

  const totalColumns = columns.length

  const eventsByColumn = new Map<number, CalendarEvent[]>()
  for (let col = 0; col < totalColumns; col++) {
    eventsByColumn.set(col, [])
  }
  for (const e of cluster) {
    const eColumn = eventColumnAssignments.get(e)
    if (eColumn !== undefined) {
      eventsByColumn.get(eColumn)!.push(e)
    }
  }

  for (const event of cluster) {
    const eventStart = dayjs(event.startTime).tz(tz)
    const eventEnd = dayjs(event.endTime).tz(tz)
    const eventColumn = eventColumnAssignments.get(event)!

    let columnSpan = 1
    for (let col = eventColumn + 1; col < totalColumns; col++) {
      const eventsInCol = eventsByColumn.get(col) || []
      const columnBlocked = eventsInCol.some((other) => {
        const otherStart = dayjs(other.startTime).tz(tz)
        const otherEnd = dayjs(other.endTime).tz(tz)
        return eventStart.isBefore(otherEnd) && otherStart.isBefore(eventEnd)
      })
      if (columnBlocked) break
      columnSpan++
    }

    layouts.set(event, {
      event,
      column: eventColumn,
      columnSpan,
      totalColumns,
    })
  }

  return layouts
}

export const getEventKey = (event: CalendarEvent): string =>
  `${event.startTime}|${event.endTime}|${event.title || ''}`
