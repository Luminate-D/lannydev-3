<script setup lang="ts">
import Webring from '@/components/webring.vue';
import HeroAudio from '@/components/heroaudio.vue';

import Cm from '@/assets/Cm.mp3';
import Csm from '@/assets/Csm.mp3';

const year = new Date().getFullYear();

const play = (fire: boolean) => {
  new Audio(fire ? Cm : Csm).play();
}
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <h1 class="nick">lanny<span class="nick-dev">.dev</span></h1>
      <p class="tagline">developer & music enthusiast</p>
      <p class="info-text">🎹 chopin & beethoven</p>

      <nav class="socials">
        <a href="https://github.com/Luminate-D" class="social-link" title="GitHub">GitHub</a>
        <a href="https://discord.com/users/974442399197712384" class="social-link" title="Discord">Discord</a>
        <a href="https://t.me/lannts" class="social-link" title="Telegram">Telegram</a>
      </nav>

      <HeroAudio />

      <p class="footer">
        From
        <span class="tonality" @click="play(true)">C minor</span>'s fire to
        <span class="tonality" @click="play(false)">C# minor</span>'s quiet depth
        · {{ year }}
      </p>
    </div>

    <Webring />
  </section>
</template>

<style scoped lang="scss">
@use '@/sass/variables' as *;

.hero {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem 4rem;
  box-sizing: border-box;
  overflow: hidden;

  &-content {
    text-align: center;
    max-width: 600px;
  }
}

.nick {
  @include text-gradient;
  font-size: clamp(3.5rem, 12vw, 7rem);
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

.tagline {
  font-size: 1.1rem;
  margin: 1.5rem 0 0;
  opacity: 0.85;
  font-weight: 400;
  color: $text;
}

.info-text {
  font-size: 1rem;
  margin: 0.75rem 0 0;
  opacity: 0.75;
  color: $text-dim;
}

.socials {
  @include flex-center(1rem);
  flex-wrap: wrap;
  margin-top: 2.5rem;
}

.social-link {
  padding: 0.8rem 2rem;
  border: 1px solid $accent;
  border-radius: $radius-sm;
  background: transparent;
  color: $accent-light;
  text-decoration: none;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 500;
  letter-spacing: 0.05em;
  transition: $transition-base;

  &:hover {
    background: $accent;
    color: $text;
    border-color: $accent-light;
    @include accent-glow;
  }

  &:active { transform: scale(0.98); }
}

.footer {
  margin-top: 2.5rem;
  font-size: 0.82rem;
  color: $text-muted-60;
  letter-spacing: 0.04em;
  line-height: 1.6;

  .tonality {
    cursor: pointer;
    color: $accent-light;
    text-decoration: underline;
  }
}
</style>