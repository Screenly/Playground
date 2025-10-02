<script setup lang="ts">
interface Props {
  value: string
}

defineProps<Props>()
</script>

<template>
  <div class="welcome-heading">
    {{ value }}
  </div>
</template>

<style scoped lang="scss">
.welcome-heading {
  font-size: clamp(1rem, calc(5.5vw + 5.5vh), 1000rem);
  margin: clamp(1rem, calc(2.5vw + 2.5vh), 1000rem)
    clamp(1rem, calc(2vw + 2vh), 1000rem) 0
    clamp(1rem, calc(3vw + 3vh), 1000rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 100%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  height: 1.05em;
  overflow: hidden;

  @media (orientation: portrait) {
    font-size: clamp(1rem, 5vw + 5vh, 1000rem);
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
}
</style>
