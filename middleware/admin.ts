import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // No ejecutar en el servidor
  if (process.server) return
  
  // Obtener estado de autenticación del store
  const authStore = useAuthStore()
  
  // Si no hay usuario o no es administrador, redirigir a dashboard
  if (!authStore.user || (authStore.user.role !== 'admin' && authStore.user.role !== 'administrativo')) {
    console.log('Acceso denegado: Ruta solo para administradores')
    return navigateTo('/dashboard')
  }
  
  // Si el usuario es administrador, permitir acceso
  return
}) 