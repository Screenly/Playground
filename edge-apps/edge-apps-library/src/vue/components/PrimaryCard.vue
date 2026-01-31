<template>
  <div class="primary-card">
    <div>
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
@mixin primary-card-padding($multiplier: 1) {
  padding: 5rem * $multiplier;
}

.primary-card {
  height: 100%;
  width: 100%;

  @media (min-width: 800px) and (min-height: 480px) and (orientation: landscape) {
    @include primary-card-padding(1);
  }

  @media (min-width: 1280px) and (min-height: 720px) and (orientation: landscape) {
    @include primary-card-padding(1.5);
  }

  @media (min-width: 1920px) and (min-height: 1080px) and (orientation: landscape) {
    @include primary-card-padding(2.25);
  }

  @media (min-width: 3840px) and (orientation: landscape) {
    @include primary-card-padding(4.5);
  }
}
</style>
