import dayjs from 'dayjs'
import type { CalendarEvent } from '../constants/calendar'

// Event layout interface for column-based positioning
export interface EventLayout {
  event: CalendarEvent
  column: number
  columnSpan: number
  totalColumns: number
}

// Check if two events overlap in time
export const eventsOverlap = (
  a: CalendarEvent,
  b: CalendarEvent,
  timezone: string,
): boolean => {
  const aStart = dayjs(a.startTime).tz(timezone)
  const aEnd = dayjs(a.endTime).tz(timezone)
  const bStart = dayjs(b.startTime).tz(timezone)
  const bEnd = dayjs(b.endTime).tz(timezone)
  return aStart.isBefore(bEnd) && bStart.isBefore(aEnd)
}

// Find connected clusters of events (events connected through transitive overlaps)
// Uses pre-sorting and adjacency list for O(n log n + n²) instead of O(n³)
export const findEventClusters = (
  allEvents: CalendarEvent[],
  timezone: string,
): CalendarEvent[][] => {
  if (allEvents.length === 0) return []

  // Pre-sort events by start time for efficient overlap detection
  const sortedEvents = [...allEvents].sort((a, b) => {
    return dayjs(a.startTime).tz(timezone).diff(dayjs(b.startTime).tz(timezone))
  })

  // Build adjacency list: for each event, find which events it overlaps with
  const adjacencyList = new Map<CalendarEvent, Set<CalendarEvent>>()
  for (let i = 0; i < sortedEvents.length; i++) {
    const eventI = sortedEvents[i]!
    adjacencyList.set(eventI, new Set())
    const eventAEnd = dayjs(eventI.endTime).tz(timezone)

    // Only check events that start before this event ends (sorted by start time)
    for (let j = i + 1; j < sortedEvents.length; j++) {
      const eventJ = sortedEvents[j]!
      const eventBStart = dayjs(eventJ.startTime).tz(timezone)
      if (eventBStart.isSameOrAfter(eventAEnd)) break // No more overlaps possible

      if (eventsOverlap(eventI, eventJ, timezone)) {
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

    // BFS to find all events in this cluster using pre-built adjacency list
    const cluster: CalendarEvent[] = []
    const queue: CalendarEvent[] = [event]
    let queueIndex = 0

    while (queueIndex < queue.length) {
      const current = queue[queueIndex++]!
      if (visited.has(current)) continue

      visited.add(current)
      cluster.push(current)

      // Add neighbors from adjacency list (O(1) lookup)
      const neighbors = adjacencyList.get(current) || new Set()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
        }
      }
    }

    // Sort cluster by start time, then by duration (longer first)
    cluster.sort((a, b) => {
      const startDiff = dayjs(a.startTime)
        .tz(timezone)
        .diff(dayjs(b.startTime).tz(timezone))
      if (startDiff !== 0) return startDiff
      const aDuration = dayjs(a.endTime).diff(dayjs(a.startTime))
      const bDuration = dayjs(b.endTime).diff(dayjs(b.startTime))
      return bDuration - aDuration
    })

    clusters.push(cluster)
  }

  return clusters
}

// Calculate event layouts for a cluster using column-based algorithm (Google Calendar style)
export const calculateClusterLayouts = (
  cluster: CalendarEvent[],
  timezone: string,
): Map<CalendarEvent, EventLayout> => {
  const layouts = new Map<CalendarEvent, EventLayout>()
  const columns: dayjs.Dayjs[] = []
  const eventColumnAssignments = new Map<CalendarEvent, number>()

  // Assign each event in the cluster to a column
  for (const event of cluster) {
    const eventStart = dayjs(event.startTime).tz(timezone)

    // Find the first available column
    let assignedColumn = -1
    for (let col = 0; col < columns.length; col++) {
      if (columns[col]?.isSameOrBefore(eventStart)) {
        assignedColumn = col
        break
      }
    }

    // If no column is available, create a new one
    if (assignedColumn === -1) {
      assignedColumn = columns.length
      columns.push(dayjs(0))
    }

    // Update the column's end time
    columns[assignedColumn] = dayjs(event.endTime).tz(timezone)
    eventColumnAssignments.set(event, assignedColumn)
  }

  const totalColumns = columns.length

  // Pre-compute which columns each event blocks to avoid repeated O(n) lookups
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

  // Calculate column span for each event
  for (const event of cluster) {
    const eventStart = dayjs(event.startTime).tz(timezone)
    const eventEnd = dayjs(event.endTime).tz(timezone)
    const eventColumn = eventColumnAssignments.get(event)!

    // Calculate how far this event can expand to the right
    let columnSpan = 1
    for (let col = eventColumn + 1; col < totalColumns; col++) {
      // Check if any event in this column overlaps with our event
      const eventsInCol = eventsByColumn.get(col) || []
      const columnBlocked = eventsInCol.some((other) => {
        const otherStart = dayjs(other.startTime).tz(timezone)
        const otherEnd = dayjs(other.endTime).tz(timezone)
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

// Generate a stable key for an event to use in Maps
export const getEventKey = (event: CalendarEvent): string => {
  return `${event.startTime}|${event.endTime}|${event.title || ''}`
}
