<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="text-center text-3xl font-extrabold text-blue-600">ElectroDoc</h1>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Iniciar sesión
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Acceso al sistema de gestión documental
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div v-if="authError" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="material-icons text-red-400">error</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ authError }}</p>
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
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
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
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
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
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Recordarme
              </label>
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="material-icons animate-spin mr-2">autorenew</span>
              {{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
            </button>
          </div>
        </form>
        
        <!-- Información de credenciales para la demo -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Información</span>
            </div>
          </div>
          
          <div class="mt-4 bg-gray-50 p-4 rounded">
            <p class="text-sm text-gray-700 mb-1">Usuario administrador: <span class="font-medium">alexanderviveros9@gmail.com</span></p>
            <p class="text-sm text-gray-700">Inicie sesión con su contraseña de Firebase</p>
          </div>
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
const { login, isLoading, error: authError, initAuth } = useAuth()

// Form data
const email = ref('alexanderviveros9@gmail.com')
const password = ref('')
const rememberMe = ref(false)

// Inicializar autenticación cuando la página se carga
onMounted(() => {
  // Iniciar el listener de autenticación
  const unsubscribe = initAuth()
  
  // No es necesario limpiar el listener aquí, ya que queremos que persista
})

// Handle login form submission
const handleLogin = async () => {
  if (!email.value || !password.value) {
    return
  }
  
  try {
    console.log('Intentando iniciar sesión con Firebase...')
    const success = await login(email.value, password.value)
    
    if (success) {
      // Navigate to dashboard on successful login
      console.log('Login exitoso, redirigiendo a dashboard')
      router.push('/dashboard')
    } else {
      console.error('Error de login, mensaje:', authError.value)
    }
  } catch (err) {
    console.error('Error de excepción en login:', err)
  }
}
</script> 