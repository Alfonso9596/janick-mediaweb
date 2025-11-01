import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { StyleClass, Tooltip, ToastService } from 'primevue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { all } from 'primelocale'

import App from './App.vue'
import router from './router'

import '@/assets/styles.scss'

const pinia = createPinia()
const app = createApp(App)

app.directive('styleclass', StyleClass)
app.directive('tooltip', Tooltip)

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
  locale: {
    ...all.de_CH,
  },
})
app.use(ToastService)

app.mount('#app')
