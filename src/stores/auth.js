import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const login = async (credentials) => {
    const response = await api.post('/login', credentials)
    setToken(response.data.token)
    setUser(response.data.user)
    return response.data
  }

  const register = async (userData) => {
    const response = await api.post('/register', userData)
    setToken(response.data.token)
    setUser(response.data.user)
    return response.data
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  const fetchUser = async () => {
    if (token.value) {
      try {
        const response = await api.get('/me')
        setUser(response.data)
      } catch (error) {
        logout()
      }
    }
  }

  const updateProfile = async (profileData) => {
    const response = await api.put('/profile', profileData)
    setUser(response.data.user)
    return response.data
  }

  const updatePassword = async (passwordData) => {
    const response = await api.put('/password', passwordData)
    return response.data
  }

  // Inicializar token si existe
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    fetchUser()
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    updatePassword
  }
})