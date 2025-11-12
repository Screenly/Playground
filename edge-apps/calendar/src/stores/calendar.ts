import { createBaseCalendarStore } from '@edge-apps/blueprint/ts/stores/base-calendar-store'
import { fetchCalendarEventsFromICal } from '@/events'
import { useSettingsStore } from '@/stores/settings'

export const useCalendarStore = createBaseCalendarStore(
  fetchCalendarEventsFromICal,
  useSettingsStore,
)
