import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Solo ejecutar en el cliente
  if (process.client) {
    const authStore = useAuthStore()
    console.log('Middleware de autenticación ejecutado para ruta:', to.path)
    console.log('Estado de autenticación:', authStore.isAuthenticated ? 'Autenticado' : 'No autenticado')
    console.log('Inicializado:', authStore.initialized)
    
    // Esperar a que la autenticación se inicialice
    if (!authStore.initialized) {
      console.log('La autenticación aún no está inicializada, esperando...')
      // No redireccionar hasta que se inicialice
      return
    }
    
    // Verificar si el usuario no está autenticado y no está en una ruta de autenticación
    const isAuthRoute = to.path.startsWith('/auth') || to.path === '/'
    
    if (!authStore.isAuthenticated && !isAuthRoute) {
      console.log('Usuario no autenticado, redirigiendo a login desde', to.path)
      // Redirigir a la página de login
      return navigateTo('/auth/login')
    }
    
    // Si el usuario está autenticado y trata de acceder a rutas de autenticación
    if (authStore.isAuthenticated && isAuthRoute && to.path !== '/') {
      console.log('Usuario autenticado, redirigiendo a dashboard desde', to.path)
      // Redirigir al dashboard
      return navigateTo('/dashboard')
    }
    
    console.log('Acceso permitido a la ruta:', to.path)
  }
}) 