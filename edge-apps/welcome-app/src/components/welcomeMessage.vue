<script setup lang="ts">
interface Props {
  value: string
}

defineProps<Props>()
</script>

<template>
  <div class="welcome-message">
    {{ value }}
  </div>
</template>

<style scoped lang="scss">
.welcome-message {
  font-size: clamp(1rem, calc(4vw + 4vh), 1000rem);
  font-weight: 400;
  margin: 0 clamp(1rem, calc(2vw + 2vh), 1000rem) 0
    clamp(1rem, calc(3vw + 3vh), 1000rem);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  height: 3.1em;
  overflow: hidden;

  @media (orientation: portrait) {
    font-size: clamp(1rem, 3vw + 3vh, 1000rem);
    -webkit-line-clamp: 9;
    line-clamp: 9;
    height: 9.1em;
  }

  @media screen and (max-width: 2159px) and (orientation: portrait) {
    -webkit-line-clamp: 8;
    line-clamp: 8;
    height: 8.1em;
  }

  @media screen and (max-width: 480px) and (orientation: portrait) {
    -webkit-line-clamp: 7;
    line-clamp: 7;
    height: 7.1em;
  }

  @media screen and (max-width: 800px) and (orientation: landscape) {
    height: 3.09em;
  }
}
</style>
