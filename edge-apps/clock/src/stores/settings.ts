import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import moment from 'moment-timezone'
import tzlookup from '@photostructure/tz-lookup'
import { getNearestCity } from 'offline-geocode-city'
import clm from 'country-locale-map'

const settingsStoreSetup = () => {
  const settings = screenly.settings
  const overrideLocale: Ref<string> = ref('')
  const overrideTimezone: Ref<string> = ref('')
  const tagManagerId: Ref<string> = ref('')
  const enableAnalytics: Ref<boolean> = ref(false)
  const currentLocale: Ref<string> = ref('')
  const currentTimezone: Ref<string> = ref('')

  const init = () => {
    overrideLocale.value = (settings.override_locale as string) ?? ''
    tagManagerId.value = (settings.tag_manager_id as string) ?? ''
    overrideTimezone.value = (settings.override_timezone as string) ?? ''
    enableAnalytics.value =
      (JSON.parse(settings.enable_analytics as string) as boolean) ?? false
  }

  const initLocale = (latitude: number, longitude: number) => {
    const defaultLocale = navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language || 'en'

    if (overrideLocale.value) {
      if (moment.locales().includes(overrideLocale.value)) {
        currentLocale.value = overrideLocale.value
        return
      }
    }

    const data = getNearestCity(latitude, longitude)
    const countryCode = data.countryIso2.toUpperCase()

    currentLocale.value = clm.getLocaleByAlpha2(countryCode) || defaultLocale
  }

  const initTimezone = (latitude: number, longitude: number) => {
    if (overrideTimezone.value) {
      if (moment.tz.names().includes(overrideTimezone.value)) {
        currentTimezone.value = overrideTimezone.value
        return
      }
    }

    currentTimezone.value = tzlookup(latitude, longitude)
  }

  return {
    overrideLocale,
    overrideTimezone,
    tagManagerId,
    enableAnalytics,
    currentLocale,
    currentTimezone,
    initLocale,
    initTimezone,
    init,
  }
}

export const useSettingsStore = defineStore('settings', settingsStoreSetup)

export type SettingsStore = ReturnType<typeof settingsStoreSetup>
