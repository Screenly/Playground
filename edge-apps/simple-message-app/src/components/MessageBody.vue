<script setup lang="ts"></script>

<template>
  <span>
    <div class="message-body secondary-card">
      <span class="message-body-content"
        >A simple message app allows users to display text on a screen, making
        it a basic tool for digital signage. Users can input and edit both the
        heading and message body directly from the Screenly dashboard.</span
      >
    </div>
  </span>
</template>

<style scoped lang="scss">
.message-body {
  display: flex;
  align-items: flex-start;
  justify-content: normal;
}

.message-body-content {
  font-size: 6rem;
  padding: 10rem;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 17;
  height: calc(1.14em * 20);
  overflow: hidden;

  @media screen and (max-width: 3840px) and (orientation: landscape) {
    padding: 9rem;
  }

  @media screen and (max-width: 2560px) and (orientation: landscape) {
    font-size: 3.2rem;
    padding: 4rem;
  }

  @media screen and (max-width: 1920px) and (orientation: landscape) {
    font-size: 3rem;
    padding: 4rem;
    -webkit-line-clamp: 17;
    height: calc(1.13em * 20);
  }

  @media screen and (max-width: 1680px) and (orientation: landscape) {
    font-size: 2.5rem;
    padding: 3rem;
    -webkit-line-clamp: 18;
    height: calc(1.13em * 21);
  }

  @media screen and (max-width: 1600px) and (orientation: landscape) {
    font-size: 2.3rem;
  }

  @media screen and (max-width: 1366px) and (orientation: landscape) {
    font-size: 1.95rem;
    height: calc(1.15em * 21);
  }

  @media screen and (max-width: 1280px) and (orientation: landscape) {
    font-size: 2rem;
    padding: 2.5rem;
    -webkit-line-clamp: 17;
    height: calc(1.13em * 20);
  }

  @media screen and (max-width: 1080px) and (orientation: landscape) {
    font-size: 2rem;
    padding: 2.5rem;
  }

  @media screen and (max-width: 1024px) and (orientation: landscape) {
    font-size: 1.5rem;
    height: calc(1.16em * 20);
  }

  @media screen and (max-width: 800px) and (orientation: landscape) {
    font-size: 1.25rem;
    padding: 2.5rem;
    -webkit-line-clamp: 18;
    height: calc(1.12em * 22);
  }

  @media screen and (max-width: 2160px) and (orientation: portrait) {
    padding: 6rem;
    -webkit-line-clamp: 9;
    height: calc(1.13em * 11);
  }

  @media screen and (max-width: 1080px) and (orientation: portrait) {
    font-size: 3rem;
    padding: 4rem;
    -webkit-line-clamp: 8;
    height: calc(1.13em * 10);
  }

  @media screen and (max-width: 720px) and (orientation: portrait) {
    font-size: 2rem;
    padding: 2.5rem;
    -webkit-line-clamp: 8;
    height: calc(1.14em * 10);
  }

  @media screen and (max-width: 480px) and (orientation: portrait) {
    font-size: 1.3rem;
    padding: 1.2rem;
    -webkit-line-clamp: 8;
    height: calc(1.23em * 9);
  }
}
</style>
