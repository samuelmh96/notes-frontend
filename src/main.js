import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ConfirmationService from 'primevue/confirmationservice'
import router from './router'

import './style.css'
import 'primeicons/primeicons.css'

import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

app.use(ConfirmationService)

app.mount('#app')

