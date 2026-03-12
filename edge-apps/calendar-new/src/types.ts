export interface CalendarEvent {
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
  backgroundColor?: string
}

export type ViewMode = 'daily' | 'weekly' | 'schedule'

export const VIEW_MODE = {
  DAILY: 'daily' as ViewMode,
  WEEKLY: 'weekly' as ViewMode,
  SCHEDULE: 'schedule' as ViewMode,
}
