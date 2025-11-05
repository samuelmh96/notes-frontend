<template>
  <div>
    <Navbar />
    <div class="home">
      <div class="welcome-section">
        <div class="welcome-banner">
          <h2>Bienvenido, {{ authStore.user?.name }}! 👋</h2>
          <p>Aquí están tus notas personales</p>
        </div>
      </div>
      <NotesList />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import Navbar from '../components/Navbar.vue'
import NotesList from '../components/NotesList.vue'

const authStore = useAuthStore()
</script>

<style scoped>
.welcome-section {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 20px;
}

.welcome-banner {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.welcome-banner h2 {
  color: #333;
  margin: 0;
}

.welcome-banner p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

@media (max-width: 767px) {
  .welcome-section {
    padding: 0 15px;
  }
  
  .welcome-banner h2 {
    font-size: 1.5rem;
  }
}
</style>