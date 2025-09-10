import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'

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
  const overrideLocale: Ref<string | null> = ref(null)
  const overrideTimezone: Ref<string | null> = ref(null)

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
    overrideLocale.value = (settings.override_locale as string) || null
    overrideTimezone.value = (settings.override_timezone as string) || null
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

  const getLocale = (): string => {
    return overrideLocale.value || navigator.language || 'en'
  }

  const getTimezone = (): string => {
    return (
      overrideTimezone.value || Intl.DateTimeFormat().resolvedOptions().timeZone
    )
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

    // Methods
    init,
    hasValidApiKey,
    isAnalyticsEnabled,
    hasSentryConfig,
    hasTagManagerConfig,
    getLocale,
    getTimezone,
  }
}

export const useSettingsStore = defineStore('settings', settingsStoreSetup)

export type SettingsStore = ReturnType<typeof settingsStoreSetup>
