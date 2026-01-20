export const VIEW_MODE = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SCHEDULE: 'schedule',
} as const

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE]

// We still need to support 'monthly' for backward compatibility.
// We might support for actually displaying monthly view in the future.
export type CalendarMode = 'daily' | 'weekly' | 'schedule' | 'monthly'

export interface CalendarEvent {
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
  colorId?: string
  backgroundColor?: string
}

export interface CalendarDay {
  day: number
  isCurrentMonth: boolean
}

export interface TimeSlot {
  time: string
  hour: number
}
