<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="text-center text-3xl font-extrabold text-blue-600">ElectroDoc</h1>
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

            <div class="text-sm">
              <NuxtLink to="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
                ¿Olvidó su contraseña?
              </NuxtLink>
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
        
        <!-- Accesos rápidos de demostración -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Accesos de demostración</span>
            </div>
          </div>
          
          <div class="mt-4 grid grid-cols-3 gap-3">
            <button 
              type="button" 
              @click="quickLogin('admin')" 
              class="bg-blue-50 text-blue-700 py-2 px-4 rounded text-sm hover:bg-blue-100"
            >
              Administrador
            </button>
            <button 
              type="button" 
              @click="quickLogin('supervisor')" 
              class="bg-green-50 text-green-700 py-2 px-4 rounded text-sm hover:bg-green-100"
            >
              Supervisor
            </button>
            <button 
              type="button" 
              @click="quickLogin('tecnico')" 
              class="bg-yellow-50 text-yellow-700 py-2 px-4 rounded text-sm hover:bg-yellow-100"
            >
              Técnico
            </button>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            ¿No tiene una cuenta?
            <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-500">
              Registrarse
            </NuxtLink>
          </p>
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
const email = ref('admin@example.com')
const password = ref('password')
const rememberMe = ref(false)

// Inicializar autenticación cuando la página se carga
onMounted(async () => {
  await initAuth()
})

// Handle login form submission
const handleLogin = async () => {
  try {
    const success = await login(email.value, password.value)
    
    if (success) {
      // Navigate to projects page on successful login
      router.push('/projects')
    }
  } catch (err) {
    console.error('Login error:', err)
  }
}

// Acceso rápido con roles predefinidos
const quickLogin = async (role) => {
  let demoEmail = '';
  
  switch (role) {
    case 'admin':
      demoEmail = 'admin@example.com';
      break;
    case 'supervisor':
      demoEmail = 'supervisor@example.com';
      break;
    case 'tecnico':
      demoEmail = 'tecnico@example.com';
      break;
  }
  
  email.value = demoEmail;
  password.value = 'password';
  
  await handleLogin();
}
</script> 