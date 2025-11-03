<template>
  <Navbar />
  <div class="home">
     <div class="welcome-banner">
        <h2>Bienvenido, {{ authStore.user?.name }}! 👋</h2>
        <p>Aquí están tus notas personales</p>
      </div>
    <NotesList />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import Navbar from '../components/Navbar.vue'
import NotesList from '../components/NotesList.vue'

const authStore = useAuthStore()
</script>

<style scoped>
.welcome-banner {
  max-width: 800px;
  margin: 0 auto 2rem;
  padding: 0 20px;
}

.welcome-banner h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.welcome-banner p {
  color: #666;
  font-size: 1rem;
}
</style>