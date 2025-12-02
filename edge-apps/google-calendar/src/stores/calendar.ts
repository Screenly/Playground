import { ref, computed, shallowRef, type Ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getFormattedTime,
  initializeSentrySettings,
  getFormattedMonthName,
  getYear,
  getDate,
  getFormattedDayOfWeek,
  getLocale,
  getTimeZone,
  getAccessToken,
} from '@/utils'
import { fetchCalendarEventsFromGoogleAPI } from '@/events'
import type { CalendarEvent } from '@/constants'
import { useSettingsStore } from '@/stores/settings'

const EVENTS_REFRESH_INTERVAL = 10000
const DEFAULT_TOKEN_REFRESH_SEC = 30 * 60 // Refresh token every 30 minutes

// Extend Window interface to include our custom property
interface ExtendedWindow extends Window {
  __calendarCleanup?: () => void
}

export const useCalendarStore = defineStore('calendar', () => {
  // State - using shallowRef for events to reduce reactivity overhead
  const now: Ref<Date> = ref(new Date())
  const weeklyViewTime: Ref<Date> = ref(new Date())
  const events: Ref<CalendarEvent[]> = shallowRef([])
  const currentTime: Ref<string> = ref('')
  const locale: Ref<string> = ref('en-US')
  const isInitialized: Ref<boolean> = ref(false)
  const accessToken: Ref<string | null> = ref(null)

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
    const time = await getFormattedTime(newNow)
    currentTime.value = time
  }

  const fetchAccessToken = async () => {
    try {
      const token = await getAccessToken()
      accessToken.value = token
      return token
    } catch {
      accessToken.value = null
      return null
    }
  }

  const initTokenRefreshLoop = () => {
    let currentErrorStep = 0
    const initErrorDelaySec = 15
    const maxErrorStep = 7

    const run = async () => {
      let nextTimeout = DEFAULT_TOKEN_REFRESH_SEC
      try {
        await fetchAccessToken()
        currentErrorStep = 0
      } catch {
        nextTimeout = Math.min(
          initErrorDelaySec * Math.pow(2, currentErrorStep),
          nextTimeout,
        )
        if (currentErrorStep >= maxErrorStep) {
          return
        }
        currentErrorStep += 1
      }
      setTimeout(run, nextTimeout * 1000)
    }

    setTimeout(run, DEFAULT_TOKEN_REFRESH_SEC * 1000)
  }

  const fetchEvents = async () => {
    const token = accessToken.value || (await fetchAccessToken())
    if (token) {
      const fetchedEvents = await fetchCalendarEventsFromGoogleAPI(token)
      events.value = fetchedEvents
    }
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
    } catch {
      // Error fetching locale
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

      // Initialize token refresh loop for Google Calendar
      initTokenRefreshLoop()

      // Set up events fetching with reduced frequency for better performance
      const eventsInterval = setInterval(fetchEvents, EVENTS_REFRESH_INTERVAL)
      await fetchEvents()

      // Set up locale and initial time
      await setupLocale()
      await updateDateTime()

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
    accessToken,
    currentDayOfWeek,
    currentDate,
    currentMonthName,
    currentYear,
    updateDateTime,
    fetchEvents,
    fetchAccessToken,
    initTokenRefreshLoop,
    setupLocale,
    initialize,
    timezone,
  }
})
