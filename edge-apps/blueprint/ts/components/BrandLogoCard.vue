<script setup lang="ts">
defineProps<{
  logoSrc: string
}>()
</script>

<template>
  <div class="primary-card brand-logo-card">
    <img id="brand-logo" :src="logoSrc" class="brand-logo" alt="Brand Logo" />
    <span class="info-text">Powered by Screenly (Test)</span>
  </div>
</template>

<style scoped lang="scss"></style>
