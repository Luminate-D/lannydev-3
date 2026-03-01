<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useAuthStore } from '@/storage/auth';

const authStore = useAuthStore();

const popupRef = ref<Window | null>(null);
const closeTimer = ref<number | null>(null);

const initialized = computed(() => authStore.initialized);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const username = computed(() => (isAuthenticated.value ? user.value?.username : '@none') || '@none');
const telegramId = computed(() => (isAuthenticated.value ? user.value?.telegram_id : 'Click to login') || 'Click to login');
const avatarSrc = computed(() => (isAuthenticated.value ? user.value?.photo_url : '') || '');

const openPopup = () => {
  const popup = window.open('https://sso.lanny.dev/?close', 'lanny_sso', 'width=480,height=720');
  popupRef.value = popup;

  if (closeTimer.value) window.clearInterval(closeTimer.value);
  closeTimer.value = window.setInterval(async () => {
    if (!popupRef.value || popupRef.value.closed) {
      if (closeTimer.value) window.clearInterval(closeTimer.value);
      closeTimer.value = null;
      popupRef.value = null;
      await authStore.login();
    }
  }, 400);
};

const handleClick = () => {
  if (!initialized.value) return;
  openPopup();
};

onMounted(async () => {
  if (!authStore.initialized) {
    await authStore.login();
  }
});

onBeforeUnmount(() => {
  if (closeTimer.value) window.clearInterval(closeTimer.value);
});
</script>

<template>
  <button class="auth-button" type="button" :disabled="!initialized" @click="handleClick">
    <template v-if="!initialized">
      <span class="loading-text">loading</span>
    </template>
    <template v-else>
      <img class="avatar" :src="avatarSrc" alt="" />
      <span class="text">
        <span class="name">{{ username }}</span>
        <span class="id">{{ telegramId }}</span>
      </span>
    </template>
  </button>
</template>

<style scoped lang="scss">
@use '@/sass/variables' as *;

.auth-button {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem 0.7rem;
  background: transparent;
  border: $btn-outline-width solid $btn-gray-border;
  color: $btn-gray-text;
  border-radius: $radius-md;
  cursor: pointer;
  transition: $transition-base;
  text-align: left;

  &:hover:not(:disabled) {
    border-color: $btn-gray-border-hover;
    color: $btn-gray-text-hover;
    background: $btn-gray-bg-hover;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.loading-text {
  font-size: 0.85rem;
  color: $text-muted-60;
  text-transform: lowercase;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: $radius-full;
  border: $btn-outline-width solid $btn-gray-border;
  background: $btn-gray-bg;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar[src=""] {
  background-image: url('/favicon.ico');
  background-size: cover;
  background-position: center;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.name {
  font-size: 0.85rem;
  color: $text;
}

.id {
  font-size: 0.72rem;
  color: $text-muted-60;
}
</style>