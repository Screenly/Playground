import { ref } from 'vue'
import { defineStore } from 'pinia'

const settingsStoreSetup = () => {
  const settings = screenly.settings
  const githubToken = ref<string>('')

  const init = () => {
    githubToken.value = settings.github_token as string
  }

  return {
    githubToken,
    init,
  }
}

export const useSettingsStore = defineStore('settings', settingsStoreSetup)
