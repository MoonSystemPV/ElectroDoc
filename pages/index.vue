<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-500 via-blue-400 to-cyan-400 p-4">
    <div class="bg-white/20 backdrop-blur-lg p-12 rounded-3xl shadow-2xl max-w-xl w-full flex flex-col items-center gap-8">
      <div v-if="isLoading" class="flex flex-col items-center gap-4">
        <div class="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p class="text-white text-lg">Cargando...</p>
      </div>
      <div v-else class="flex flex-col items-center gap-8 w-full">
        <div class="h-40 w-40 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden">
          <img src="/images/Logo.png" alt="Logo ElectroDoc" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-4xl font-bold text-white text-center">ElectroDoc</h1>
        <p class="text-lg text-white/90 text-center">
          Sistema de gestión de documentación eléctrica profesional
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-6">
          <NuxtLink to="/auth/login" class="bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-blue-50 transition-all hover:scale-105">
            <span class="material-icons">login</span>
            Iniciar Sesión
          </NuxtLink>
          <a href="https://github.com/MoonSystemPV/ElectroDoc" target="_blank" class="bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-white/10 transition-all hover:scale-105">
            <span class="material-icons">code</span>
            GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, isAuthenticated, initAuth } = useAuth()
const isLoading = ref(true)

// No necesitamos aplicar middleware aquí
definePageMeta({
  middleware: []
})

onMounted(async () => {
  try {
    console.log('Inicializando autenticación en la página principal...')
    await initAuth()
    
    // Esperar un momento para asegurarse de que el estado de autenticación esté actualizado
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Si el usuario está autenticado, redirigir a dashboard
    if (isAuthenticated.value) {
      console.log('Usuario autenticado, redirigiendo a dashboard...')
      router.push('/dashboard')
    } else {
      console.log('Usuario no autenticado, mostrando página de inicio...')
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error al verificar la autenticación:', error)
    isLoading.value = false
  }
})
</script> 