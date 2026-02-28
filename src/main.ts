import { createApp } from 'vue';
import App from './app.vue';

import './sass/main.scss';
import { createMemoryHistory, createRouter } from 'vue-router';
import Hero from '@/views/hero.vue';
import Notes from '@/views/notes.vue';
import IMadeThose from '@/views/imadethose.vue';

createApp(App)
    .use(createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: Hero },
            { path: '/notes', component: Notes },
            { path: '/imadethose', component: IMadeThose }
        ]
    })).mount('#app');
