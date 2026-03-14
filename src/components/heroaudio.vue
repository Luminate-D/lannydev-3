<script setup lang="ts">
import { ref, computed } from 'vue';
import op10n4 from '@/assets/feelings/op10n4.m4a';

const audio = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

const playBtnText = computed(() => (isPlaying.value ? '⏸' : '▶'));

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const progressPct = computed(() =>
    duration.value ? (currentTime.value / duration.value) * 100 : 0
);

const togglePlay = () => {
  if (!audio.value) return;
  if (isPlaying.value) {
    audio.value.pause();
  } else {
    audio.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const onTimeUpdate = () => {
  if (!audio.value) return;
  currentTime.value = audio.value.currentTime;
};

const onLoadedMetadata = () => {
  if (!audio.value) return;
  duration.value = audio.value.duration;
};

const onProgressClick = (event: MouseEvent) => {
  if (!audio.value) return;
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  audio.value.currentTime = (clickX / rect.width) * duration.value;
};

const onEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
};
</script>

<template>
  <div class="audio-section">
    <div class="audio-player">
      <button class="play-btn" @click="togglePlay">{{ playBtnText }}</button>
      <div class="progress-container" @click="onProgressClick">
        <div class="progress-bar" :style="{ width: progressPct + '%' }"></div>
      </div>
      <span class="time-display">{{ formatTime(currentTime) }}</span>
      <audio
          ref="audio"
          :src="op10n4"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @ended="onEnded"
      ></audio>
    </div>
    <p class="audio-label">today's feeling</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/sass/variables' as *;
@use '@/sass/audio';

.audio-label {
  font-size: 0.85rem;
  color: $text-dim;
  margin: 0.75rem 0 0;
  opacity: 0.7;
  letter-spacing: 0.05em;
}
</style>