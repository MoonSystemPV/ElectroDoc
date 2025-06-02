import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password']
  
  // Check if the route requires authentication
  const requiresAuth = !publicRoutes.includes(to.path)
  
  // Wait for auth initialization (only needed once)
  if (process.client && !authStore.initializeAuthCalled) {
    await authStore.initAuth()
    authStore.initializeAuthCalled = true
  }
  
  // If the route requires auth and the user is not authenticated, redirect to login
  if (requiresAuth && !authStore.isAuthenticated) {
    return navigateTo('/login')
  }
  
  // If the user is authenticated and tries to access login/register, redirect to dashboard
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
}) 