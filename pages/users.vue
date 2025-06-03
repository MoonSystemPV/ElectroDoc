<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center space-x-2">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar usuarios..." 
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select 
              v-model="filterRole" 
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="supervisor">Supervisores</option>
              <option value="tecnico">Técnicos</option>
            </select>
          </div>
          
          <button 
            @click="showAddUserModal = true" 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
          >
            <span class="material-icons mr-1">person_add</span>
            Añadir Usuario
          </button>
        </div>
        
        <div v-if="isLoading" class="text-center p-4">
          <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-2">Cargando usuarios...</p>
        </div>
        
        <div v-else-if="filteredUsers.length === 0" class="text-center p-8">
          <p class="text-lg text-gray-500">No se encontraron usuarios</p>
        </div>
        
        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {{ getInitials(user.nombre) }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.nombre }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                    :class="{
                      'bg-purple-100 text-purple-800': user.role === 'admin' || user.role === 'administrativo',
                      'bg-blue-100 text-blue-800': user.role === 'supervisor',
                      'bg-green-100 text-green-800': user.role === 'tecnico'
                    }"
                  >
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">
                    {{ formatDate(user.fechaCreacion) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="resetPassword(user)" 
                    class="text-blue-600 hover:text-blue-900 mr-3"
                    :disabled="user.role === 'admin' || user.role === 'administrativo'"
                  >
                    Cambiar Contraseña
                  </button>
                  <button 
                    @click="confirmDeleteUser(user)" 
                    class="text-red-600 hover:text-red-900"
                    :disabled="user.role === 'admin' || user.role === 'administrativo'"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Añadir Usuario</h2>
        
        <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="material-icons text-red-400">error</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="addUser">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                v-model="newUser.nombre" 
                type="text" 
                required 
                class="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Nombre completo"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                v-model="newUser.email" 
                type="email" 
                required 
                class="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="correo@ejemplo.com"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select 
                v-model="newUser.role" 
                required 
                class="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="supervisor">Supervisor</option>
                <option value="tecnico">Técnico</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input 
                v-model="newUser.password" 
                type="password" 
                required 
                class="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Contraseña"
              />
              <p class="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showAddUserModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
              Añadir Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Reset Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Cambiar Contraseña</h2>
        
        <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="material-icons text-red-400">error</span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="handlePasswordChange">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <div class="p-2 bg-gray-100 rounded">
                {{ selectedUser?.nombre }} ({{ selectedUser?.email }})
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input 
                v-model="newPassword" 
                type="password" 
                required 
                class="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Nueva contraseña"
                minlength="6"
              />
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showPasswordModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Confirmar Eliminación</h2>
        
        <p class="mb-4">¿Está seguro de que desea eliminar al usuario <strong>{{ selectedUser?.nombre }}</strong>?</p>
        <p class="text-sm text-red-600 mb-6">Esta acción no se puede deshacer.</p>
        
        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            @click="showDeleteModal = false" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
          >
            Cancelar
          </button>
          <button 
            @click="handleDeleteUser" 
            class="px-4 py-2 bg-red-600 text-white rounded-md"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
            Eliminar
          </button>
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
      
      // Mostrar mensaje de éxito
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