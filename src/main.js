import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import router from './router'

import './style.css'
import 'primeicons/primeicons.css'
import './assets/dark-mode.css'
import './assets/animations.css'

import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

app.use(ConfirmationService)
app.use(ToastService)
app.use(createPinia())

app.mount('#app')

