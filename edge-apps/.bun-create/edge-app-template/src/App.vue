<script setup lang="ts">
import { onMounted } from 'vue'
import { useRootStore } from './stores/root-store'

const rootStore = useRootStore()
const {
  coordinates,
  hostname,
  hardware,
  location,
  screenly_version: screenlyVersion,
  screen_name: screenName,
  tags,
} = screenly.metadata

onMounted(() => {
  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="container">
    <h1
      :style="{
        marginBottom: '1rem',
      }"
    >
      {{ rootStore.message }}
    </h1>
    <p><strong>Coordinates:</strong> {{ coordinates.join(', ') }}</p>
    <p><strong>Hostname:</strong> {{ hostname }}</p>
    <p><strong>Hardware:</strong> {{ hardware }}</p>
    <p><strong>Location:</strong> {{ location }}</p>
    <p><strong>Screenly Version:</strong> {{ screenlyVersion }}</p>
    <p><strong>Screen Name:</strong> {{ screenName }}</p>
    <p><strong>Tags:</strong> {{ tags.join(', ') }}</p>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  gap: 0.75rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
