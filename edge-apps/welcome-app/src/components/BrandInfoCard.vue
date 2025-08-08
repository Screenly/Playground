<script setup lang="ts">
interface Props {
  logoSrc?: string
  logoAlt?: string
  infoText?: string
}

const props = withDefaults(defineProps<Props>(), {
  logoSrc: '/src/assets/images/screenly.svg',
  logoAlt: 'Brand Logo',
  infoText: 'Powered by Screenly'
})
</script>

<template>
  <div class="brand-info-card">
    <img :src="props.logoSrc" :alt="props.logoAlt" class="brand-logo" />
    <span class="info-text">{{ props.infoText }}</span>
  </div>
</template>

<style scoped lang="scss">
.brand-info-card {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 2.5vw + 2.5vh, 1000rem) clamp(1rem, 3vw + 3vh, 1000rem);
}

.brand-logo {
  width: clamp(1rem, 6.3vw + 6.3vh, 1000rem);
  height: auto;
}

.info-text {
  font-size: clamp(0.8rem, 0.70vw + 0.70vh, 1000rem);
  color: var(--theme-color-primary);
  font-weight: 400;
}
</style>
