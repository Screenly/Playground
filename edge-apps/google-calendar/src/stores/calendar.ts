import { ref, computed } from 'vue'
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
} from '@/utils'
import {
  fetchCalendarEventsFromAPI,
  fetchCalendarEventsFromICal,
} from '@/events'
import { TOKEN_REFRESH_INTERVAL } from '@/constants'
import type { CalendarEvent, ViewMode } from '@/constants'

// Extend Window interface to include our custom property
interface ExtendedWindow extends Window {
  __calendarCleanup?: () => void
}

export const useCalendarStore = defineStore('calendar', () => {
  // State
  const now = ref(new Date())
  const weeklyViewTime = ref(new Date())
  const events = ref<CalendarEvent[]>([])
  const currentTime = ref('')
  const locale = ref('en-US')
  const currentTokenRef = ref('')
  const isInitialized = ref(false)

  // Getters
  const calendarMode = computed((): ViewMode => {
    return (screenly.settings.calendar_mode as ViewMode) || 'monthly'
  })

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
    const { calendar_source_type: sourceType } = screenly.settings

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

      // Set up intervals
      const timeInterval = setInterval(updateDateTime, 1000)
      const weeklyViewTimeInterval = setInterval(() => {
        weeklyViewTime.value = new Date()
      }, 60000)
      const tokenInterval = setInterval(
        refreshAccessToken,
        TOKEN_REFRESH_INTERVAL,
      )

      // Set up events fetching
      let eventsInterval: NodeJS.Timeout | undefined

      const { calendar_source_type: sourceType } = screenly.settings

      if (sourceType === 'api') {
        const token = await refreshAccessToken()
        if (token) {
          eventsInterval = setInterval(fetchEvents, 5000)
          await fetchEvents()
        }
      } else if (sourceType === 'ical') {
        eventsInterval = setInterval(fetchEvents, 5000)
        await fetchEvents()
      }

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
    // State
    now,
    weeklyViewTime,
    events,
    currentTime,
    locale,
    currentTokenRef,
    isInitialized,
    // Getters
    calendarMode,
    currentDayOfWeek,
    currentDate,
    currentMonthName,
    currentYear,
    // Actions
    updateDateTime,
    refreshAccessToken,
    fetchEvents,
    setupLocale,
    initialize,
  }
})
