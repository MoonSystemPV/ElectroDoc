<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="text-center text-3xl font-extrabold text-primary-600">ElectroDoc</h1>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Iniciar sesión
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Ingrese a su cuenta para gestionar sus documentos
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="material-icons text-red-400">error</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div class="mt-1">
              <input 
                id="email" 
                name="email" 
                type="email" 
                autocomplete="email" 
                required 
                v-model="email"
                class="input" 
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div class="mt-1">
              <input 
                id="password" 
                name="password" 
                type="password" 
                autocomplete="current-password" 
                required 
                v-model="password"
                class="input" 
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                v-model="rememberMe"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Recordarme
              </label>
            </div>

            <div class="text-sm">
              <NuxtLink to="/forgot-password" class="font-medium text-primary-600 hover:text-primary-500">
                ¿Olvidó su contraseña?
              </NuxtLink>
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              :disabled="loading"
            >
              <span v-if="loading" class="material-icons animate-spin mr-2">autorenew</span>
              {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">O continuar con</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-3">
            <button 
              type="button" 
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              @click="handleGoogleLogin"
            >
              <span class="material-icons mr-2">person</span>
              Google
            </button>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            ¿No tiene una cuenta?
            <NuxtLink to="/register" class="font-medium text-primary-600 hover:text-primary-500">
              Registrarse
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const error = ref(null)

// Handle login form submission
const handleLogin = async () => {
  try {
    loading.value = true
    error.value = null
    
    await authStore.login(email.value, password.value)
    
    // Navigate to dashboard on successful login
    router.push('/dashboard')
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Credenciales incorrectas. Por favor, inténtelo de nuevo.'
  } finally {
    loading.value = false
  }
}

// Handle Google login
const handleGoogleLogin = () => {
  // Will be implemented with Firebase Google Auth
  error.value = 'Inicio de sesión con Google no implementado aún'
}

// Clear any previous errors when the page loads
onMounted(() => {
  error.value = null
})
</script> 