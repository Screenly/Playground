export interface CalendarEvent {
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
  colorId?: string
  backgroundColor?: string
}

export type { CalendarViewMode } from '@screenly/edge-apps'
export { CALENDAR_VIEW_MODE } from '@screenly/edge-apps'
