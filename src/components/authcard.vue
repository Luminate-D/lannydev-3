<script setup lang="ts">
import { useAuthStore } from '@/storage/auth';

const auth = useAuthStore();

const login = () => {
    window.location.href = 'https://sso.lanny.dev/?client_id=cc3ff1ac-6fcf-4341-aeff-ecaa595f2383&response_mode=redirect&redirect_uri=https://lanny.dev/auth/callback';
};
</script>

<template>
    <div class="auth-card-wrapper">
        <div v-if="!auth.initialized" class="auth-card loading">
            <span>Loading...</span>
        </div>

        <div v-else-if="auth.user" class="auth-card logged-in">
            <img :src="auth.user.photo_url" alt="User Avatar" class="auth-avatar" />
            <div class="auth-info">
                <span class="auth-username">{{ auth.user.username }}</span>
                <span class="auth-id">ID: {{ auth.user.id }}</span>
            </div>
        </div>

        <button v-else class="auth-card login-btn" @click="login">
            Login
        </button>
    </div>
</template>

<style scoped lang="scss">
@use '@/sass/variables' as *;

.auth-card-wrapper {
    display: inline-block;
}

.auth-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    border: 1px solid $text-muted-25;
    border-radius: 0.3rem;
    background: transparent;
    color: $text;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    text-decoration: none;

    &.loading {
        color: $text-muted-60;
        border-color: transparent;
        padding-left: 0;
    }
}

.login-btn {
    cursor: pointer;
    border-color: $accent;
    color: $accent-light;
    font-weight: 600;

    &:hover {
        background: $accent;
        color: $text;
    }
}

.logged-in {
    border-color: $text-muted-25;
    cursor: default;
    padding: 0.4rem 0.6rem;
}

.auth-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.auth-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.auth-username {
    font-size: 0.8rem;
    color: $text;
}

.auth-id {
    font-size: 0.65rem;
    color: $text-muted-60;
}
</style>