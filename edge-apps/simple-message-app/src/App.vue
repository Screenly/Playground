<script setup lang="ts">
import { onBeforeMount, onMounted, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { AnalogClock, BrandLogoCard, DateDisplay } from 'blueprint/components'
import { useSettingsStore } from '@/stores/settings'
import MessageHead from '@/components/MessageHead.vue'
import MessageBody from '@/components/MessageBody.vue'

import screenlyLogo from 'blueprint/assets/images/screenly.svg'

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const baseSettingsStore = useBaseSettingsStore()
const settingsStore = useSettingsStore()

const { brandLogoUrl } = storeToRefs(baseSettingsStore) as unknown as {
  brandLogoUrl: Ref<string>
}

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(() => {
  settingsStore.init()

  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container main-container-grid">
    <div class="primary-container">
      <MessageHead :value="settingsStore.messageHeader" />
    </div>

    <div class="secondary-container">
      <MessageBody :value="settingsStore.messageBody" />
    </div>
    <div class="row-container">
      <div class="secondary-card">
        <BrandLogoCard
          :logo-src="brandLogoUrl || screenlyLogo"
          class="info-card"
        />
      </div>

      <div class="secondary-card">
        <DateDisplay :timezone="settingsStore.currentTimezone" />
      </div>
      <div class="secondary-card">
        <div>
          <AnalogClock
            :style="{
              backgroundColor: '#EFEFEF',
            }"
            :timezone="settingsStore.currentTimezone"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/analog-clock-overrides.scss' as *;
@use '@/assets/brand-logo-card-overrides.scss' as *;
@use '@/assets/border-radius-overrides.scss' as *;
@use '@/assets/date-display-overrides.scss' as *;
@use '@/assets/gap-overrides.scss' as *;

.main-container-grid {
  @media (orientation: landscape) {
    display: grid;
    grid-template-rows: 2fr 0.5fr 0.125fr 0.25fr 0.125fr 0.25fr 0.5fr;
    grid-template-columns: 3fr 0.25fr 0.5fr 0.5fr 0.5fr;
  }

  .primary-container {
    width: 100%;
    grid-area: 1 / 1 / 4 / 3;

    .primary-card {
      width: 100%;
      height: 100%;
    }
  }

  .secondary-container {
    width: 100%;
    background-color: #fff;
    grid-area: 1 / 3 / 8 / 6;
  }

  .row-container {
    height: 100%;
    grid-area: 4 / 1 / 8 / 3;

    .secondary-card {
      // Force equal width for all secondary cards inside the row container.
      min-width: 0;
    }
  }
}

@media (orientation: portrait) {
  .main-container-grid {
    display: flex;
    flex-direction: column;

    .row-container {
      width: 100%;
      height: 20%;
    }

    .primary-container {
      width: 100%;
      height: 50%;
    }

    .secondary-container {
      width: 100%;
      height: 30%;
    }
  }
}

@include brand-logo-card-overrides;
@include border-radius-overrides;
@include gap-overrides;
</style>
