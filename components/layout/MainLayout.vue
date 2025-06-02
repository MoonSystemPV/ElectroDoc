<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar Navigation -->
    <aside class="w-64 bg-white shadow-md hidden md:block">
      <div class="p-4 border-b">
        <h1 class="text-xl font-bold text-blue-600">ElectroDoc</h1>
      </div>
      <nav class="p-4">
        <ul class="space-y-2">
          <li>
            <NuxtLink to="/dashboard" class="flex items-center p-2 rounded-md hover:bg-gray-100" active-class="bg-blue-50 text-blue-600">
              <span class="material-icons mr-2">dashboard</span>
              Dashboard
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/projects" class="flex items-center p-2 rounded-md hover:bg-gray-100" active-class="bg-blue-50 text-blue-600">
              <span class="material-icons mr-2">work</span>
              Proyectos
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/documents" class="flex items-center p-2 rounded-md hover:bg-gray-100" active-class="bg-blue-50 text-blue-600">
              <span class="material-icons mr-2">description</span>
              Documentos
            </NuxtLink>
          </li>
          <li v-if="isAdmin">
            <NuxtLink to="/users" class="flex items-center p-2 rounded-md hover:bg-gray-100" active-class="bg-blue-50 text-blue-600">
              <span class="material-icons mr-2">people</span>
              Usuarios
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/settings" class="flex items-center p-2 rounded-md hover:bg-gray-100" active-class="bg-blue-50 text-blue-600">
              <span class="material-icons mr-2">settings</span>
              Configuración
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top Navigation -->
      <header class="bg-white shadow-sm">
        <div class="px-4 py-3 flex justify-between items-center">
          <!-- Mobile Menu Button -->
          <button class="md:hidden p-2 rounded-md hover:bg-gray-100">
            <span class="material-icons">menu</span>
          </button>
          
          <!-- Search -->
          <div class="flex-1 mx-4 hidden md:block">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <span class="material-icons text-sm">search</span>
              </span>
              <input 
                type="text" 
                placeholder="Buscar..." 
                class="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="relative">
              <button class="flex items-center space-x-1 focus:outline-none">
                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <span class="text-sm font-medium">{{ getUserInitials() }}</span>
                </div>
                <span class="hidden md:inline-block font-medium">
                  {{ getUserName() }}
                  <span v-if="isAdmin" class="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Admin</span>
                </span>
                <span class="material-icons text-sm">arrow_drop_down</span>
              </button>
            </div>
            <button @click="handleLogout" class="p-2 rounded-md hover:bg-gray-100" title="Cerrar sesión">
              <span class="material-icons">logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, logout, isAdmin } = useAuth()

// Manejar el cierre de sesión
async function handleLogout() {
  try {
    console.log('Intentando cerrar sesión...')
    const success = await logout()
    if (success) {
      console.log('Redirigiendo a login después de cerrar sesión')
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