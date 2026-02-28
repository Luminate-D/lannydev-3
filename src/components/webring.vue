<script setup lang="ts">
import { onMounted, ref } from 'vue';

const webringPrevious = ref('previous');
const webringNext = ref('next');

onMounted(async () => {
  const previous = await fetch('https://webring.c6oi.ru/previous?host=lanny.dev&redirect=false')
  const next = await fetch('https://webring.c6oi.ru/next?host=lanny.dev&redirect=false');

  webringPrevious.value = (await previous.json()).host;
  webringNext.value = (await next.json()).host;
});
</script>

<template>
  <div class="webring">
    <a href="https://webring.c6oi.ru/previous?host=lanny.dev&redirect=true" class="webring-link webring-link--left">
      <span class="webring-arrow">&#8592;</span>
      <span class="webring-site" id="webring-back">{{ webringPrevious }}</span>
    </a>
    <span class="webring-label">webring</span>
    <a href="https://webring.c6oi.ru/next?host=lanny.dev&redirect=true" class="webring-link webring-link--right">
      <span class="webring-site" id="webring-forward">{{ webringNext }}</span>
      <span class="webring-arrow">&#8594;</span>
    </a>
  </div>
</template>

<style scoped lang="scss">
@use '@/sass/variables' as *;

.webring {
  @include flex-between;
  position: absolute;
  bottom: 1.5rem;
  left: 0;
  right: 0;
  padding: 0 2rem;
  pointer-events: none;

  &-label {
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: $text-muted-60;
    opacity: 0.6;
  }

  &-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-decoration: none;
    color: $accent-light;
    font-size: 0.8rem;
    opacity: 0.7;
    pointer-events: all;
    transition: $transition-fast;

    &:hover { opacity: 1; }
  }

  &-arrow {
    color: $accent;
    font-size: 1.1rem;
  }

  &-site {
    font-size: 0.75rem;
    letter-spacing: 0.03em;
    color: $text-dim;
  }
}
</style>