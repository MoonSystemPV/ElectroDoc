import { useAuthStore } from '~/stores/auth'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return
  
  console.log('Middleware de auth ejecutándose para:', to.path)
  
  const { isAuthenticated, initAuth } = useAuth()
  
  // Initialize authentication if not already done
  try {
    await initAuth()
    console.log('Estado de autenticación:', isAuthenticated.value ? 'Autenticado' : 'No autenticado')
  } catch (error) {
    console.error('Error inicializando autenticación:', error)
  }
  
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    console.log('Usuario no autenticado, redirigiendo a login')
    // Para la demo, no redireccionamos a login sino que consideramos autenticado
    // return navigateTo('/login')
    return
  }
  
  // Role-based access control (si se necesita)
  if (to.meta.requiresRole && authStore.user) {
    const requiredRole = to.meta.requiresRole
    // Acceder al rol del usuario de manera segura
    const userRole = authStore.user.role || 'user'
    
    // Check if user has the required role
    if (Array.isArray(requiredRole) && !requiredRole.includes(userRole)) {
      // User does not have any of the required roles
      return navigateTo('/dashboard')
    } else if (typeof requiredRole === 'string' && requiredRole !== userRole) {
      // User does not have the required role
      return navigateTo('/dashboard')
    }
  }
}) 