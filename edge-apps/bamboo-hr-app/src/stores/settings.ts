import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import moment from 'moment-timezone'
import tzlookup from '@photostructure/tz-lookup'

const settingsStoreSetup = () => {
  const settings = screenly.settings

  // BambooHR settings
  const apiKey: Ref<string> = ref('')
  const subdomain: Ref<string> = ref('')

  // Analytics settings
  const enableAnalytics: Ref<boolean> = ref(true)
  const tagManagerId: Ref<string> = ref('')
  const sentryDsn: Ref<string> = ref('')

  // Localization settings
  const overrideLocale: Ref<string> = ref('')
  const overrideTimezone: Ref<string> = ref('')
  const currentLocale: Ref<string> = ref('')
  const currentTimezone: Ref<string> = ref('')

  const init = () => {
    // BambooHR settings
    subdomain.value = (settings.subdomain as string) ?? ''
    apiKey.value = (settings.api_key as string) ?? ''

    // Analytics settings
    enableAnalytics.value =
      (JSON.parse(settings.enable_analytics as string) as boolean) ?? true
    tagManagerId.value = (settings.tag_manager_id as string) ?? ''
    sentryDsn.value = (settings.sentry_dsn as string) ?? ''

    // Localization settings
    overrideLocale.value = (settings.override_locale as string) ?? ''
    overrideTimezone.value = (settings.override_timezone as string) ?? ''
  }

  const hasValidApiKey = () => {
    return apiKey.value && apiKey.value.trim() !== ''
  }

  const isAnalyticsEnabled = () => {
    return enableAnalytics.value
  }

  const hasSentryConfig = () => {
    return sentryDsn.value && sentryDsn.value.trim() !== ''
  }

  const hasTagManagerConfig = () => {
    return tagManagerId.value && tagManagerId.value.trim() !== ''
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
    // State
    apiKey,
    subdomain,
    enableAnalytics,
    tagManagerId,
    sentryDsn,
    overrideLocale,
    overrideTimezone,
    currentLocale,
    currentTimezone,

    // Methods
    init,
    hasValidApiKey,
    isAnalyticsEnabled,
    hasSentryConfig,
    hasTagManagerConfig,
    initLocale,
    initTimezone,
  }
}

export const useSettingsStore = defineStore('settings', settingsStoreSetup)

export type SettingsStore = ReturnType<typeof settingsStoreSetup>
