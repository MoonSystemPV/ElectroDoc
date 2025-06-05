<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300">
    <div class="bg-white dark:bg-zinc-800 p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center gap-6">
      <div class="flex flex-col items-center mb-2">
        <div class="h-28 w-28 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-lg overflow-hidden">
          <img src="/images/Logo.png" alt="Logo ElectroDoc" class="w-full h-full object-cover" />
        </div>
      </div>
      <span class="text-3xl font-extrabold mb-4 text-blue-500 dark:text-white tracking-tight">Recuperar Contraseña</span>
      
      <!-- Mensaje de éxito -->
      <div v-if="successMessage" class="w-full bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-lg shadow-md animate-pulse-once">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="material-icons text-green-500 mr-2">check_circle</span>
          </div>
          <div class="ml-2">
            <p class="font-bold">¡Correo enviado!</p>
            <p>{{ successMessage }}</p>
            <div class="mt-4">
              <NuxtLink to="/auth/login" class="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
                <span class="material-icons mr-2 text-sm">arrow_back</span>
                Volver a iniciar sesión
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Formulario de recuperación -->
      <template v-else>
        <!-- Mensaje de error -->
        <div v-if="error" class="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg shadow-md animate-pulse-once">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <span class="material-icons text-red-500 mr-2">error</span>
            </div>
            <div class="ml-2">
              <p class="font-bold">Error</p>
              <p>{{ error }}</p>
            </div>
          </div>
        </div>
        
        <p class="text-zinc-500 dark:text-zinc-300 text-center mb-4">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        
        <form @submit.prevent="handleResetPassword" class="w-full flex flex-col gap-6">
          <div>
            <label class="block text-zinc-700 dark:text-zinc-200 mb-2">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-blue-200 dark:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
              :class="{ 'border-red-500 dark:border-red-400': error }"
              placeholder="tu@correo.com"
            />
          </div>
          
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-xl shadow transition flex justify-center items-center"
            :class="{ 'opacity-75 cursor-not-allowed': isLoading }"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="animate-spin mr-3">
              <span class="material-icons">refresh</span>
            </span>
            {{ isLoading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
          </button>
          
          <div class="text-center mt-4">
            <NuxtLink to="/auth/login" class="text-blue-500 dark:text-blue-400 hover:underline">
              Volver a iniciar sesión
            </NuxtLink>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

// No necesitamos definePageMeta porque ya no tenemos ese middleware "guest" 
// y no usamos un layout específico

// Composables
const { requestPasswordReset, isLoading, error } = useAuth()

// State
const email = ref('')
const successMessage = ref('')

// Methods
const handleResetPassword = async () => {
  if (!email.value) return
  
  const success = await requestPasswordReset(email.value)
  
  if (success) {
    successMessage.value = `Se ha enviado un enlace a ${email.value} para restablecer tu contraseña.`
    email.value = ''
  }
}
</script>

<style scoped>
@keyframes pulse-once {
  0% { opacity: 0; transform: scale(0.95); }
  70% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}

.animate-pulse-once {
  animation: pulse-once 0.5s ease-out forwards;
}
</style>