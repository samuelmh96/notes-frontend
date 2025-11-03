<template>
  <div class="auth-container">
    <Card class="auth-card">
      <template #title>
        <h2>Crear Cuenta</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleRegister" class="auth-form">
          <InputText 
            v-model="formData.name" 
            placeholder="Nombre completo"
            required
          />
          <InputText 
            v-model="formData.email" 
            type="email"
            placeholder="Email"
            required
          />
          <Password 
            v-model="formData.password" 
            placeholder="Contraseña"
            toggleMask
            required
          />
          <Password 
            v-model="formData.password_confirmation" 
            placeholder="Confirmar contraseña"
            :feedback="false"
            toggleMask
            required
          />
          <Button 
            type="submit" 
            label="Registrarse" 
            :loading="isLoading"
            class="w-full"
          />
        </form>
        
        <p class="auth-link">
          ¿Ya tienes cuenta? 
          <router-link to="/login">Inicia sesión aquí</router-link>
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

const formData = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const isLoading = ref(false)

const handleRegister = async () => {
  if (formData.value.password !== formData.value.password_confirmation) {
    toast.add({
      severity: 'warn',
      summary: 'Error',
      detail: 'Las contraseñas no coinciden',
      life: 3000
    })
    return
  }

  isLoading.value = true
  
  try {
    await authStore.register(formData.value)
    
    toast.add({
      severity: 'success',
      summary: '¡Cuenta creada!',
      detail: 'Te has registrado exitosamente',
      life: 3000
    })
    
    router.push('/')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Error al registrar',
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