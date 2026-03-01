import { defineStore } from 'pinia';

interface IUser {
    telegram_id: string;
    username: string;
    photo_url: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as IUser | null,
        initialized: false,
    }),

    getters: {
        isAuthenticated: state => !!state.user
    },

    actions: {
        async login() {
            try {
                const res = await fetch('https://sso.lanny.dev/@me', { credentials: 'include' });

                if (!res.ok) throw new Error('Not authenticated');

                this.user = await res.json();
            } catch (e) {
                this.user = null;
                console.log('Error logging in', e);
            } finally {
                this.initialized = true;
            }
        },
    }
});
