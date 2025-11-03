import { ref, watch, onMounted } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      isDark.value = true
    } else {
      isDark.value = false
    }

    applyTheme()
  }

  onMounted(() => {
    initTheme()
  })

  watch(isDark, () => {
    applyTheme()
  })

  return {
    isDark,
    toggleDarkMode
  }
}