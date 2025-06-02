import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // No ejecutar en el servidor
  if (process.server) return
  
  // Obtener estado de autenticación del store
  const authStore = useAuthStore()
  
  // Si no hay usuario autenticado, redirigir a login
  if (!authStore.user) {
    console.log('Usuario no autenticado, redirigiendo a login')
    return navigateTo('/login')
  }
  
  // Si el usuario está autenticado, permitir acceso
  return
}) 