export const VIEW_MODE = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE]

export interface CalendarEvent {
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
}

export interface CalendarDay {
  day: number
  isCurrentMonth: boolean
}

export interface TimeSlot {
  time: string
  hour: number
}
