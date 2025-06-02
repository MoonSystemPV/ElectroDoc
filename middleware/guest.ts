export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  // Wait for authentication check to complete
  if (isLoading.value) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
}) 