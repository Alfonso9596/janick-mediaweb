import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { registerLicense } from '@primeui/license-manager'
import { StyleClass, Tooltip, ToastService } from 'primevue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { all } from 'primelocale'
import { httpInterceptor } from './api/httpInterceptor'
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import {
  FaBlackTie,
  FaBuffer,
  FaFilm,
  FaGamepad,
  FaHome,
  FaList,
  FaMusic,
  FaTv,
  FaUser,
  FaUserShield,
  FaUtensils,
} from 'oh-vue-icons/icons/fa'

addIcons(FaBlackTie, FaBuffer, FaFilm, FaGamepad, FaHome, FaList, FaMusic, FaTv, FaUser, FaUserShield, FaUtensils)

import App from './App.vue'
import router from './router'

import '@/assets/styles.scss'

const pinia = createPinia()
const app = createApp(App)

if (import.meta.env.VITE_PRIME_LICENSE) {
  registerLicense({ primeui: import.meta.env.VITE_PRIME_LICENSE })
}

app.directive('styleclass', StyleClass)
app.directive('tooltip', Tooltip)

app.component('v-icon', OhVueIcon)

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
httpInterceptor()
