export const GOOGLE_CALENDAR_API_BASE_URL =
  'https://www.googleapis.com/calendar/v3/calendars'
export const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export const VIEW_MODE = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const

export const DAILY_VIEW_EVENT_LIMIT = 3
export const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000 // 30 minutes in milliseconds

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
