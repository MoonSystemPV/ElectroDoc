<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">ElectroDoc</h1>
        <h2 class="mt-2 text-sm text-gray-600">Sistema de Gestión Documental para Proyectos Eléctricos</h2>
      </div>
      
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="mb-6 text-center">
            <h2 class="text-xl font-bold text-gray-900">Restablecer Contraseña</h2>
            <p class="mt-1 text-sm text-gray-500">Ingresa tu correo electrónico para recibir un enlace de restablecimiento</p>
          </div>
          
          <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ successMessage }}
            <div class="mt-2">
              <NuxtLink to="/login" class="text-blue-600 hover:text-blue-800 font-medium">
                Volver al inicio de sesión
              </NuxtLink>
            </div>
          </div>
          
          <div v-else>
            <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {{ error }}
            </div>
            
            <form @submit.prevent="requestPasswordReset" class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando solicitud...
                  </span>
                  <span v-else>Enviar enlace de restablecimiento</span>
                </button>
              </div>
              
              <div class="text-center mt-4">
                <NuxtLink to="/login" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Volver al inicio de sesión
                </NuxtLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  middleware: 'guest',
  layout: 'blank'
})

// Composables
const { requestPasswordReset: resetPassword, isLoading, error } = useAuth()

// State
const email = ref('')
const successMessage = ref('')

// Methods
const requestPasswordReset = async () => {
  const success = await resetPassword(email.value)
  
  if (success) {
    successMessage.value = 'Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.'
    email.value = ''
  }
}
</script>