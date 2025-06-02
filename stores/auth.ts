import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  nombre: string
  role: string
  fechaCreacion: Date
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    initialized: false
  }),
  
  actions: {
    setUser(user: User) {
      this.user = user
      this.isAuthenticated = true
      this.initialized = true
      console.log('Usuario establecido en el store:', user)
    },
    
    clearUser() {
      this.user = null
      this.isAuthenticated = false
      console.log('Usuario eliminado del store')
    },
    
    async initAuth() {
      this.initialized = true
      console.log('Autenticación inicializada en el store')
      
      // Intentar cargar usuario desde localStorage
      if (!this.user) {
        try {
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            this.setUser(JSON.parse(savedUser))
          }
        } catch (error) {
          console.error('Error al cargar usuario desde localStorage:', error)
        }
      }
    }
  }
}) 