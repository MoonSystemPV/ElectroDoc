<template>
  <div class="min-h-screen bg-gray-50 dark:bg-zinc-900">
    <div class="flex h-screen overflow-hidden">
      <!-- Mobile Sidebar - Overlay (se muestra cuando isMobileMenuOpen es true) -->
      <div v-if="isMobileMenuOpen" 
           class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
           @click="isMobileMenuOpen = false">
      </div>
      
      <!-- Sidebar - Desktop (md+) fixed, Mobile slide-over -->
      <div :class="[
             'transition-all duration-300 z-50',
             'fixed inset-y-0 left-0 w-72 flex flex-col',
             isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
           ]">
        <div class="flex flex-col w-full h-full">
          <div class="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-zinc-800 dark:to-zinc-900 border-r border-gray-200 dark:border-zinc-700">
            <!-- Close button - Mobile only -->
            <div class="flex items-center justify-between px-4 md:hidden">
              <div class="h-16 w-16 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-lg overflow-hidden">
                <img src="/images/Logo.png" alt="Logo ElectroDoc" class="w-full h-full object-cover" />
              </div>
              <button @click="isMobileMenuOpen = false" class="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
                <span class="material-icons">close</span>
              </button>
            </div>
            
            <!-- Logo Container - Desktop only -->
            <div class="hidden md:flex items-center justify-center mb-8">
              <div class="h-28 w-28 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-lg overflow-hidden">
                <img src="/images/Logo.png" alt="Logo ElectroDoc" class="w-full h-full object-cover" />
              </div>
            </div>

            <!-- Navigation -->
            <nav class="mt-6 flex-1 px-4 space-y-2">
              <NuxtLink 
                to="/dashboard" 
                class="group flex items-center px-4 py-3 text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-icons mr-4 text-2xl text-blue-500 dark:text-blue-400 group-hover:animate-pulse">dashboard</span>
                Dashboard
              </NuxtLink>

              <NuxtLink 
                v-if="user && (user.role === 'admin' || user.role === 'tecnico')"
                to="/tareas" 
                class="group flex items-center px-4 py-3 text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-icons mr-4 text-2xl text-blue-500 dark:text-blue-400 group-hover:animate-pulse">task</span>
                Tareas
              </NuxtLink>

              <NuxtLink 
                to="/projects" 
                class="group flex items-center px-4 py-3 text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-icons mr-4 text-2xl text-blue-500 dark:text-blue-400 group-hover:animate-pulse">engineering</span>
                Proyectos
              </NuxtLink>

              <NuxtLink 
                to="/documents" 
                class="group flex items-center px-4 py-3 text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-icons mr-4 text-2xl text-blue-500 dark:text-blue-400 group-hover:animate-pulse">description</span>
                Documentos
              </NuxtLink>

              <NuxtLink 
                to="/profile" 
                class="group flex items-center px-4 py-3 text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                @click="isMobileMenuOpen = false"
              >
                <span class="material-icons mr-4 text-2xl text-blue-500 dark:text-blue-400 group-hover:animate-pulse">person</span>
                Perfil
              </NuxtLink>

              <!-- Admin Section -->
              <div v-if="isAdmin" class="pt-4 mt-4 border-t border-gray-200 dark:border-zinc-700">
                <h3 class="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Administración
                </h3>
                <div class="mt-2 space-y-2">
                  <NuxtLink 
                    to="/admin" 
                    class="group flex items-center px-4 py-3 text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                    active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    @click="isMobileMenuOpen = false"
                  >
                    <span class="material-icons mr-4 text-2xl text-blue-500 dark:text-blue-400 group-hover:animate-pulse">settings</span>
                    Usuarios
                  </NuxtLink>
                </div>
              </div>
            </nav>

            <!-- User Info -->
            <div class="px-4 mt-8">
              <div class="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-zinc-700">
                <div class="flex items-center space-x-3">
                  <div class="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-0.5">
                    <div class="h-full w-full rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center">
                      <span class="text-lg font-medium text-blue-600 dark:text-blue-400">
                        {{ getUserInitials(user?.nombre) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ user?.nombre }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ user?.email }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Logout button -->
            <div class="px-4 mt-4 mb-6">
              <button
                @click="handleLogout"
                class="w-full flex items-center px-4 py-3 text-base font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105"
              >
                <span class="material-icons mr-4 text-2xl text-red-500 dark:text-red-400">logout</span>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content - With offset for fixed sidebar -->
      <div class="flex flex-col flex-1 md:pl-72">
        <!-- Top header -->
        <header class="bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-30">
          <div class="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <!-- Mobile menu button -->
            <button 
              type="button" 
              class="md:hidden text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              @click="isMobileMenuOpen = true"
            >
              <span class="material-icons">menu</span>
            </button>

            <!-- Search -->
            <div class="flex-1 max-w-lg px-2 lg:px-8 hidden sm:block">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="material-icons text-gray-400">search</span>
                </div>
                <input
                  type="text"
                  placeholder="Buscar..."
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-xl leading-5 bg-white dark:bg-zinc-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <!-- Right side buttons -->
            <div class="flex items-center space-x-4">
              <!-- Dark mode toggle -->
              <button
                @click="toggleDarkMode"
                class="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <span class="material-icons text-2xl transform transition-transform duration-200 hover:rotate-45">
                  {{ isDarkMode ? 'light_mode' : 'dark_mode' }}
                </span>
              </button>
            </div>
          </div>
        </header>

        <!-- Main content area -->
        <main class="flex-1 overflow-y-auto">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <slot />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const { user, logout } = useAuth()
const router = useRouter()

// Mobile menu state
const isMobileMenuOpen = ref(false)

// Dark mode
const isDarkMode = ref(false)

// Handle resize to auto-close mobile menu on larger screens
const handleResize = () => {
  if (window.innerWidth >= 768 && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateTheme()
  
  // Add resize listener
  window.addEventListener('resize', handleResize)
  
  // Clean up
  return () => {
    window.removeEventListener('resize', handleResize)
  }
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  updateTheme()
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const updateTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const handleLogout = async () => {
  isMobileMenuOpen.value = false
  await logout()
  router.push('/auth/login')
}

// Get user initials
const getUserInitials = (name) => {
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return parts[0][0].toUpperCase()
}

// Admin check
const isAdmin = computed(() => {
  return user.value?.role === 'admin' || user.value?.role === 'administrativo'
})
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

/* Para mejorar la experiencia en dispositivos móviles */
@media (max-width: 768px) {
  .scrollbar-hide {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
}
</style>