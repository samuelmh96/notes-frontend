<template>
  <div class="auth-container">
    <Card class="auth-card">
      <template #title>
        <h2>Iniciar Sesión</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="auth-form">
          <InputText 
            v-model="credentials.email" 
            type="email"
            placeholder="Email"
            required
          />
          <Password 
            v-model="credentials.password" 
            placeholder="Contraseña"
            :feedback="false"
            toggleMask
            required
          />
          <Button 
            type="submit" 
            label="Iniciar Sesión" 
            :loading="isLoading"
            class="w-full"
          />
        </form>
        
        <p class="auth-link">
          ¿No tienes cuenta? 
          <router-link to="/register">Regístrate aquí</router-link>
        </p>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const credentials = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  
  try {
    await authStore.login(credentials.value)
    
    toast.add({
      severity: 'success',
      summary: 'Bienvenido',
      detail: 'Has iniciado sesión exitosamente',
      life: 3000
    })
    
    router.push('/')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Credenciales incorrectas',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-link {
  text-align: center;
  margin-top: 1rem;
}

.auth-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.w-full {
  width: 100%;
}

/* Responsive */
@media (max-width: 767px) {
  .auth-container {
    padding: 15px;
  }
  
  .auth-card {
    max-width: 100%;
  }
}
</style>