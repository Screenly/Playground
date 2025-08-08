import { ref, computed, shallowRef, type Ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getFormattedTime,
  initializeGlobalBrandingSettings,
  initializeSentrySettings,
  getFormattedMonthName,
  getYear,
  getDate,
  getFormattedDayOfWeek,
  getAccessToken,
  getLocale,
  getTimeZone,
} from '@/utils'
import {
  fetchCalendarEventsFromAPI,
  fetchCalendarEventsFromICal,
} from '@/events'
import { TOKEN_REFRESH_INTERVAL } from '@/constants'
import type { CalendarEvent } from '@/constants'
import { useSettingsStore } from '@/stores/settings'

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
  const currentTokenRef: Ref<string> = ref('')
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
    return getFormattedMonthName(now.value)
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

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const {
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      } = screenly.settings

      if (refreshToken && clientId && clientSecret) {
        const newToken = await getAccessToken(
          refreshToken as string,
          clientId as string,
          clientSecret as string,
        )
        currentTokenRef.value = newToken
        return newToken
      }
      return null
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return null
    }
  }

  const fetchEvents = async () => {
    const settingsStore = useSettingsStore()
    const sourceType = settingsStore.calendarSourceType

    if (sourceType === 'api') {
      const token = currentTokenRef.value || (await refreshAccessToken())
      if (token) {
        const fetchedEvents = await fetchCalendarEventsFromAPI(token)
        events.value = fetchedEvents
      }
    } else if (sourceType === 'ical') {
      const fetchedEvents = await fetchCalendarEventsFromICal()
      events.value = fetchedEvents
    }
  }

  const setupLocale = async () => {
    try {
      const fetchedLocale = await getLocale()
      locale.value = fetchedLocale
    } catch (error) {
      console.error('Error fetching locale:', error)
    }
  }

  const initialize = async () => {
    if (isInitialized.value) return

    try {
      // Initialize branding and Sentry
      initializeGlobalBrandingSettings()
      initializeSentrySettings()

      // Set up intervals with optimized timing
      const timeInterval = setInterval(updateDateTime, 1000)
      const weeklyViewTimeInterval = setInterval(() => {
        weeklyViewTime.value = new Date()
      }, 60000)
      const tokenInterval = setInterval(
        refreshAccessToken,
        TOKEN_REFRESH_INTERVAL,
      )

      // Set up events fetching with reduced frequency for better performance
      let eventsInterval: NodeJS.Timeout | undefined

      const settingsStore = useSettingsStore()
      const sourceType = settingsStore.calendarSourceType

      if (sourceType === 'api') {
        const token = await refreshAccessToken()
        if (token) {
          // Reduce polling frequency to 10 seconds for better performance
          eventsInterval = setInterval(fetchEvents, 10000)
          await fetchEvents()
        }
      } else if (sourceType === 'ical') {
        // Reduce polling frequency to 10 seconds for better performance
        eventsInterval = setInterval(fetchEvents, 10000)
        await fetchEvents()
      }

      // Set up locale and initial time
      await setupLocale()
      await updateDateTime()

      // Initialize the time zone
      timezone.value = getTimeZone()

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
        clearInterval(tokenInterval)
        if (eventsInterval) clearInterval(eventsInterval)
      }

      // Store cleanup function in a way that can be accessed if needed
      ;(window as ExtendedWindow).__calendarCleanup = cleanup
    } catch (error) {
      console.error('Error initializing calendar:', error)
    }
  }

  return {
    now,
    weeklyViewTime,
    events,
    currentTime,
    locale,
    currentTokenRef,
    isInitialized,
    currentDayOfWeek,
    currentDate,
    currentMonthName,
    currentYear,
    updateDateTime,
    refreshAccessToken,
    fetchEvents,
    setupLocale,
    initialize,
    timezone,
  }
})
