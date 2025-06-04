<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300">
    <div class="bg-white dark:bg-zinc-800 p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center gap-6">
      <div class="flex flex-col items-center mb-2">
        <div class="h-28 w-28 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-lg overflow-hidden">
          <img src="/images/Logo.png" alt="Logo ElectroDoc" class="w-full h-full object-cover" />
        </div>
      </div>
      <span class="text-3xl font-bold text-pink-500 dark:text-pink-400 mb-2 tracking-tight">Iniciar Sesión</span>
      <form class="w-full flex flex-col gap-6" @submit.prevent="handleLogin">
        <div>
          <label class="block text-zinc-700 dark:text-zinc-200 mb-2">Correo electrónico</label>
          <input v-model="email" type="email" class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-pink-200 dark:border-pink-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none transition" />
        </div>
        <div>
          <label class="block text-zinc-700 dark:text-zinc-200 mb-2">Contraseña</label>
          <div class="relative">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-pink-200 dark:border-pink-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none transition pr-12" />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-300 hover:text-pink-400 dark:hover:text-pink-300 focus:outline-none">
              <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 text-zinc-700 dark:text-zinc-200 text-sm">
            <input type="checkbox" v-model="rememberMe" class="rounded border-zinc-300 dark:border-zinc-600 focus:ring-pink-400" />
            Recuérdame
          </label>
          <NuxtLink to="/auth/reset-password" class="text-pink-500 dark:text-pink-400 hover:underline text-sm">¿Olvidaste tu contraseña?</NuxtLink>
        </div>
        <button type="submit" class="bg-pink-500 hover:bg-pink-400 text-white font-semibold py-3 rounded-xl shadow transition">Entrar</button>
        <div class="flex items-center gap-2 my-2">
          <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-700"></div>
          <span class="text-zinc-400 dark:text-zinc-500 text-xs">o</span>
          <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-700"></div>
        </div>
        <button type="button" class="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-100 font-semibold shadow hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="h-6 w-6" />
          Iniciar sesión con Google
        </button>
      </form>
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
const showPassword = ref(false)

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