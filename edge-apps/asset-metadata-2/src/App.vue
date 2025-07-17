<script setup lang="ts">
import { onMounted } from 'vue'
import { useScreenlyMetadataStore } from './stores/root-store'

const screenlyMetadataStore = useScreenlyMetadataStore()

onMounted(() => {
  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container main-container-grid">
    <div class="primary-card host-name-card">
      <div class="icon-card">
        <object
          id="name-icon"
          type="image/svg+xml"
          data="static/images/icons/name-icon.svg"
          class="icon-card-icon"
          alt="icon"
        ></object>
        <span class="icon-card-text head-text">Host Name</span>
      </div>
      <span class="icon-card-text host-name-text">
        {{ screenlyMetadataStore.hostname }}
      </span>
    </div>
    <div class="primary-card screen-name-card">
      <div class="icon-card">
        <object
          id="name-icon"
          type="image/svg+xml"
          data="./static/images/icons/name-icon.svg"
          class="icon-card-icon"
          alt="icon"
        ></object>
        <span class="icon-card-text head-text">Name</span>
      </div>
      <span class="icon-card-text screen-name-text">
        {{ screenlyMetadataStore.screenName }}
      </span>
    </div>
    <div class="secondary-card hardware-name-card">
      <div class="icon-card">
        <object
          id="hardware-icon"
          type="image/svg+xml"
          data="./static/images/icons/hardware-icon.svg"
          class="icon-card-icon"
          alt="icon"
        ></object>
        <span class="icon-card-text head-text">Hardware</span>
      </div>
      <span class="icon-card-text hardware-name-text">
        {{ screenlyMetadataStore.hardware }}
      </span>
    </div>
    <div class="secondary-card brand-logo-card">
      <img id="brand-logo" src="./assets/images/screenly.svg" class="brand-logo" alt="Brand Logo" />
      <span class="info-text">Powered by Screenly</span>
    </div>
    <div class="secondary-card version-name-card">
      <div class="icon-card">
        <object
          id="version-icon"
          type="image/svg+xml"
          data="./static/images/icons/version-icon.svg"
          class="icon-card-icon"
          alt="icon"
        ></object>
        <span class="icon-card-text head-text">Version</span>
      </div>
      <span class="icon-card-text version-name-text">
        {{ screenlyMetadataStore.screenlyVersion }}
      </span>
    </div>
    <div class="secondary-card coordinates-card">
      <div class="icon-card">
        <object
          id="coordinates-icon"
          type="image/svg+xml"
          data="./static/images/icons/coordinates-icon.svg"
          class="icon-card-icon"
          alt="icon"
        ></object>
        <span class="icon-card-text head-text">Coordinates</span>
      </div>
      <span class="icon-card-text coordinates-name-text">
        {{ screenlyMetadataStore.formattedCoordinates }}
      </span>
    </div>
    <div class="secondary-card labels-name-card">
      <div class="icon-card">
        <object
          id="version-icon"
          type="image/svg+xml"
          data="./static/images/icons/version-icon.svg"
          class="icon-card-icon"
          alt="icon"
        ></object>
        <span class="icon-card-text head-text">Labels</span>
      </div>
      <div class="label-chip-container">
        <div class="label-chip" v-for="tag in screenlyMetadataStore.tags" :key="tag">
          {{ tag }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
