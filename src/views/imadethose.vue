<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

type Composition = {
  id: number
  name: string
  dedication?: string
  release_date?: string
  file_key: string
}

const compositions = ref<Composition[]>([])
const loading = ref(true)
const error = ref(false)

const audioRefs = new Map<number, HTMLAudioElement>()
const playerState = reactive<Record<number, { isPlaying: boolean; currentTime: number; duration: number }>>({})

const ensureState = (id: number) => {
  if (!playerState[id]) playerState[id] = { isPlaying: false, currentTime: 0, duration: 0 }
  return playerState[id]
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const setAudioRef = (id: number, el: HTMLAudioElement | null) => {
  if (el) audioRefs.set(id, el)
  else audioRefs.delete(id)
}

const togglePlay = (id: number) => {
  const audio = audioRefs.get(id)
  if (!audio) return

  audioRefs.forEach((a, otherId) => {
    if (otherId !== id && !a.paused) {
      a.pause()
      ensureState(otherId).isPlaying = false
    }
  })

  if (audio.paused) {
    audio.play()
    ensureState(id).isPlaying = true
  } else {
    audio.pause()
    ensureState(id).isPlaying = false
  }
}

const onLoadedMetadata = (id: number, e: Event) => {
  const audio = e.target as HTMLAudioElement
  const st = ensureState(id)
  st.duration = audio.duration || 0
}

const onTimeUpdate = (id: number, e: Event) => {
  const audio = e.target as HTMLAudioElement
  const st = ensureState(id)
  st.currentTime = audio.currentTime || 0
}

const onEnded = (id: number) => {
  const st = ensureState(id)
  st.isPlaying = false
  st.currentTime = 0
}

const seek = (id: number, e: MouseEvent) => {
  const audio = audioRefs.get(id)
  if (!audio || !audio.duration) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  audio.currentTime = Math.max(0, Math.min(1, pct)) * audio.duration
}

const progressPct = (id: number) => {
  const st = ensureState(id)
  return st.duration ? (st.currentTime / st.duration) * 100 : 0
}

const timeDisplay = (id: number) => {
  const st = ensureState(id)
  const sec = st.isPlaying ? st.currentTime : st.duration
  return formatTime(sec || 0)
}

const playSymbol = (id: number) => (ensureState(id).isPlaying ? '⏸' : '▶')
const fetchCompositions = async () => {
  loading.value = true
  error.value = false
  try {
    const res = await fetch('https://api.lanny.dev/compositions')
    compositions.value = await res.json()
  } catch {
    error.value = true
    compositions.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchCompositions)

onBeforeUnmount(() => {
  audioRefs.forEach(a => a.pause())
})
</script>

<template>
  <div class="wrapper">
    <div class="compositions-wrapper">
      <p class="compositions-title">COMPOSITIONS</p>
      <div class="compositions-list" id="compositionsList" data-vue-managed="true">
        <div v-if="loading" class="comp-loading">loading...</div>
        <div v-else-if="error" class="comp-loading">failed to load :(</div>
        <div v-else-if="!compositions.length" class="comp-loading">nothing here yet</div>
        <template v-else>
          <template v-for="(comp, i) in compositions" :key="comp.id">
            <div class="comp-card">
              <div class="comp-header">
                <div class="comp-name-wrap">
                  <span v-if="comp.release_date" class="comp-release-date">{{ formatDate(comp.release_date) }}</span>
                  <span class="comp-name">{{ comp.name }}</span>
                </div>
                <span v-if="comp.dedication" class="comp-dedication">Á {{ comp.dedication }}</span>
              </div>

              <div class="comp-player-row">
                <div class="audio-player comp-audio-player">
                  <button class="play-btn" @click="togglePlay(comp.id)">{{ playSymbol(comp.id) }}</button>
                  <div class="progress-container" @click="seek(comp.id, $event)">
                    <div class="progress-bar" :style="{ width: progressPct(comp.id) + '%' }"></div>
                  </div>
                  <span class="time-display">{{ timeDisplay(comp.id) }}</span>
                  <audio
                    :ref="el => setAudioRef(comp.id, el as HTMLAudioElement | null)"
                    :src="`https://cdn.lanny.dev/assets/compositions/${comp.file_key}.mp3`"
                    @loadedmetadata="onLoadedMetadata(comp.id, $event)"
                    @timeupdate="onTimeUpdate(comp.id, $event)"
                    @ended="onEnded(comp.id)"
                  />
                </div>

                <div class="comp-actions">
                  <a
                    class="comp-download-btn"
                    :href="`https://cdn.lanny.dev/assets/compositions/${comp.file_key}.pdf`"
                    download
                    title="Download PDF score"
                  >PDF SCORE</a>
                </div>
              </div>
            </div>

            <hr v-if="i < compositions.length - 1" class="comp-delimiter" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/sass/variables' as *;
@use '@/sass/audio';

.wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6rem;
  transition: opacity 0.25s ease-in-out;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

.compositions-wrapper {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0 1.5rem 4rem;
}

.compositions-title {
  width: 100%;
  text-align: center;
  color: $text-muted-60;
  margin: 0;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
}

.comp-loading {
  text-align: center;
  color: $text-muted-25;
  font-size: 0.9rem;
  padding: 3rem 0;
  letter-spacing: 0.05em;
}

.compositions-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.comp-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem 0;
}

.comp-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.comp-name-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.comp-release-date {
  font-size: 0.7rem;
  color: $text-muted-60;
  letter-spacing: 0.08em;
}

.comp-name {
  font-size: 1rem;
  color: $text;
  font-weight: 600;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.comp-dedication {
  font-size: 0.73rem;
  color: $accent-light;
  opacity: 0.65;
  letter-spacing: 0.05em;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comp-player-row {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
}

.comp-audio-player {
  flex: 1;
  max-width: 100%;
}

.comp-actions {
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
}

.comp-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: $btn-gray-bg;
  border: 1px solid $btn-gray-border;
  color: $btn-gray-text;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.73rem;
  letter-spacing: 0.08em;
  padding: 0 0.75rem;
  border-radius: 0.2rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: auto;
  align-self: stretch;

  &::before {
    content: '⤓';
    color: $btn-gray-icon;
  }

  &:hover {
    background: $btn-gray-bg-hover;
    border-color: $btn-gray-border-hover;
    color: $btn-gray-text-hover;
  }
}

.comp-delimiter {
  height: 1px;
  background: $text-muted-07;
  border: none;
  margin: 0;
}

</style>