<template>
  <Toast position="top-right" />
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
// import { RouterView } from 'vue-router'
import { useDarkMode } from '@/composables/useDarkMode'
import Toast from 'primevue/toast'

// Inicializar dark mode
useDarkMode()
</script>