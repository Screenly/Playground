import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import tzlookup from '@photostructure/tz-lookup'

export interface WelcomeSettings {
  welcome_heading?: string
  welcome_message?: string
  theme?: 'light' | 'dark'
  override_locale?: string
  override_timezone?: string
  sentry_dsn?: string
}

const settingsStoreSetup = () => {
  const settings = screenly.settings
  const overrideLocale: Ref<string> = ref('')
  const overrideTimezone: Ref<string> = ref('')
  const currentTimezone: Ref<string> = ref('UTC')
  const currentLocale: Ref<string> = ref('en')
  const welcomeHeading: Ref<string> = ref('Welcome')
  const welcomeMessage: Ref<string> = ref('to the team')

  const init = () => {
    overrideLocale.value = (settings.override_locale as string) ?? ''
    overrideTimezone.value = (settings.override_timezone as string) ?? ''
    welcomeHeading.value = (settings.welcome_heading as string) ?? 'Welcome'
    welcomeMessage.value = (settings.welcome_message as string) ?? 'to the team'
  }

  const initTimezone = (latitude: number, longitude: number) => {
    if (overrideTimezone.value) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: overrideTimezone.value })
        currentTimezone.value = overrideTimezone.value
        return
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.warn(`Invalid timezone: ${overrideTimezone.value}. Using fallback.`)
      }
    }

    currentTimezone.value = tzlookup(latitude, longitude)
  }

  const initLocale = () => {
    const defaultLocale =
      (navigator?.languages?.length
        ? navigator.languages[0]
        : navigator.language) || 'en'

    if (overrideLocale.value) {
      currentLocale.value = overrideLocale.value
      return
    }

    currentLocale.value = defaultLocale
  }

  return {
    overrideLocale,
    overrideTimezone,
    currentTimezone,
    currentLocale,
    welcomeHeading,
    welcomeMessage,
    init,
    initTimezone,
    initLocale,
  }
}

export const useSettingsStore = defineStore('settings', settingsStoreSetup)

export type SettingsStore = ReturnType<typeof settingsStoreSetup>
