import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  
  // Wait for authentication check to complete
  if (isLoading.value) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
  
  // Role-based access control
  if (to.meta.requiresRole && user.value) {
    const requiredRole = to.meta.requiresRole
    const userRole = user.value.role
    
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