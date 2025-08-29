<script setup lang="ts">
interface Props {
  value: string
}

defineProps<Props>()
</script>

<template>
  <div class="primary-card message-head">
    <span class="message-head-content">
      {{ value }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.message-head-content {
  font-size: 14rem;
  padding: 10rem;
  font-weight: bold;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 4;
  height: calc(1.15em * 5);
  overflow: hidden;

  // Responsive font sizing to match legacy app
  @media screen and (max-width: 1920px) and (orientation: landscape) {
    font-size: 7rem;
    padding: 5rem;
  }

  @media screen and (max-width: 1680px) and (orientation: landscape) {
    font-size: 6rem;
    padding: 4rem;
  }

  @media screen and (max-width: 1600px) and (orientation: landscape) {
    font-size: 5.5rem;
  }

  @media screen and (max-width: 1366px) and (orientation: landscape) {
    font-size: 5rem;
  }

  @media screen and (max-width: 1280px) and (orientation: landscape) {
    font-size: 4.5rem;
    padding: 3rem;
    -webkit-line-clamp: 4;
    height: calc(1.15em * 5);
  }

  @media screen and (max-width: 1080px) and (orientation: landscape) {
    font-size: 4.5rem;
    padding: 6rem;
  }

  @media screen and (max-width: 1024px) and (orientation: landscape) {
    font-size: 3.2rem;
    padding: 3rem;
  }

  @media screen and (max-width: 800px) and (orientation: landscape) {
    font-size: 3rem;
    padding: 2.5rem;
    -webkit-line-clamp: 4;
    height: calc(1.2em * 5);
  }

  // Portrait responsive sizes
  @media screen and (max-width: 2160px) and (orientation: portrait) {
    -webkit-line-clamp: 6;
    height: calc(1.15em * 7);
  }

  @media screen and (max-width: 1080px) and (orientation: portrait) {
    font-size: 7rem;
    padding: 5rem;
  }

  @media screen and (max-width: 720px) and (orientation: portrait) {
    font-size: 4.5rem;
    padding: 4rem;
    -webkit-line-clamp: 6;
    height: calc(1.17em * 7);
  }

  @media screen and (max-width: 480px) and (orientation: portrait) {
    font-size: 3.5rem;
    padding: 2rem;
    -webkit-line-clamp: 5;
    height: calc(1.17em * 6);
  }
}

.message-head {
  align-items: flex-start;
  justify-content: normal;
}
</style>
