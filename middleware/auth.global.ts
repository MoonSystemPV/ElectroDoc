import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('Middleware global ejecutándose')
  
  // Inicializar autenticación si estamos en el cliente
  if (process.client) {
    try {
      const { initAuth } = useAuth()
      await initAuth()
      console.log('Autenticación inicializada correctamente')
    } catch (error) {
      console.error('Error al inicializar autenticación:', error)
    }
  }
}) 