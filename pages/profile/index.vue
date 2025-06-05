<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-3xl font-extrabold mb-8 text-blue-500 dark:text-white tracking-tight">Configuración</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Sidebar de navegación -->
        <div class="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow">
          <ul class="space-y-2">
            <li>
              <button 
                @click="activeTab = 'profile'" 
                class="w-full text-left px-4 py-2 rounded-md transition-colors"
                :class="activeTab === 'profile' ? 'bg-blue-50 dark:bg-zinc-700 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-zinc-100'"
              >
                <span class="flex items-center">
                  <span class="material-icons mr-2">person</span>
                  Perfil
                </span>
              </button>
            </li>
            <li>
              <button 
                @click="activeTab = 'security'" 
                class="w-full text-left px-4 py-2 rounded-md transition-colors"
                :class="activeTab === 'security' ? 'bg-blue-50 dark:bg-zinc-700 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-zinc-100'"
              >
                <span class="flex items-center">
                  <span class="material-icons mr-2">security</span>
                  Seguridad
                </span>
              </button>
            </li>
            <li>
              <button 
                @click="activeTab = 'notifications'" 
                class="w-full text-left px-4 py-2 rounded-md transition-colors"
                :class="activeTab === 'notifications' ? 'bg-blue-50 dark:bg-zinc-700 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-zinc-100'"
              >
                <span class="flex items-center">
                  <span class="material-icons mr-2">notifications</span>
                  Notificaciones
                </span>
              </button>
            </li>
            <li>
              <button 
                @click="activeTab = 'appearance'" 
                class="w-full text-left px-4 py-2 rounded-md transition-colors"
                :class="activeTab === 'appearance' ? 'bg-blue-50 dark:bg-zinc-700 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 dark:text-zinc-100'"
              >
                <span class="flex items-center">
                  <span class="material-icons mr-2">palette</span>
                  Apariencia
                </span>
              </button>
            </li>
          </ul>
        </div>
        
        <!-- Contenido principal -->
        <div class="md:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow">
          <!-- Perfil -->
          <div v-if="activeTab === 'profile'">
            <h2 class="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Perfil de Usuario</h2>
            
            <form @submit.prevent="saveProfile">
              <div class="space-y-4">
                <div class="flex items-center mb-6">
                  <div class="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                    {{ getInitials(profile.nombre) }}
                  </div>
                  <div class="ml-4">
                    <button type="button" class="px-3 py-1 text-sm bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-100 rounded hover:bg-gray-300 dark:hover:bg-zinc-600">
                      Cambiar foto
                    </button>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Nombre</label>
                  <input 
                    v-model="profile.nombre" 
                    type="text" 
                    class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Email</label>
                  <input 
                    v-model="profile.email" 
                    type="email" 
                    class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Cargo</label>
                  <input 
                    v-model="profile.cargo" 
                    type="text" 
                    class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Teléfono</label>
                  <input 
                    v-model="profile.telefono" 
                    type="tel" 
                    class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Rol</label>
                  <div class="text-gray-700 dark:text-zinc-100 py-2">{{ getRoleName(profile.role) }}</div>
                </div>
                
                <div class="pt-4">
                  <button 
                    type="submit" 
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <!-- Seguridad -->
          <div v-if="activeTab === 'security'">
            <h2 class="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Seguridad</h2>
            
            <form @submit.prevent="changePassword">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Contraseña Actual</label>
                  <input 
                    v-model="security.currentPassword" 
                    type="password" 
                    class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Nueva Contraseña</label>
                  <input 
                    v-model="security.newPassword" 
                    type="password" 
                    class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Confirmar Nueva Contraseña</label>
                  <input 
                    v-model="security.confirmPassword" 
                    type="password" 
                    class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                  />
                </div>
                
                <div class="pt-4">
                  <button 
                    type="submit" 
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </form>
            
            <div class="mt-8 border-t pt-6">
              <h3 class="text-lg font-medium mb-4 text-zinc-900 dark:text-zinc-100">Sesiones Activas</h3>
              
              <div class="border rounded-md divide-y border-gray-300 dark:border-zinc-700">
                <div class="p-4">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-medium text-zinc-900 dark:text-zinc-100">Este dispositivo</div>
                      <div class="text-sm text-gray-500 dark:text-zinc-400">Windows · Chrome · Santiago, Chile</div>
                    </div>
                    <div>
                      <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                        Activo ahora
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Notificaciones -->
          <div v-if="activeTab === 'notifications'">
            <h2 class="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Preferencias de Notificaciones</h2>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between py-2 border-b">
                <div>
                  <div class="font-medium text-zinc-900 dark:text-zinc-100">Notificaciones por email</div>
                  <div class="text-sm text-gray-500 dark:text-zinc-400">Recibir notificaciones por correo electrónico</div>
                </div>
                <div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="notifications.email" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div class="flex items-center justify-between py-2 border-b">
                <div>
                  <div class="font-medium text-zinc-900 dark:text-zinc-100">Notificaciones de documentos</div>
                  <div class="text-sm text-gray-500 dark:text-zinc-400">Cuando un documento es validado o rechazado</div>
                </div>
                <div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="notifications.documents" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div class="flex items-center justify-between py-2 border-b">
                <div>
                  <div class="font-medium text-zinc-900 dark:text-zinc-100">Notificaciones de proyectos</div>
                  <div class="text-sm text-gray-500 dark:text-zinc-400">Cuando es asignado a un nuevo proyecto</div>
                </div>
                <div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="notifications.projects" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div class="pt-4">
                <button 
                  @click="saveNotifications" 
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Guardar Preferencias
                </button>
              </div>
            </div>
          </div>
          
          <!-- Apariencia -->
          <div v-if="activeTab === 'appearance'">
            <h2 class="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Apariencia</h2>
            
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-medium mb-3 text-zinc-900 dark:text-zinc-100">Tema</h3>
                <div class="grid grid-cols-3 gap-4">
                  <div 
                    class="border rounded-lg p-4 cursor-pointer flex flex-col items-center"
                    :class="{ 'border-blue-500 bg-blue-50': appearance.theme === 'light' }"
                    @click="appearance.theme = 'light'"
                  >
                    <div class="w-full h-20 bg-white border rounded-md mb-2"></div>
                    <span class="text-zinc-900 dark:text-zinc-100">Claro</span>
                  </div>
                  <div 
                    class="border rounded-lg p-4 cursor-pointer flex flex-col items-center"
                    :class="{ 'border-blue-500 bg-blue-50': appearance.theme === 'dark' }"
                    @click="appearance.theme = 'dark'"
                  >
                    <div class="w-full h-20 bg-gray-800 border rounded-md mb-2"></div>
                    <span class="text-zinc-900 dark:text-zinc-100">Oscuro</span>
                  </div>
                  <div 
                    class="border rounded-lg p-4 cursor-pointer flex flex-col items-center"
                    :class="{ 'border-blue-500 bg-blue-50': appearance.theme === 'system' }"
                    @click="appearance.theme = 'system'"
                  >
                    <div class="w-full h-20 bg-gradient-to-r from-white to-gray-800 border rounded-md mb-2"></div>
                    <span class="text-zinc-900 dark:text-zinc-100">Sistema</span>
                  </div>
                </div>
              </div>
              
              <div class="pt-4">
                <button 
                  @click="saveAppearance" 
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Guardar Preferencias
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import MainLayout from '~/components/layout/MainLayout.vue'

definePageMeta({
  middleware: ['auth']
})

const { user } = useAuth()
const { showToast } = useToast()

// Estado local
const activeTab = ref('profile')

// Datos de perfil
const profile = ref({
  nombre: 'Usuario Demo',
  email: 'demo@example.com',
  cargo: 'Supervisor de Proyectos',
  telefono: '+56 9 1234 5678',
  role: 'supervisor'
})

// Datos de seguridad
const security = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Notificaciones
const notifications = ref({
  email: true,
  documents: true,
  projects: true
})

// Apariencia
const appearance = ref({
  theme: 'light'
})

// Obtener iniciales del nombre
const getInitials = (name) => {
  if (!name) return 'U'
  
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0][0].toUpperCase()
}

// Obtener nombre del rol
const getRoleName = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'supervisor':
      return 'Supervisor'
    case 'tecnico':
      return 'Técnico'
    default:
      return role
  }
}

// Guardar perfil
const saveProfile = () => {
  showToast('Perfil guardado correctamente', 'success')
}

// Cambiar contraseña
const changePassword = () => {
  if (security.newPassword !== security.confirmPassword) {
    showToast('Las contraseñas no coinciden', 'error')
    return
  }
  showToast('Contraseña cambiada correctamente', 'success')
  security.currentPassword = ''
  security.newPassword = ''
  security.confirmPassword = ''
}

// Guardar preferencias de notificaciones
const saveNotifications = () => {
  showToast('Preferencias de notificaciones guardadas', 'success')
}

// Guardar preferencias de apariencia
const saveAppearance = () => {
  showToast('Preferencias de apariencia guardadas', 'success')
}

// Cargar datos del usuario al montar
onMounted(() => {
  if (user.value) {
    profile.value.nombre = user.value.nombre || 'Usuario Demo'
    profile.value.email = user.value.email || 'demo@example.com'
    profile.value.role = user.value.role || 'supervisor'
  }
})
</script> 