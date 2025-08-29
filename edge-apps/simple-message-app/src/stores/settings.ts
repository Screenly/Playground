import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import moment from 'moment-timezone' // TODO: Use `dayjs` instead.
import tzlookup from '@photostructure/tz-lookup'

const settingsStoreSetup = () => {
  const settings = screenly.settings
  const overrideLocale: Ref<string> = ref('')
  const overrideTimezone: Ref<string> = ref('')
  const tagManagerId: Ref<string> = ref('')
  const enableAnalytics: Ref<boolean> = ref(false)
  const currentLocale: Ref<string> = ref('')
  const currentTimezone: Ref<string> = ref('')
  const messageHeader: Ref<string> = ref('')
  const messageBody: Ref<string> = ref('')

  const initMessage = () => {
    messageHeader.value = settings.message_header as string
    messageBody.value = settings.message_body as string
  }

  const init = () => {
    overrideLocale.value = (settings.override_locale as string) ?? ''
    tagManagerId.value = (settings.tag_manager_id as string) ?? ''
    overrideTimezone.value = (settings.override_timezone as string) ?? ''
    enableAnalytics.value =
      (JSON.parse(settings.enable_analytics as string) as boolean) ?? false

    initMessage()
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
    messageHeader,
    messageBody,
    initLocale,
    initTimezone,
    init,
  }
}

export const useSettingsStore = defineStore('settings', settingsStoreSetup)

export type SettingsStore = ReturnType<typeof settingsStoreSetup>
