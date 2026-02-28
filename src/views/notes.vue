<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const NOTE_HEIGHT_PX = 105;
const MIN_NOTES_PER_PAGE = 5;

const notes = ref<{ id: string; content: string; created_at: string }[]>([]);
const page = ref(1);
const hasNext = ref(false);
const inputText = ref('');
const loading = ref(false);

const windowHeight = ref(window.innerHeight);
const limit = computed(() =>
    Math.max(MIN_NOTES_PER_PAGE, Math.floor(windowHeight.value * 0.65 / NOTE_HEIGHT_PX))
);

const onResize = () => (windowHeight.value = window.innerHeight);
onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} – ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const formattedNotes = computed(() =>
    notes.value.map(note => ({ ...note, formatted: formatDate(note.created_at) }))
);

const fetchNotes = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await fetch(`https://api.lanny.dev/notes?page=${page.value}&limit=${limit.value}`);
    const data = await res.json();
    // Ensure each note has an id
    notes.value = data.notes.map((note: any, i: number) => ({ id: note.id || `${page.value}-${i}`, ...note }));
    hasNext.value = data.hasNext;
  } finally {
    loading.value = false;
  }
};

const prevPage = () => { if (page.value > 1) { page.value--; fetchNotes(); } }
const nextPage = () => { if (hasNext.value) { page.value++; fetchNotes(); } }

const rateLimit = ref(0);
const postDisabled = computed(() => rateLimit.value > 0);
const postLabel = computed(() =>
    rateLimit.value > 0
        ? `${Math.floor(rateLimit.value / 60)}:${String(rateLimit.value % 60).padStart(2,'0')}`
        : 'POST'
);

const startRateLimit = () => {
  rateLimit.value = 60;
  const tick = () => {
    if (rateLimit.value <= 0) return;
    rateLimit.value--;
    setTimeout(tick, 1000);
  };
  tick();
};

const sendNote = async () => {
  const text = inputText.value.trim();
  if (!text || postDisabled.value) return;

  const newNote = { id: `tmp-${Date.now()}`, content: text, created_at: new Date().toISOString() };
  notes.value.unshift(newNote);

  inputText.value = '';

  try {
    await fetch('https://notes.lanny.dev/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    });
  } catch (err) {
    console.error('Failed to send note', err);
    // Optionally remove note if failed
    notes.value = notes.value.filter(n => n.id !== newNote.id);
  }

  startRateLimit();
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendNote();
  }
};

onMounted(fetchNotes);
</script>

<template>
  <div class="wrapper">
    <div class="notes-wrapper">
      <p class="notes-title">dont overuse, pls</p>
      <div class="notes-pagination">
        <span class="notes-arrow" :class="{ disabled: page <= 1 }" @click="prevPage">&#8592;</span>
        <span class="notes-page">{{ page }}</span>
        <span class="notes-arrow" :class="{ disabled: !hasNext }" @click="nextPage">&#8594;</span>
      </div>
      <div class="notes-input-row">
        <input class="notes-input" type="text" placeholder="write your thoughts" autocomplete="off"
          v-model="inputText" @keydown="onKeydown" />
        <button class="notes-post-btn" :disabled="postDisabled" @click="sendNote">{{ postLabel }}</button>
      </div>
      <div class="notes-list">
        <template v-if="formattedNotes.length">
          <template v-for="note in formattedNotes" :key="note.id">
            <div class="note-item">
              <div class="note-timestamp">{{ note.formatted }}</div>
              <p class="note-text">{{ note.content }}</p>
            </div>
            <hr v-if="formattedNotes.indexOf(note) < formattedNotes.length - 1" class="note-delimiter" />
          </template>
        </template>
        <div v-else class="notes-empty">No more notes :(</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/sass/variables' as *;

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

.notes-wrapper {
  width: 100%;
  display: flex;
  max-width: 560px;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0 1.5rem 3rem;
}

.notes-input-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.notes-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid $text-muted-20;
  color: $text;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  padding: 0.5rem 0;
  outline: none;
  transition: border-color 0.2s ease;
  letter-spacing: 0.03em;
}

.notes-input::placeholder {
  color: $text-muted-25;
}

.notes-input:focus {
  border-bottom-color: $accent-light;
}

.notes-post-btn {
  background: transparent;
  border: 1px solid $accent;
  color: $accent-light;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  padding: 0.4rem 1rem;
  cursor: pointer;
  border-radius: 0.2rem;
  transition: all 0.2s ease;
}

.notes-post-btn:hover {
  background: $accent;
  color: $text;
}

.notes-post-btn:disabled {
  border-color: $text-muted-25;
  color: $text-muted-25;
  cursor: not-allowed;
  background: transparent;
}

.notes-post-btn:disabled:hover {
  background: transparent;
  color: $text-muted-25;
}

.notes-list {
  display: flex;
  flex-direction: column;
}

.note-item {
  padding: 1rem 0;
}

.note-timestamp {
  font-size: 0.75rem;
  color: $accent-light;
  letter-spacing: 0.08em;
  margin-bottom: 0.4rem;
}

.note-text {
  font-size: 0.95rem;
  color: var(--text);
  line-height: 1.55;
  margin: 0;
  font-weight: 400;
}

.note-delimiter {
  height: 1px;
  background: $text-muted-07;
  border: none;
  margin: 0;
}

.notes-title {
  width: 100%;
  text-align: center;
  color: $text-muted-60;
  margin: 0 0 0.5rem 0;
}

.notes-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding-top: 0.5rem;
  padding-bottom: 0;
}

.notes-arrow {
  color: $accent-light;
  font-size: 1rem;
  cursor: pointer;user-select: none;
  transition: color 0.2s ease, opacity 0.2s ease;
  padding: 0.25rem;
}

.notes-arrow:hover {
  color: $text;
}

.notes-arrow.disabled {
  opacity: 0.2;
  cursor: default;
  pointer-events: none;
}

.notes-page {
  font-size: 0.85rem;
  color: $text-muted-60;
  letter-spacing: 0.1em;
  min-width: 1.5rem;
  text-align: center;
}

.notes-empty {
  text-align: center;
  color: $text-muted-25;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  padding: 3rem 0;
}

</style>