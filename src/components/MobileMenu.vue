<template>
    <div class="mobile-menu-wrapper">
        <Button icon="pi pi-bars" text rounded @click="visible = true" class="mobile-menu-button" />

        <Drawer v-model:visible="visible" position="right">
            <template #header>
                <div class="drawer-header">
                    <i class="pi pi-book"></i>
                    <span>Mis Notas</span>
                </div>
            </template>

            <div class="drawer-content">
                <div class="user-info">
                    <i class="pi pi-user-circle"></i>
                    <span>{{ authStore.user?.name }}</span>
                </div>

                <div class="menu-actions">
                    <Button :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'" :label="isDark ? 'Modo claro' : 'Modo oscuro'"
                        text @click="toggleDarkMode" class="menu-item" />

                    <Button icon="pi pi-user" label="Mi perfil" text @click="goToProfile" class="menu-item" />

                    <Button icon="pi pi-sign-out" label="Cerrar sesión" text severity="danger" @click="handleLogout"
                        class="menu-item" />
                </div>
            </div>
        </Drawer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDarkMode } from '@/composables/useDarkMode'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { isDark, toggleDarkMode } = useDarkMode()

const visible = ref(false)

const goToProfile = () => {
    visible.value = false
    router.push('/profile')
}

const handleLogout = async () => {
    visible.value = false
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
.mobile-menu-wrapper {
    display: none;
}

@media (max-width: 768px) {
    .mobile-menu-wrapper {
        display: block;
    }
}

.drawer-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
}

.drawer-header i {
    font-size: 1.8rem;
}

.drawer-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1rem 0;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
}

.user-info i {
    font-size: 2rem;
    color: #667eea;
}

.user-info span {
    font-weight: 600;
    font-size: 1.1rem;
}

.menu-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.menu-item {
    width: 100%;
    justify-content: flex-start;
    padding: 1rem;
}
</style>