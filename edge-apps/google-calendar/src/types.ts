import type { CalendarEvent as BaseCalendarEvent } from '@screenly/edge-apps'

export interface CalendarEvent extends BaseCalendarEvent {
  colorId?: string
}
