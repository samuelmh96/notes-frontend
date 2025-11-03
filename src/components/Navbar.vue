<template>
  <div class="navbar">
    <div class="navbar-content">
      <div class="navbar-brand">
        <i class="pi pi-book"></i>
        <span>Mis Notas</span>
      </div>

      <div class="navbar-actions">
        <span class="user-name">{{ authStore.user?.name }}</span>
        <Button :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'" text rounded @click="toggleDarkMode"
          v-tooltip.bottom="isDark ? 'Modo claro' : 'Modo oscuro'" />
        <Button icon="pi pi-user" text rounded @click="goToProfile" />
        <Button icon="pi pi-sign-out" text rounded severity="danger" @click="handleLogout" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { useDarkMode } from '@/composables/useDarkMode'
import Button from 'primevue/button'
import Tooltip from 'primevue/tooltip'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { isDark, toggleDarkMode } = useDarkMode()
const vTooltip = Tooltip

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = async () => {
  await authStore.logout()

  toast.add({
    severity: 'success',
    summary: 'Sesión cerrada',
    detail: 'Has cerrado sesión exitosamente',
    life: 3000
  })

  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.navbar-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.navbar-brand i {
  font-size: 1.8rem;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-weight: 600;
  color: #333;
}
</style>