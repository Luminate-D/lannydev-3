import { defineStore } from 'pinia';

interface IUser {
    id: string;
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
                const res = await fetch('https://sso.lanny.dev/@me', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });

                const json = await res.json();
                this.user = res.ok ? json : null;
                if(this.user) console.log('Logged as', json);

                if (!res.ok) {
                    if(json.error === 'access_token_expired') {
                        const result = await fetch('https://sso.lanny.dev/refresh', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ refresh_token: localStorage.getItem('refresh_token') })
                        });

                        const data = await result.json();
                        if(result.ok) {
                            localStorage.setItem('access_token', data.access_token);
                            localStorage.setItem('refresh_token', data.refresh_token);
                            await this.login();
                        } else {
                            console.log('Refresh error:', data);
                        }
                    }
                }
            } catch (e) {
                this.user = null;
                console.log('Error logging in', e);
            } finally {
                this.initialized = true;
            }
        },
    }
});
