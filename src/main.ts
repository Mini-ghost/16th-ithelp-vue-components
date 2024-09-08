import '~/assets/scss/main.scss';

import { createRouter, createWebHistory } from 'vue-router/auto';

import { createApp } from 'vue';
import App from './App.vue';
import { createPopupsManager } from './plugins/popups';
import { createToastsManager } from './plugins/toasts';

const popups = createPopupsManager();
const toasts = createToastsManager();

const router = createRouter({
  history: createWebHistory(),
});

const app = createApp(App);

app.use(router);
app.use(popups);
app.use(toasts);
app.mount('#app');

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
  }
});
