<template>
  <div>
    <Navbar />
    <div class="profile-container">
      <Card>
        <template #title>Mi Perfil</template>
        <template #content>
          <Tabs value="0">
            <TabList>
              <Tab value="0">Información Personal</Tab>
              <Tab value="1">Cambiar Contraseña</Tab>
            </TabList>
            
            <TabPanels>
              <!-- Panel de perfil -->
              <TabPanel value="0">
                <form @submit.prevent="handleUpdateProfile" class="profile-form">
                  <div class="form-field">
                    <label>Nombre completo</label>
                    <InputText 
                      v-model="profileData.name" 
                      required
                    />
                  </div>
                  
                  <div class="form-field">
                    <label>Email</label>
                    <InputText 
                      v-model="profileData.email" 
                      type="email"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    label="Guardar cambios" 
                    :loading="isUpdatingProfile"
                    icon="pi pi-save"
                  />
                </form>
              </TabPanel>
              
              <!-- Panel de contraseña -->
              <TabPanel value="1">
                <form @submit.prevent="handleUpdatePassword" class="profile-form">
                  <div class="form-field">
                    <label>Contraseña actual</label>
                    <Password 
                      v-model="passwordData.current_password" 
                      :feedback="false"
                      toggleMask
                      required
                    />
                  </div>
                  
                  <div class="form-field">
                    <label>Nueva contraseña</label>
                    <Password 
                      v-model="passwordData.password" 
                      toggleMask
                      required
                    />
                  </div>
                  
                  <div class="form-field">
                    <label>Confirmar nueva contraseña</label>
                    <Password 
                      v-model="passwordData.password_confirmation" 
                      :feedback="false"
                      toggleMask
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    label="Cambiar contraseña" 
                    :loading="isUpdatingPassword"
                    icon="pi pi-lock"
                  />
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import Navbar from '../components/Navbar.vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

const authStore = useAuthStore()
const toast = useToast()

const profileData = ref({
  name: '',
  email: ''
})

const passwordData = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)

onMounted(() => {
  profileData.value = {
    name: authStore.user?.name || '',
    email: authStore.user?.email || ''
  }
})

const handleUpdateProfile = async () => {
  isUpdatingProfile.value = true
  
  try {
    await authStore.updateProfile(profileData.value)
    
    toast.add({
      severity: 'success',
      summary: 'Perfil actualizado',
      detail: 'Tu información se actualizó correctamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo actualizar el perfil',
      life: 3000
    })
  } finally {
    isUpdatingProfile.value = false
  }
}

const handleUpdatePassword = async () => {
  if (passwordData.value.password !== passwordData.value.password_confirmation) {
    toast.add({
      severity: 'warn',
      summary: 'Error',
      detail: 'Las contraseñas no coinciden',
      life: 3000
    })
    return
  }

  isUpdatingPassword.value = true
  
  try {
    await authStore.updatePassword(passwordData.value)
    
    passwordData.value = {
      current_password: '',
      password: '',
      password_confirmation: ''
    }
    
    toast.add({
      severity: 'success',
      summary: 'Contraseña actualizada',
      detail: 'Tu contraseña se cambió correctamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo actualizar la contraseña',
      life: 3000
    })
  } finally {
    isUpdatingPassword.value = false
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
  color: #333;
}

/* Responsive */
@media (max-width: 767px) {
  .profile-container {
    padding: 15px;
  }
  
  .profile-form {
    padding: 0.5rem 0;
  }
}
</style>