import { createApp } from 'vue'
import App from './App.vue'
import { PrimeVue } from '@primevue/core'
import Aura from '@primeuix/themes/aura';
import './assets/index.css'
import 'primeicons/primeicons.css';

createApp(App)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        prefix: 'p',
        darkModeSelector: 'system',
        cssLayer: false
      }
    }
  })
  .mount('#app')
