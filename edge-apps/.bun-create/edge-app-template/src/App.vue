<script setup lang="ts">
import { onBeforeMount, onMounted, ref, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'
import { settingsStoreSetup } from 'blueprint/stores/settings-store'

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

const secretWord = ref(screenly.settings.secretWord)
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
    <div class="primary-container">
      <div class="primary-card">
        <div class="px-4 py-5 my-5 text-center">
          <h1 class="main-header display-5 fw-bold">
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
            I'm <span id="screen-name">{{ screenName }}</span
            >. Assuming you've pinned me in the right location,<br />I'm located
            in <span id="screen-location">{{ location }}</span> (more precisely
            at latitude <span id="screen-lat">{{ coordinates[0] }}</span
            >&#176; and longitude
            <span id="screen-lng">{{ coordinates[1] }}</span
            >&#176;).
          </p>

          <p>
            My Screenly ID is
            <span id="screen-hostname">
              <strong>{{ hostname }}</strong>
            </span>
            (which conveniently is also my hostname), and I'm running on a
            <span id="screen-hardware">
              <strong>{{ hardware }}</strong> </span
            >.
          </p>
        </div>
      </div>
    </div>
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

@mixin primary-card-padding($multiplier: 1) {
  padding: 5rem * $multiplier;
}

.primary-container {
  height: 100%;
  width: 100%;
}

.primary-card {
  height: 100%;
  width: 100%;

  @media (min-width: 800px) and (min-height: 480px) and (orientation: landscape) {
    @include header-text(1);
    @include content-text(1);
    @include primary-card-padding(1);
  }

  @media (min-width: 1280px) and (min-height: 720px) and (orientation: landscape) {
    @include header-text(1.5);
    @include content-text(1.5);
    @include primary-card-padding(1.5);
  }

  @media (min-width: 1920px) and (min-height: 1080px) and (orientation: landscape) {
    @include header-text(2.25);
    @include content-text(2.25);
    @include primary-card-padding(2.25);
  }

  @media (min-width: 3840px) and (orientation: landscape) {
    @include header-text(4.5);
    @include content-text(4.5);
    @include primary-card-padding(4.5);
  }
}
</style>
