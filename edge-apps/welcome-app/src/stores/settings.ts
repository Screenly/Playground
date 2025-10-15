import { ref } from 'vue'
import tzlookup from '@photostructure/tz-lookup'

export interface WelcomeSettings {
  welcome_heading?: string
  welcome_message?: string
  theme?: 'light' | 'dark'
  override_locale?: string
  override_timezone?: string
  sentry_dsn?: string
}

export const useSettingsStore = () => {
  const currentTimezone = ref('UTC')
  const currentLocale = ref('en')
  const settings = ref<WelcomeSettings>({})

  const init = () => {
    if (typeof screenly !== 'undefined' && screenly.settings) {
      settings.value = screenly.settings as WelcomeSettings
    }
  }

  const initTimezone = (latitude: number, longitude: number) => {
    const overrideTimezone = settings.value.override_timezone

    if (overrideTimezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: overrideTimezone })
        currentTimezone.value = overrideTimezone
        return
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.warn(`Invalid timezone: ${overrideTimezone}. Using fallback.`)
      }
    }

    currentTimezone.value = tzlookup(latitude, longitude)
  }

  const initLocale = () => {
    const overrideLocale = settings.value.override_locale

    if (overrideLocale) {
      try {
        new Intl.DateTimeFormat(overrideLocale)
        currentLocale.value = overrideLocale
        return
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.warn(`Invalid locale: ${overrideLocale}. Using fallback.`)
      }
    }

    const defaultLocale = navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language || 'en'

    currentLocale.value = defaultLocale || 'en'
  }

  return {
    currentTimezone,
    currentLocale,
    settings,
    init,
    initTimezone,
    initLocale,
  }
}
