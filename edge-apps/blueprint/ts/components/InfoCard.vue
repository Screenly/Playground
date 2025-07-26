<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  value?: string
}>()
</script>

<template>
  <div class="primary-card">
    <div v-if="icon || title" class="icon-card">
      <slot name="icon" />
    </div>
    <slot>
      <span v-if="value" class="icon-card-text">{{ value }}</span>
      <span v-else class="icon-card-text">N/A</span>
    </slot>
  </div>
</template>

<style scoped></style>
