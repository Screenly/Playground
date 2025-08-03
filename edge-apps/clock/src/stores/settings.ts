import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'

const settingsStoreSetup = () => {
  const settings = screenly.settings
  const overrideLocale: Ref<string> = ref('')
  const overrideTimezone: Ref<string> = ref('')
  const tagManagerId: Ref<string> = ref('')
  const enableAnalytics: Ref<boolean> = ref(false)

  const init = () => {
    overrideLocale.value = (settings.override_locale as string) ?? ''
    tagManagerId.value = (settings.tag_manager_id as string) ?? ''
    overrideTimezone.value = (settings.override_timezone as string) ?? ''
    enableAnalytics.value =
      (JSON.parse(settings.enable_analytics as string) as boolean) ?? false
  }

  return {
    overrideLocale,
    overrideTimezone,
    tagManagerId,
    enableAnalytics,
    init,
  }
}

export const useSettingsStore = defineStore('settings', settingsStoreSetup)

export type SettingsStore = ReturnType<typeof settingsStoreSetup>
