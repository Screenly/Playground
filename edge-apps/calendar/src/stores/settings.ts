import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'

type CalendarMode = 'daily' | 'weekly' | 'monthly'

const settingsStoreSetup = () => {
  const settings = screenly.settings

  // Calendar settings
  const bypassCors: Ref<boolean> = ref(false)
  const calendarMode: Ref<CalendarMode> = ref('monthly')
  const icalUrl: Ref<string> = ref('')

  // Analytics settings
  const sentryDsn: Ref<string> = ref('')

  // Theme settings
  const theme: Ref<string> = ref('light')
  const overrideLocale: Ref<string | null> = ref(null)
  const overrideTimezone: Ref<string | null> = ref(null)

  const init = () => {
    // Calendar settings
    bypassCors.value =
      (JSON.parse(settings.bypass_cors as string) as boolean) ?? false
    calendarMode.value = (settings.calendar_mode as CalendarMode) ?? 'monthly'
    icalUrl.value = (settings.ical_url as string) ?? ''

    // Analytics settings
    sentryDsn.value = (settings.sentry_dsn as string) ?? ''

    // Theme settings
    theme.value = (settings.theme as string) ?? 'light'
    overrideLocale.value = (settings.override_locale as string) || null
    overrideTimezone.value = (settings.override_timezone as string) || null
  }

  const isMonthlyMode = () => {
    return calendarMode.value === 'monthly'
  }

  const isWeeklyMode = () => {
    return calendarMode.value === 'weekly'
  }

  const isDailyMode = () => {
    return calendarMode.value === 'daily'
  }

  const isLightTheme = () => {
    return theme.value === 'light'
  }

  const isDarkTheme = () => {
    return theme.value === 'dark'
  }

  const hasValidIcalUrl = () => {
    return icalUrl.value
  }

  return {
    // State
    bypassCors,
    calendarMode,
    icalUrl,
    sentryDsn,
    theme,

    // Methods
    init,
    isMonthlyMode,
    isWeeklyMode,
    isDailyMode,
    isLightTheme,
    isDarkTheme,
    hasValidIcalUrl,
    overrideTimezone,
    overrideLocale,
  }
}

export const useSettingsStore = defineStore('settings', settingsStoreSetup)

export type SettingsStore = ReturnType<typeof settingsStoreSetup>
