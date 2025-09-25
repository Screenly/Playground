<script setup lang="ts">
import { onBeforeMount, onMounted, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { PrimaryCard, AnalogClock, BrandLogoCard } from 'blueprint/components'

import { useGithubApiStore } from '@/stores/github-api'
import { useSettingsStore } from '@/stores/settings'

import screenlyLogo from 'blueprint/assets/images/screenly.svg'

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const baseSettingsStore = useBaseSettingsStore()
const githubApiStore = useGithubApiStore()
const settingsStore = useSettingsStore()

const { primaryThemeColor, brandLogoUrl } = storeToRefs(
  baseSettingsStore,
) as unknown as {
  primaryThemeColor: Ref<string>
  brandLogoUrl: Ref<string>
}

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(async () => {
  settingsStore.init()
  await githubApiStore.init()

  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container">
    <div class="secondary-container">
      <div class="row-container">
        <div
          class="secondary-card"
          :style="{
            backgroundColor: primaryThemeColor,
          }"
        >
          <AnalogClock />
        </div>
        <div class="secondary-card">
          <BrandLogoCard :logo-src="brandLogoUrl || screenlyLogo" />
        </div>
      </div>
    </div>

    <PrimaryCard>
      <h1>{{ githubApiStore.username }}</h1>
    </PrimaryCard>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/analog-clock-overrides.scss' as *;
@use '@/assets/brand-logo-card-overrides.scss' as *;

.primary-card {
  justify-content: start;
  align-items: start;
}

.row-container {
  @media screen and (orientation: portrait) {
    flex-direction: row;
    height: 100%;
  }

  @media screen and (orientation: landscape) {
    flex-direction: column;
    height: 100%;
  }
}

.secondary-card {
  @media screen and (orientation: portrait) {
    width: 50%;
  }

  @media screen and (orientation: landscape) {
    width: 100%;
    height: 50%;
  }
}
</style>
