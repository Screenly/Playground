import { defineStore } from 'pinia'
import { settingsStoreSetup } from 'screenly-playground/edge-apps/stores'

export const useSettingsStore = defineStore('settings', settingsStoreSetup)
