<template>
  <Toast position="top-right" />
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useDarkMode } from '@/composables/useDarkMode'
import Toast from 'primevue/toast'

// Inicializar dark mode
useDarkMode()
</script>