<script setup>
import { useAuth } from '~/composables/useAuth'

// Obtener estado de autenticación y rol para mostrar opciones según permisos
const { user, isAdmin } = useAuth();

// Opciones de navegación
const navItems = [
  { 
    label: 'Dashboard', 
    icon: 'dashboard', 
    route: '/dashboard',
    showFor: ['admin', 'supervisor', 'tecnico', 'administrativo']
  },
  { 
    label: 'Proyectos', 
    icon: 'engineering', 
    route: '/projects',
    showFor: ['admin', 'supervisor', 'tecnico', 'administrativo']
  },
  { 
    label: 'Documentos', 
    icon: 'description', 
    route: '/documents',
    showFor: ['admin', 'supervisor', 'tecnico', 'administrativo']
  },
  { 
    label: 'Usuarios', 
    icon: 'group', 
    route: '/users',
    showFor: ['admin', 'administrativo'] // Para ambos roles de administrador
  },
  { 
    label: 'Configuración', 
    icon: 'settings', 
    route: '/settings',
    showFor: ['admin', 'supervisor', 'administrativo']
  }
]

// Filtrar las opciones de navegación según el rol del usuario
const filteredNavItems = computed(() => {
  return navItems.filter(item => {
    return item.showFor.includes(user.value?.role || 'none');
  });
});
</script>

<template>
  <nav class="bg-gray-800 text-white w-64 h-screen flex flex-col">
    <div class="p-4 flex items-center border-b border-gray-700">
      <span class="material-icons text-blue-400 mr-2">bolt</span>
      <h1 class="text-xl font-bold">ElectroDoc</h1>
    </div>
    
    <div class="p-4 flex items-center border-b border-gray-700">
      <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
        {{ user?.nombre?.charAt(0) || 'U' }}
      </div>
      <div class="ml-2">
        <div class="text-sm font-medium">{{ user?.nombre || 'Usuario' }}</div>
        <div class="text-xs text-gray-400">{{ user?.email }}</div>
      </div>
    </div>
    
    <ul class="flex-1 py-4">
      <li v-for="item in filteredNavItems" :key="item.route">
        <NuxtLink 
          :to="item.route" 
          class="flex items-center px-6 py-3 hover:bg-gray-700"
          :class="{ 'bg-gray-700': $route.path === item.route }"
        >
          <span class="material-icons mr-3">{{ item.icon }}</span>
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
    
    <div class="p-4 border-t border-gray-700">
      <button 
        @click="$emit('logout')" 
        class="w-full flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
      >
        <span class="material-icons mr-3">logout</span>
        Cerrar sesión
      </button>
    </div>
  </nav>
</template> 