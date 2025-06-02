import { defineStore } from 'pinia'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any | null,
    loading: false,
    error: null as string | null,
    initializeAuthCalled: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
  },
  
  actions: {
    async initAuth() {
      const auth = getAuth()
      
      return new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          this.user = user
          this.initializeAuthCalled = true
          unsubscribe()
          resolve()
        })
      })
    },
    
    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      
      try {
        const auth = getAuth()
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        this.user = user
        return user
      } catch (error: any) {
        this.error = error.message || 'Error al iniciar sesión'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async register(email: string, password: string) {
      this.loading = true
      this.error = null
      
      try {
        const auth = getAuth()
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        this.user = user
        return user
      } catch (error: any) {
        this.error = error.message || 'Error al registrar usuario'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      try {
        const auth = getAuth()
        await signOut(auth)
        this.user = null
      } catch (error: any) {
        this.error = error.message || 'Error al cerrar sesión'
        throw error
      }
    }
  }
}) 