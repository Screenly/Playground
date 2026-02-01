import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import tzlookup from '@photostructure/tz-lookup'
import { metadataStoreSetup } from '@screenly/edge-apps/vue/stores'

const settingsStoreSetup = () => {
  const settings = screenly.settings
  const metadataStore = defineStore('metadataStore', metadataStoreSetup)()
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
    initLocale()

    // Retrieve coordinates from metadata store
    const coordinates = metadataStore.coordinates
    if (coordinates && coordinates.length === 2) {
      const [latitude, longitude] = coordinates
      initTimezone(latitude, longitude)
    }
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
      // TODO: Add a check if the timezone is valid.
      currentTimezone.value = overrideTimezone.value
      return
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
