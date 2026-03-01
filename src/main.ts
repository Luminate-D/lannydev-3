import { createApp } from 'vue';
import App from './app.vue';

import './sass/main.scss';
import { createRouter, createWebHistory } from 'vue-router';
import Hero from '@/views/hero.vue';
import Notes from '@/views/notes.vue';
import IMadeThose from '@/views/imadethose.vue';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/storage/auth.ts';
import AuthCallback from '@/authcallback.vue';

const app = createApp(App);
app.use(createPinia());

await useAuthStore().login();

app.use(createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Hero },
        { path: '/notes', component: Notes },
        { path: '/imadethose', component: IMadeThose },
        { path: '/auth/callback', component: AuthCallback }
    ]
}));

app.mount('#app');
