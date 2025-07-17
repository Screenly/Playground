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
      <object
        v-if="icon"
        :id="`${title?.toLowerCase().replace(/\s/g, '-')}-icon`"
        type="image/svg+xml"
        :data="icon"
        class="icon-card-icon"
        alt="icon"
      ></object>
      <span v-if="title" class="icon-card-text head-text">{{ title }}</span>
    </div>
    <span v-if="value" class="icon-card-text">{{ value }}</span>
    <slot />
  </div>
</template>

<style scoped></style>
