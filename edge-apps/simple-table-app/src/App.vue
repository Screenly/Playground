<script setup lang="ts">
import { ref, computed, onBeforeMount, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { InfoCard } from 'blueprint/components'
import screenlyLogo from 'blueprint/assets/images/screenly.svg'
import TableDisplay from './components/TableDisplay.vue'
import { useSettingsStore } from '@/stores/settings'
import Papa from 'papaparse'

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const baseSettingsStore = useBaseSettingsStore()
const settingsStore = useSettingsStore()

const tableData = ref<string[][]>([])
const tableTitle = ref<string>('')

const brandLogoUrl = computed(() => {
  return baseSettingsStore.brandLogoUrl || screenlyLogo
})

const parseCsv = (text: string): string[][] => {
  const result = Papa.parse(text, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0]?.message}`)
  }

  return result.data as string[][]
}

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(async () => {
  settingsStore.init()

  if (typeof screenly !== 'undefined' && screenly.settings?.content) {
    try {
      tableData.value = parseCsv(screenly.settings.content as string)
      tableTitle.value = (screenly.settings.title as string) || ''
      screenly.signalReadyForRendering()
    } catch (error) {
      console.error('Failed to parse CSV:', error)
      screenly.signalReadyForRendering()
    }
  }
})
</script>

<template>
  <div class="main-container">
    <div class="primary-container">
      <InfoCard v-if="tableData.length > 0" class="table-card">
        <TableDisplay
          :data="tableData"
          :title="tableTitle"
          :timezone="settingsStore.currentTimezone"
          :locale="settingsStore.currentLocale"
          :brand-logo-url="brandLogoUrl"
        />
      </InfoCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.primary-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.table-card {
  flex: 1 1 0;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  justify-content: start;
  background-color: var(--theme-color-tertiary);
}
</style>
