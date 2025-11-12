/* global screenly */

import { ref, computed, shallowRef, type Ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getFormattedTime,
  getFormattedMonthName,
  getYear,
  getDate,
  getFormattedDayOfWeek,
} from '../utils/calendar'
import { getLocale, getTimeZone } from '../utils/locale'
import { initializeSentrySettings } from '../utils/sentry'
import type { CalendarEvent } from '../constants/calendar'

const EVENTS_REFRESH_INTERVAL = 10000

interface ExtendedWindow extends Window {
  __calendarCleanup?: () => void
}

interface BaseSettingsStore {
  overrideLocale?: string | null
  overrideTimezone?: string | null
}

export const createBaseCalendarStore = (
  fetchEvents: () => Promise<CalendarEvent[]>,
  useSettingsStore: () => BaseSettingsStore,
) => {
  return defineStore('calendar', () => {
    // State - using shallowRef for events to reduce reactivity overhead
    const now: Ref<Date> = ref(new Date())
    const weeklyViewTime: Ref<Date> = ref(new Date())
    const events: Ref<CalendarEvent[]> = shallowRef([])
    const currentTime: Ref<string> = ref('')
    const locale: Ref<string> = ref('en-US')
    const isInitialized: Ref<boolean> = ref(false)
    const timezone: Ref<string> = ref('UTC')

    // Memoized getters for better performance
    const currentDayOfWeek = computed(() => {
      return getFormattedDayOfWeek(now.value, locale.value)
    })

    const currentDate = computed(() => {
      return getDate(now.value)
    })

    const currentMonthName = computed(() => {
      return getFormattedMonthName(now.value, locale.value)
    })

    const currentYear = computed(() => {
      return getYear(now.value)
    })

    // Actions
    const updateDateTime = async () => {
      const newNow = new Date()
      now.value = newNow
      const time = await getFormattedTime(newNow, locale.value, timezone.value)
      currentTime.value = time
    }

    const updateEvents = async () => {
      const fetchedEvents = await fetchEvents()
      events.value = fetchedEvents
    }

    const setupLocale = async () => {
      const settingsStore = useSettingsStore()
      const overrideLocale = settingsStore.overrideLocale

      if (overrideLocale) {
        locale.value = overrideLocale.replace('_', '-')
        return
      }

      try {
        const fetchedLocale = await getLocale()
        locale.value = fetchedLocale
      } catch (error) {
        console.error('Error fetching locale:', error)
      }
    }

    const setupTimeZone = () => {
      const settingsStore = useSettingsStore()
      const overrideTimezone = settingsStore.overrideTimezone
      if (overrideTimezone) {
        timezone.value = overrideTimezone
      } else {
        timezone.value = getTimeZone()
      }
    }

    const initialize = async () => {
      if (isInitialized.value) return

      try {
        // We have to initialize the timezone as soon as we can so that
        // Anywhere Screens won't always show UTC time.
        setupTimeZone()

        // Initialize Sentry
        initializeSentrySettings()

        // Set up intervals with optimized timing
        const timeInterval = setInterval(updateDateTime, 1000)
        const weeklyViewTimeInterval = setInterval(() => {
          weeklyViewTime.value = new Date()
        }, 60000)

        // Set up events fetching with reduced frequency for better performance
        const eventsInterval = setInterval(updateEvents, EVENTS_REFRESH_INTERVAL)
        await updateEvents()

        // Set up locale and initial time
        await setupLocale()
        await updateDateTime()

        // Signal ready for rendering
        try {
          screenly.signalReadyForRendering()
        } catch (error) {
          console.error('Error signaling ready for rendering:', error)
        }

        isInitialized.value = true

        // Store cleanup function for later use if needed
        const cleanup = () => {
          clearInterval(timeInterval)
          clearInterval(weeklyViewTimeInterval)
          clearInterval(eventsInterval)
        }

        // Store cleanup function in a way that can be accessed if needed
        ;(window as ExtendedWindow).__calendarCleanup = cleanup
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        throw new Error(`Error initializing calendar: ${errorMessage}`)
      }
    }

    return {
      now,
      weeklyViewTime,
      events,
      currentTime,
      locale,
      isInitialized,
      currentDayOfWeek,
      currentDate,
      currentMonthName,
      currentYear,
      updateDateTime,
      fetchEvents: updateEvents,
      setupLocale,
      initialize,
      timezone,
    }
  })
}
