import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import tzlookup from '@photostructure/tz-lookup'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'

const settingsStoreSetup = () => {
  const settings = screenly.settings
  const metadataStore = defineStore('metadataStore', metadataStoreSetup)()
  const overrideLocale: Ref<string> = ref('')
  const overrideTimezone: Ref<string> = ref('')
  const currentLocale: Ref<string> = ref('')
  const currentTimezone: Ref<string> = ref('')

  const init = () => {
    overrideLocale.value = (settings.override_locale as string) ?? ''
    overrideTimezone.value = (settings.override_timezone as string) ?? ''

    initLocale()

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
      currentTimezone.value = overrideTimezone.value
      return
    }

    currentTimezone.value = tzlookup(latitude, longitude)
  }

  return {
    overrideLocale,
    overrideTimezone,
    currentLocale,
    currentTimezone,
    initLocale,
    initTimezone,
    init,
  }
}

export const useSettingsStore = defineStore('settings', settingsStoreSetup)

export type SettingsStore = ReturnType<typeof settingsStoreSetup>
