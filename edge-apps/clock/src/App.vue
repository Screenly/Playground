<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { AnalogClock } from 'blueprint/components'
import { DigitalTime, DateDisplay, InfoCard } from '@/components'

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const baseSettingsStore = useBaseSettingsStore()

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(() => {
  // Set theme colors
  const primaryColor =
    !screenly.settings.screenly_color_accent ||
    screenly.settings.screenly_color_accent.toLowerCase() === '#ffffff'
      ? '#972eff'
      : screenly.settings.screenly_color_accent
  const secondaryColor =
    !screenly.settings.screenly_color_light ||
    screenly.settings.screenly_color_light.toLowerCase() === '#ffffff'
      ? '#adafbe'
      : screenly.settings.screenly_color_light
  const tertiaryColor = '#FFFFFF'
  const backgroundColor = '#C9CDD0'

  document.documentElement.style.setProperty(
    '--theme-color-primary',
    primaryColor,
  )
  document.documentElement.style.setProperty(
    '--theme-color-secondary',
    secondaryColor,
  )
  document.documentElement.style.setProperty(
    '--theme-color-tertiary',
    tertiaryColor,
  )
  document.documentElement.style.setProperty(
    '--theme-color-background',
    backgroundColor,
  )

  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container">
    <div class="primary-card">
      <AnalogClock />
    </div>
    <div class="secondary-container">
      <div class="row-container">
        <div class="secondary-card">
          <DigitalTime />
        </div>
      </div>
      <div class="row-container">
        <div class="secondary-card info-card">
          <InfoCard />
        </div>
        <div class="secondary-card">
          <DateDisplay />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Common Styles */
.main-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  height: 100%;
  padding: 2rem;
  background-color: var(--theme-color-background);
}

.primary-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 100%;
  border-radius: 3rem;
  gap: 2rem;
  line-height: 1;
  background-color: var(--theme-color-primary);
  color: var(--theme-color-tertiary);
}

/* Secondary Container */
.secondary-container {
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: space-between;
}

.row-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 2rem;
  height: 50%;
}

.secondary-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: auto;
  gap: 2rem;
  border-radius: 3.481rem;
  background-color: var(--theme-color-tertiary);
}

/* Media Query */
@media (orientation: portrait) {
  .main-container {
    flex-direction: column;
  }

  .primary-card {
    width: 100%;
    height: 50%;
  }

  .secondary-container {
    width: 100%;
    height: 50%;
  }
}

@media screen and (min-width: 480px) and (orientation: portrait) {
  .main-container {
    gap: 1rem;
    padding: 1rem;
  }

  .primary-card {
    border-radius: 2rem;
  }

  .secondary-container {
    gap: 1rem;
  }

  .row-container {
    gap: 1rem;
  }

  .secondary-card {
    border-radius: 2rem;
  }
}

@media screen and (min-width: 720px) and (orientation: portrait) {
  .main-container {
    gap: 1rem;
    padding: 1rem;
  }

  .primary-card {
    border-radius: 2rem;
  }

  .secondary-container {
    gap: 1rem;
  }

  .row-container {
    gap: 1rem;
  }

  .secondary-card {
    border-radius: 2rem;
  }
}

@media screen and (min-width: 800px) and (orientation: landscape) {
  .main-container {
    gap: 1rem;
    padding: 1rem;
  }

  .primary-card {
    border-radius: 2rem;
  }

  .secondary-container {
    gap: 1rem;
  }

  .row-container {
    gap: 1rem;
  }

  .secondary-card {
    border-radius: 2rem;
  }
}

@media screen and (min-width: 1080px) and (orientation: portrait) {
  .main-container {
    gap: 3rem;
    padding: 3rem;
  }

  .primary-card {
    border-radius: 4rem;
  }

  .secondary-container {
    gap: 3rem;
  }

  .row-container {
    gap: 3rem;
  }

  .secondary-card {
    border-radius: 4rem;
  }
}

@media screen and (min-width: 1280px) and (orientation: landscape) {
  .main-container {
    gap: 2rem;
    padding: 2rem;
  }

  .primary-card {
    border-radius: 2rem;
  }

  .secondary-container {
    gap: 2rem;
  }

  .row-container {
    gap: 2rem;
  }

  .secondary-card {
    border-radius: 2.5rem;
  }
}

@media screen and (min-width: 1920px) and (orientation: landscape) {
  .main-container {
    gap: 2.5rem;
    padding: 2.5rem;
  }

  .primary-card {
    border-radius: 3.5rem;
  }

  .secondary-container {
    gap: 2.5rem;
  }

  .row-container {
    gap: 2.4rem;
  }

  .secondary-card {
    border-radius: 3.5rem;
  }
}

@media screen and (min-width: 2160px) and (orientation: portrait) {
  .main-container {
    gap: 5rem;
    padding: 5rem;
  }

  .primary-card {
    border-radius: 8rem;
  }

  .secondary-container {
    gap: 5rem;
  }

  .row-container {
    gap: 6rem;
  }

  .secondary-card {
    border-radius: 8rem;
  }
}

@media screen and (min-width: 3840px) and (orientation: landscape) {
  .main-container {
    gap: 5rem;
    padding: 5rem;
  }

  .primary-card {
    border-radius: 8rem;
  }

  .secondary-container {
    gap: 5rem;
  }

  .row-container {
    gap: 6rem;
  }

  .secondary-card {
    border-radius: 8rem;
  }
}

@media screen and (min-width: 4096px) and (orientation: landscape) {
  .main-container {
    gap: 5rem;
    padding: 5rem;
  }

  .primary-card {
    border-radius: 7rem;
  }

  .secondary-container {
    gap: 5rem;
  }

  .row-container {
    gap: 6rem;
  }

  .secondary-card {
    border-radius: 7rem;
  }
}
</style>
