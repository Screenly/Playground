<script setup lang="ts">
import { onBeforeMount, onMounted, ref, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'
import { settingsStoreSetup } from 'blueprint/stores/settings-store'
import { PrimaryCard } from 'blueprint/components'

const useScreenlyMetadataStore = defineStore('metadata', metadataStoreSetup)
const useSettingsStore = defineStore('settingsStore', settingsStoreSetup)

const screenlyMetadataStore = useScreenlyMetadataStore()
const settingsStore = useSettingsStore()

const { hostname, screenName, hardware, coordinates, location } = storeToRefs(
  screenlyMetadataStore,
) as unknown as {
  hostname: Ref<string>
  screenName: Ref<string>
  hardware: Ref<string>
  coordinates: Ref<[number, number]>
  location: Ref<string>
}

const secretWord = ref(screenly.settings.secret_word)
const greeting = ref(screenly.settings.greeting)

onBeforeMount(async () => {
  settingsStore.setupTheme()
  await settingsStore.setupBrandingLogo()
})

onMounted(() => {
  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container main-container-grid">
    <PrimaryCard>
      <h1 class="main-header">
        <span id="greeting">
          <template v-if="greeting"> Greetings, {{ greeting }}! </template>
          <template v-else> Greetings! </template>
        </span>
      </h1>

      <p>
        You secret word is
        <template v-if="secretWord">
          <strong>{{ secretWord }}</strong
          >.
        </template>
        <template v-else> not set. </template>
      </p>

      <p>
        I'm <strong id="screen-name">{{ screenName }}</strong
        >. Assuming you've pinned me in the right location,<br />I'm located in
        <strong id="screen-location">{{ location }}</strong> (more precisely at
        latitude <strong id="screen-lat">{{ coordinates[0] }}</strong
        >&#176; and longitude
        <strong id="screen-lng">{{ coordinates[1] }}</strong
        >&#176;).
      </p>

      <p>
        My Screenly ID is
        <span id="screen-hostname">
          <strong>{{ hostname }}</strong>
        </span>
        (which conveniently is also my hostname), and I'm running on a
        <span id="screen-hardware">
          <strong>{{ hardware || 'virtual screen' }}</strong> </span
        >.
      </p>
    </PrimaryCard>
  </div>
</template>

<style scoped lang="scss">
@mixin content-text($multiplier: 1) {
  p {
    font-size: 1rem * $multiplier;
    margin-bottom: 0.75rem * $multiplier;
  }
}

@mixin header-text($multiplier: 1) {
  h1 {
    font-size: 2.5rem * $multiplier;
    margin-bottom: 1.75rem * $multiplier;
  }
}

@media (min-width: 800px) and (min-height: 480px) and (orientation: landscape) {
  @include header-text(1);
  @include content-text(1);
}

@media (min-width: 1280px) and (min-height: 720px) and (orientation: landscape) {
  @include header-text(1.5);
  @include content-text(1.5);
}

@media (min-width: 1920px) and (min-height: 1080px) and (orientation: landscape) {
  @include header-text(2.25);
  @include content-text(2.25);
}

@media (min-width: 3840px) and (orientation: landscape) {
  @include header-text(4.5);
  @include content-text(4.5);
}
</style>
