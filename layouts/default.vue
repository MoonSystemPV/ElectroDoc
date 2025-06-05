<template>
  <div v-if="isAuthRoute">
    <slot />
  </div>
  <MainLayout v-else-if="isAuthenticated">
    <slot />
  </MainLayout>
  <div v-else>
    <!-- Redirigir a login si no está autenticado y no es ruta de autenticación -->
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-800 p-4">
      <div class="text-center">
        <p class="text-white text-xl mb-4">Debe iniciar sesión para acceder a esta página</p>
        <NuxtLink to="/auth/login" class="px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-lg border border-white/20 shadow-lg transition-all">
          Ir a iniciar sesión
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import MainLayout from '~/components/layout/MainLayout.vue'

const route = useRoute()
const authStore = useAuthStore()

// Check if current route is an auth route (login, register, etc.)
const isAuthRoute = computed(() => {
  return route.path.startsWith('/auth/login') || 
         route.path.startsWith('/auth/register') || 
         route.path.startsWith('/auth/reset-password') ||
         route.path === '/'
})

// Verificar si el usuario está autenticado
const isAuthenticated = computed(() => {
  return authStore.isAuthenticated
})

// Inicializar la autenticación cuando se carga el componente
onMounted(async () => {
  if (!authStore.initialized) {
    try {
      await authStore.initAuth()
    } catch (error) {
      console.error('Error initializing auth:', error)
    }
  }
})
</script> 