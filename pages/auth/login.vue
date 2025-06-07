<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300">
    <div class="bg-white dark:bg-zinc-800 p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center gap-6">
      <div class="flex flex-col items-center mb-2">
        <div class="h-28 w-28 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-lg overflow-hidden">
          <img src="/images/Logo.png" alt="Logo ElectroDoc" class="w-full h-full object-cover" />
        </div>
      </div>
      <span class="text-3xl font-extrabold mb-4 text-blue-500 dark:text-white tracking-tight">Iniciar Sesión</span>
      
      <!-- Alerta de error -->
      <div v-if="authError" class="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg shadow-md animate-pulse-once">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="material-icons text-red-500 mr-2">error</span>
          </div>
          <div class="ml-2">
            <p class="font-bold">Error de autenticación</p>
            <p>{{ authError }}</p>
            <p v-if="authError.includes('Demasiados intentos')" class="mt-2 text-sm">
              Sugerencia: Puedes <NuxtLink to="/auth/reset-password" class="text-blue-600 underline">restablecer tu contraseña</NuxtLink> para desbloquear tu cuenta.
            </p>
          </div>
        </div>
      </div>
      
      <form class="w-full flex flex-col gap-6" @submit.prevent="handleLogin">
        <div>
          <label class="block text-zinc-700 dark:text-zinc-200 mb-2">Correo electrónico</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-blue-200 dark:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" 
            :class="{ 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-400': authError }"
            required
          />
        </div>
        <div>
          <label class="block text-zinc-700 dark:text-zinc-200 mb-2">Contraseña</label>
          <div class="relative">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-blue-200 dark:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition pr-12" 
              :class="{ 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-400': authError }"
              required
              autocomplete="current-password"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-300 hover:text-blue-400 dark:hover:text-blue-300 focus:outline-none">
              <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <p v-if="passwordStrength === 'weak' && password" class="mt-1 text-orange-500 text-xs flex items-center">
            <span class="material-icons text-xs mr-1">warning</span> Contraseña débil
          </p>
        </div>
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 text-zinc-700 dark:text-zinc-200 text-sm">
            <input type="checkbox" v-model="rememberMe" class="rounded border-zinc-300 dark:border-zinc-600 focus:ring-blue-400" />
            Recuérdame
          </label>
          <NuxtLink to="/auth/reset-password" class="text-blue-500 dark:text-blue-400 hover:underline text-sm">¿Olvidaste tu contraseña?</NuxtLink>
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
          {{ isLoading ? 'Iniciando sesión...' : 'Entrar' }}
        </button>
        <div class="flex items-center gap-2 my-2">
          <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-700"></div>
          <span class="text-zinc-400 dark:text-zinc-500 text-xs">o</span>
          <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-700"></div>
        </div>
        <button 
          type="button" 
          @click="handleGoogleLogin"
          class="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-100 font-semibold shadow hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          :disabled="isLoading"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="h-6 w-6" />
          <span v-if="isLoading">Iniciando sesión...</span>
          <span v-else>Iniciar sesión con Google</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { useToast } from '~/composables/useToast'

const router = useRouter()
const { login, loginWithGoogle, isLoading, error: authError, initAuth } = useAuth()
const { showToast } = useToast()

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

// Calcular fuerza de contraseña
const passwordStrength = computed(() => {
  if (!password.value || password.value.length < 6) {
    return 'weak'
  }
  const hasUpperCase = /[A-Z]/.test(password.value)
  const hasLowerCase = /[a-z]/.test(password.value)
  const hasNumbers = /\d/.test(password.value)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password.value)
  
  const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length
  
  if (score >= 3 && password.value.length >= 8) {
    return 'strong'
  } else if (score >= 2 && password.value.length >= 6) {
    return 'medium'
  } else {
    return 'weak'
  }
})

// Limpiar mensaje de error cuando cambia la contraseña
watch(password, () => {
  if (authError.value) {
    authError.value = null
  }
})

// Inicializar autenticación cuando la página se carga
onMounted(() => {
  // Iniciar el listener de autenticación
  const unsubscribe = initAuth()
})

// Handle login form submission
const handleLogin = async () => {
  if (!email.value || !password.value) {
    showToast('Por favor completa todos los campos', 'error')
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
      // El mensaje de error ya está en authError
    }
  } catch (err) {
    console.error('Error de excepción en login:', err)
  }
}

// Handle Google login
const handleGoogleLogin = async () => {
  try {
    const success = await loginWithGoogle()
    if (success) {
      showToast('Inicio de sesión exitoso', 'success')
      router.push('/dashboard')
    } else if (authError.value) {
      showToast(authError.value, 'error')
    }
  } catch (err) {
    console.error('Error en login con Google:', err)
    showToast('Error al iniciar sesión con Google', 'error')
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