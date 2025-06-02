import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return
  
  console.log('Middleware de admin ejecutándose para:', to.path)
  
  const { isAdmin, isAuthenticated } = useAuth()
  
  // Verificar que el usuario esté autenticado
  if (!isAuthenticated.value) {
    console.log('Usuario no autenticado, redirigiendo a login')
    return navigateTo('/login')
  }
  
  // Verificar que el usuario sea administrador
  if (!isAdmin.value) {
    console.log('Usuario no es administrador, redirigiendo a dashboard')
    return navigateTo('/dashboard')
  }
}) 