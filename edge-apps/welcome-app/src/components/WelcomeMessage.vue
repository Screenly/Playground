<script setup lang="ts">
interface Props {
  heading?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  heading: 'Welcome',
  message: 'to the team'
})
</script>

<template>
  <div class="welcome-content">
    <span class="welcome-heading">{{ props.heading }}</span>
    <span class="welcome-message">{{ props.message }}</span>
  </div>
</template>

<style scoped lang="scss">
.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 3vw + 3vh, 1000rem);
}

.welcome-heading {
  font-size: clamp(1rem, 6vw + 6vh, 1000rem);
  margin-bottom: clamp(0.5rem, 1vw + 1vh, 1000rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 100%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  height: calc(1.10em * 1);
  overflow: hidden;
  color: var(--theme-color-primary);
}

.welcome-message {
  font-size: clamp(1rem, 5vw + 5vh, 1000rem);
  font-weight: 400;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  height: calc(1.10em * 1);
  overflow: hidden;
  color: var(--theme-color-primary);
}

@media (orientation: portrait) {
  .welcome-heading {
    font-size: clamp(1rem, 5vw + 5vh, 1000rem);
  }

  .welcome-message {
    font-size: clamp(1rem, 3vw + 3vh, 1000rem);
  }

  .welcome-content {
    gap: clamp(1rem, 1vw + 2vh, 1000rem);
  }
}
</style>
