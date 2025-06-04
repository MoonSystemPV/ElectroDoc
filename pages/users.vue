<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <h1 class="text-3xl font-extrabold mb-8 text-pink-500 dark:text-pink-400 tracking-tight">Usuarios</h1>
      <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 transition-colors">
        <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <input v-model="searchQuery" type="text" placeholder="Buscar usuarios..." class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition w-full md:w-72" />
          <select v-model="filterRole" class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition w-full md:w-60">
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="supervisor">Supervisores</option>
            <option value="tecnico">Técnicos</option>
          </select>
          <button @click="showAddUserModal = true" class="ml-auto flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-semibold px-6 py-2 rounded-xl shadow transition">
            <span class="material-icons">person_add</span> Añadir Usuario
          </button>
        </div>

        <div v-if="isLoading" class="text-center p-8">
          <div class="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-2 text-zinc-600 dark:text-zinc-400">Cargando usuarios...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center p-8">
          <p class="text-lg text-zinc-500 dark:text-zinc-400">No se encontraron usuarios</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Rol</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Fecha Creación</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-700">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
                <td class="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-pink-200 dark:bg-pink-400 flex items-center justify-center text-pink-700 dark:text-white font-bold text-lg">
                    {{ getInitials(user.nombre) }}
                  </div>
                  <span class="font-semibold text-zinc-800 dark:text-zinc-100">{{ user.nombre }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-zinc-700 dark:text-zinc-100">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="{
                      'bg-pink-100 dark:bg-pink-500 text-pink-700 dark:text-white': user.role === 'admin',
                      'bg-cyan-100 dark:bg-cyan-500 text-cyan-700 dark:text-white': user.role === 'supervisor',
                      'bg-green-100 dark:bg-green-500 text-green-700 dark:text-white': user.role === 'tecnico'
                    }">
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-300">{{ formatDate(user.fechaCreacion) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                  <button @click="resetPassword(user)" class="text-blue-600 dark:text-blue-400 hover:underline" :disabled="user.role === 'admin' || user.role === 'administrativo'">Cambiar Contraseña</button>
                  <button @click="confirmDeleteUser(user)" class="text-red-600 dark:text-red-400 hover:underline" :disabled="user.role === 'admin' || user.role === 'administrativo'">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Añadir Usuario -->
      <div v-if="showAddUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Añadir Usuario</h2>
          
          <div v-if="error" class="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="material-icons text-red-400">error</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="addUser">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombre</label>
                <input 
                  v-model="newUser.nombre" 
                  type="text" 
                  required 
                  class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition"
                  placeholder="Nombre completo"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
                <input 
                  v-model="newUser.email" 
                  type="email" 
                  required 
                  class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Rol</label>
                <select 
                  v-model="newUser.role" 
                  required 
                  class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition"
                >
                  <option value="supervisor">Supervisor</option>
                  <option value="tecnico">Técnico</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Contraseña</label>
                <input 
                  v-model="newUser.password" 
                  type="password" 
                  required 
                  class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition"
                  placeholder="Contraseña"
                />
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Mínimo 6 caracteres</p>
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button 
                type="button" 
                @click="showAddUserModal = false" 
                class="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white rounded-lg transition"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
                Añadir Usuario
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Cambiar Contraseña -->
      <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Cambiar Contraseña</h2>
          
          <div v-if="error" class="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="material-icons text-red-400">error</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="handlePasswordChange">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Usuario</label>
                <div class="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-800 dark:text-zinc-100">
                  {{ selectedUser?.nombre }} ({{ selectedUser?.email }})
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nueva Contraseña</label>
                <input 
                  v-model="newPassword" 
                  type="password" 
                  required 
                  class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition"
                  placeholder="Nueva contraseña"
                  minlength="6"
                />
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button 
                type="button" 
                @click="showPasswordModal = false" 
                class="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white rounded-lg transition"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
                Cambiar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Eliminar Usuario -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Confirmar Eliminación</h2>
          
          <p class="mb-4 text-zinc-700 dark:text-zinc-300">¿Está seguro de que desea eliminar al usuario <strong>{{ selectedUser?.nombre }}</strong>?</p>
          <p class="text-sm text-red-600 dark:text-red-400 mb-6">Esta acción no se puede deshacer.</p>
          
          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showDeleteModal = false" 
              class="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
            >
              Cancelar
            </button>
            <button 
              @click="handleDeleteUser" 
              class="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
              Eliminar
            </button>
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
  middleware: ['auth', 'admin']
})

const { user, createUser, changePassword, getAllUsers, deleteUser, isLoading: authLoading, error: authError } = useAuth()
const { showToast } = useToast()

// Estado
const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const filterRole = ref('all')

// Estado para modal de creación de usuario
const showAddUserModal = ref(false)
const newUser = ref({
  nombre: '',
  email: '',
  role: 'tecnico',
  password: ''
})

// Estado para modal de cambio de contraseña
const showPasswordModal = ref(false)
const selectedUser = ref(null)
const newPassword = ref('')

// Estado para modal de eliminación
const showDeleteModal = ref(false)

// Cargar usuarios al montar el componente
onMounted(async () => {
  await loadUsers()
})

// Función para cargar usuarios
async function loadUsers() {
  isLoading.value = true
  error.value = null
  
  try {
    users.value = await getAllUsers()
    console.log('Usuarios cargados:', users.value.length)
  } catch (err) {
    console.error('Error al cargar usuarios:', err)
    error.value = 'Error al cargar usuarios'
  } finally {
    isLoading.value = false
  }
}

// Usuarios filtrados
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // Filtrar por rol
    if (filterRole.value !== 'all' && user.role !== filterRole.value) {
      return false
    }
    
    // Filtrar por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return (
        user.nombre.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    }
    
    return true
  })
})

// Funciones para la gestión de usuarios
async function addUser() {
  isLoading.value = true
  error.value = null
  
  try {
    const success = await createUser(newUser.value)
    
    if (success) {
      showAddUserModal.value = false
      showToast(`Usuario ${newUser.value.nombre} creado correctamente.`, 'success')
      newUser.value = {
        nombre: '',
        email: '',
        role: 'tecnico',
        password: ''
      }
      await loadUsers() // Recargar la lista de usuarios
    } else {
      error.value = authError.value
    }
  } catch (err) {
    console.error('Error al crear usuario:', err)
    error.value = 'Error al crear usuario'
  } finally {
    isLoading.value = false
  }
}

function resetPassword(user) {
  selectedUser.value = user
  newPassword.value = ''
  showPasswordModal.value = true
}

async function handlePasswordChange() {
  if (!selectedUser.value) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const success = await changePassword(selectedUser.value.id, newPassword.value)
    
    if (success) {
      showPasswordModal.value = false
      selectedUser.value = null
      newPassword.value = ''
      showToast('Contraseña cambiada correctamente', 'success')
    } else {
      error.value = authError.value
    }
  } catch (err) {
    console.error('Error al cambiar contraseña:', err)
    error.value = 'Error al cambiar contraseña'
  } finally {
    isLoading.value = false
  }
}

function confirmDeleteUser(user) {
  selectedUser.value = user
  showDeleteModal.value = true
}

async function handleDeleteUser() {
  if (!selectedUser.value) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const success = await deleteUser(selectedUser.value.id)
    
    if (success) {
      showDeleteModal.value = false
      showToast(`Usuario ${selectedUser.value.nombre} eliminado correctamente.`, 'error')
      users.value = users.value.filter(u => u.id !== selectedUser.value.id)
      selectedUser.value = null
    } else {
      error.value = authError.value
    }
  } catch (err) {
    console.error('Error al eliminar usuario:', err)
    error.value = 'Error al eliminar usuario'
  } finally {
    isLoading.value = false
  }
}

// Funciones de utilidad
function getInitials(name) {
  if (!name) return 'U'
  
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return parts[0][0].toUpperCase()
}

function getRoleName(role) {
  switch (role) {
    case 'admin':
    case 'administrativo':
      return 'Administrador'
    case 'supervisor':
      return 'Supervisor'
    case 'tecnico':
      return 'Técnico'
    default:
      return role
  }
}

function formatDate(date) {
  if (!date) return 'Fecha desconocida'
  
  try {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (e) {
    return 'Fecha inválida'
  }
}
</script> 