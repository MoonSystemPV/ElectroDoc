import { defineStore } from 'pinia'
import type { User } from '~/types/user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),
  
  actions: {
    setUser(user: User) {
      this.user = user
    },
    
    clearUser() {
      this.user = null
    }
  },
  
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'administrativo',
    isSupervisor: (state) => state.user?.role === 'supervisor',
    isTechnician: (state) => state.user?.role === 'tecnico'
  }
}) 