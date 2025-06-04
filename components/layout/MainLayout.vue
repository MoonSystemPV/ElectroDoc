<template>
  <div class="min-h-screen flex font-sans bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300">
    <!-- Sidebar Navigation -->
    <aside class="w-72 bg-white dark:bg-zinc-800 shadow-2xl hidden md:flex flex-col transition-all duration-300">
      <div class="flex flex-col items-center gap-3 py-8 border-b border-zinc-200 dark:border-zinc-700">
        <div class="h-24 w-24 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-lg mb-2 border-4 border-zinc-100 dark:border-zinc-700 overflow-hidden">
          <img src="/images/Logo.png" alt="Logo ElectroDoc" class="w-full h-full object-cover" />
        </div>
        <span class="text-2xl font-extrabold text-pink-500 dark:text-pink-400 tracking-tight">ElectroDoc</span>
      </div>
      <nav class="flex-1 px-6 py-8 flex flex-col gap-2">
        <NuxtLink to="/dashboard" class="sidebar-link" active-class="sidebar-link-active">
          <span class="material-icons mr-3">dashboard</span>
          Dashboard
        </NuxtLink>
        <NuxtLink to="/projects" class="sidebar-link" active-class="sidebar-link-active">
          <span class="material-icons mr-3">work</span>
          Proyectos
        </NuxtLink>
        <NuxtLink to="/documents" class="sidebar-link" active-class="sidebar-link-active">
          <span class="material-icons mr-3">description</span>
          Documentos
        </NuxtLink>
        <NuxtLink to="/users" class="sidebar-link" active-class="sidebar-link-active">
          <span class="material-icons mr-3">people</span>
          Usuarios
        </NuxtLink>
        <NuxtLink to="/settings" class="sidebar-link" active-class="sidebar-link-active">
          <span class="material-icons mr-3">settings</span>
          Configuración
        </NuxtLink>
      </nav>
      <div class="mt-auto px-6 py-6 border-t border-zinc-200 dark:border-zinc-700 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-pink-500 dark:bg-pink-400 flex items-center justify-center text-white font-bold text-xl shadow-md">
          {{ getUserInitials() }}
        </div>
        <div class="flex-1">
          <div class="text-zinc-800 dark:text-zinc-100 font-semibold leading-tight">{{ getUserName() }}</div>
          <div v-if="isAdmin" class="text-xs text-pink-500 dark:text-pink-300 font-semibold">Admin</div>
        </div>
        <button @click="handleLogout" class="ml-2 p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-pink-500 dark:hover:bg-pink-400 transition text-zinc-800 dark:text-white" title="Cerrar sesión">
          <span class="material-icons">logout</span>
        </button>
      </div>
    </aside>
    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Header superior -->
      <header class="flex items-center justify-between gap-4 px-8 py-5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-lg transition-colors duration-300">
        <!-- Mobile menu button -->
        <button @click="sidebarOpen = !sidebarOpen" class="md:hidden p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700">
          <span class="material-icons">menu</span>
        </button>
        <!-- Logo y nombre en mobile -->
        <div class="flex items-center gap-2 md:hidden">
          <div class="h-12 w-12 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow border-2 border-zinc-100 dark:border-zinc-700 overflow-hidden">
            <img src="/images/Logo.png" alt="Logo ElectroDoc" class="w-full h-full object-cover" />
          </div>
          <span class="text-xl font-bold text-pink-500 dark:text-pink-400">ElectroDoc</span>
        </div>
        <!-- Buscador grande -->
        <div class="flex-1 flex justify-center">
          <div class="relative w-full max-w-2xl">
            <input type="text" placeholder="Buscar en ElectroDoc..." class="w-full px-7 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-pink-200 dark:border-pink-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-400 outline-none transition text-lg shadow placeholder-zinc-400 dark:placeholder-zinc-500" />
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 dark:text-pink-300">search</span>
          </div>
        </div>
        <!-- Switch modo oscuro/claro -->
        <button @click="toggleTheme" class="ml-4 p-2 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-pink-500 dark:hover:bg-pink-400 transition text-zinc-800 dark:text-white flex items-center justify-center shadow" :title="isDark ? 'Modo claro' : 'Modo oscuro'">
          <span v-if="isDark" class="material-icons text-yellow-400">light_mode</span>
          <span v-else class="material-icons text-zinc-500">dark_mode</span>
        </button>
        <!-- Logout (mobile) -->
        <button @click="handleLogout" class="md:hidden ml-2 p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-pink-500 dark:hover:bg-pink-400 transition text-zinc-800 dark:text-white">
          <span class="material-icons">logout</span>
        </button>
      </header>
      <!-- Page Content -->
      <main class="flex-1 p-6 md:p-12 overflow-auto bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, logout, isAdmin } = useAuth()
const sidebarOpen = ref(false)
const isDark = ref(true)

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    document.body.classList.add('bg-zinc-900')
    document.body.classList.remove('bg-zinc-100')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('bg-zinc-900')
    document.body.classList.add('bg-zinc-100')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  // Leer preferencia de tema
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
    document.body.classList.add('bg-zinc-900')
    document.body.classList.remove('bg-zinc-100')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('bg-zinc-900')
    document.body.classList.add('bg-zinc-100')
  } else {
    // Si no hay preferencia, usar el sistema
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('bg-zinc-900')
      document.body.classList.remove('bg-zinc-100')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('bg-zinc-900')
      document.body.classList.add('bg-zinc-100')
    }
  }
})

async function handleLogout() {
  try {
    const success = await logout()
    if (success) {
      router.push('/login')
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

function getUserInitials() {
  if (!user.value || !user.value.nombre) return 'U'
  const nameParts = user.value.nombre.split(' ')
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
  }
  return nameParts[0][0].toUpperCase()
}

function getUserName() {
  return user.value?.nombre || 'Usuario'
}
</script>

<style scoped>
.sidebar-link {
  @apply flex items-center px-5 py-3 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-pink-100 dark:hover:bg-pink-500 hover:text-pink-700 dark:hover:text-white transition font-semibold text-lg gap-2;
}
.sidebar-link-active {
  @apply bg-pink-100 dark:bg-pink-500 text-pink-700 dark:text-white shadow;
}
</style>