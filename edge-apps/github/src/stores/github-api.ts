import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useSettingsStore } from '@/stores/settings'

const GITHUB_API_URL = 'https://api.github.com'

const githubApiStoreSetup = () => {
  const settingsStore = useSettingsStore()
  const { githubToken } = storeToRefs(settingsStore)

  const username = ref<string>('')
  const init = async () => {
    if (githubToken.value) {
      const response = await fetch(`${GITHUB_API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${githubToken.value}`,
        },
      })
      const data = await response.json()
      username.value = data.login
    }
  }

  return {
    username,
    init,
  }
}

export const useGithubApiStore = defineStore('github-api', githubApiStoreSetup)
