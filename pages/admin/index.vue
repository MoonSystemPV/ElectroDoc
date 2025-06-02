<template>
  <AppLayout>
    <div class="container mx-auto py-6 px-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
      
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-gray-800">Gestión de Usuarios</h2>
          
          <button 
            @click="showCreateUserModal = true"
            class="btn btn-primary flex items-center"
          >
            <span class="material-icons text-sm mr-1">add</span>
            Crear Usuario
          </button>
        </div>
        
        <div v-if="isLoading" class="py-8 text-center text-gray-500">
          <div class="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="mt-2">Cargando usuarios...</p>
        </div>
        
        <div v-else-if="users.length === 0" class="py-10 text-center text-gray-500">
          <span class="material-icons text-4xl mb-2">people</span>
          <p>No hay usuarios registrados</p>
        </div>
        
        <div v-else>
          <div class="overflow-x-auto">
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
                    Estado
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Conexión
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium mr-3">
                        {{ getUserInitials(user.nombre) }}
                      </div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.nombre }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="badge"
                      :class="{
                        'bg-blue-100 text-blue-800': user.role === 'tecnico',
                        'bg-purple-100 text-purple-800': user.role === 'administrativo',
                        'bg-green-100 text-green-800': user.role === 'supervisor'
                      }"
                    >
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="badge"
                      :class="{
                        'bg-green-100 text-green-800': user.activo,
                        'bg-red-100 text-red-800': !user.activo
                      }"
                    >
                      {{ user.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.lastLogin ? formatDate(user.lastLogin) : 'Nunca' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      @click="openEditUserModal(user)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Editar usuario"
                    >
                      <span class="material-icons text-sm">edit</span>
                    </button>
                    
                    <button
                      v-if="user.activo"
                      @click="deactivateUser(user.id)"
                      class="text-red-600 hover:text-red-900"
                      title="Desactivar usuario"
                    >
                      <span class="material-icons text-sm">block</span>
                    </button>
                    
                    <button
                      v-else
                      @click="activateUser(user.id)"
                      class="text-green-600 hover:text-green-900"
                      title="Activar usuario"
                    >
                      <span class="material-icons text-sm">check_circle</span>
                    </button>
                    
                    <button
                      @click="resetUserPassword(user.id)"
                      class="text-yellow-600 hover:text-yellow-900"
                      title="Restablecer contraseña"
                    >
                      <span class="material-icons text-sm">vpn_key</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Create User Modal -->
      <div
        v-if="showCreateUserModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <h2 class="text-xl font-bold mb-4">Crear Nuevo Usuario</h2>
          
          <div v-if="userError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ userError }}
          </div>
          
          <form @submit.prevent="createUser" class="space-y-4">
            <div>
              <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                id="nombre"
                v-model="userData.nombre"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                v-model="userData.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                id="role"
                v-model="userData.role"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Seleccionar rol</option>
                <option value="tecnico">Técnico</option>
                <option value="administrativo">Administrativo</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Inicial
              </label>
              <input
                id="password"
                v-model="userData.password"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres. Se solicitará cambiar al primer inicio de sesión.
              </p>
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="showCreateUserModal = false"
                class="btn btn-secondary"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isUserActionLoading"
              >
                <span v-if="isUserActionLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </span>
                <span v-else>Crear Usuario</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Edit User Modal -->
      <div
        v-if="showEditUserModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <h2 class="text-xl font-bold mb-4">Editar Usuario</h2>
          
          <div v-if="userError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ userError }}
          </div>
          
          <form @submit.prevent="updateUser" class="space-y-4">
            <div>
              <label for="edit-nombre" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                id="edit-nombre"
                v-model="editUserData.nombre"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="edit-email" class="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="edit-email"
                v-model="editUserData.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="edit-role" class="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                id="edit-role"
                v-model="editUserData.role"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Seleccionar rol</option>
                <option value="tecnico">Técnico</option>
                <option value="administrativo">Administrativo</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="showEditUserModal = false"
                class="btn btn-secondary"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isUserActionLoading"
              >
                <span v-if="isUserActionLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </span>
                <span v-else>Actualizar Usuario</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

definePageMeta({
  middleware: 'auth'
})

// Composables
const { getAllUsers, createUser: apiCreateUser, updateUser: apiUpdateUser, 
        activateUser: apiActivateUser, deactivateUser: apiDeactivateUser, 
        resetPassword: apiResetPassword, error: usersError, isLoading } = useUsers()

// State
const users = ref<any[]>([])
const showCreateUserModal = ref(false)
const showEditUserModal = ref(false)
const isUserActionLoading = ref(false)
const userError = ref('')
const userData = ref({
  nombre: '',
  email: '',
  role: '',
  password: ''
})
const editUserData = ref({
  id: '',
  nombre: '',
  email: '',
  role: ''
})

// Methods
const getUserInitials = (name: string) => {
  if (!name) return '?'
  
  const nameParts = name.split(' ')
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
  }
  return nameParts[0][0].toUpperCase()
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'tecnico': return 'Técnico'
    case 'administrativo': return 'Administrativo'
    case 'supervisor': return 'Supervisor'
    default: return role
  }
}

const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy, HH:mm', { locale: es })
}

const loadUsers = async () => {
  try {
    users.value = await getAllUsers()
  } catch (err) {
    console.error('Error loading users:', err)
  }
}

const createUser = async () => {
  userError.value = ''
  isUserActionLoading.value = true
  
  try {
    const newUser = await apiCreateUser(
      userData.value.nombre,
      userData.value.email,
      userData.value.password,
      userData.value.role
    )
    
    if (newUser) {
      users.value.push(newUser)
      
      // Reset form and close modal
      userData.value = {
        nombre: '',
        email: '',
        role: '',
        password: ''
      }
      showCreateUserModal.value = false
    } else {
      userError.value = usersError.value || 'Error al crear el usuario'
    }
  } catch (err) {
    console.error('Error creating user:', err)
    userError.value = 'Error al crear el usuario'
  } finally {
    isUserActionLoading.value = false
  }
}

const openEditUserModal = (user: any) => {
  editUserData.value = {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    role: user.role
  }
  
  showEditUserModal.value = true
}

const updateUser = async () => {
  userError.value = ''
  isUserActionLoading.value = true
  
  try {
    const success = await apiUpdateUser(
      editUserData.value.id,
      {
        nombre: editUserData.value.nombre,
        email: editUserData.value.email,
        role: editUserData.value.role
      }
    )
    
    if (success) {
      // Update user in list
      const index = users.value.findIndex(u => u.id === editUserData.value.id)
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          nombre: editUserData.value.nombre,
          email: editUserData.value.email,
          role: editUserData.value.role
        }
      }
      
      // Close modal
      showEditUserModal.value = false
    } else {
      userError.value = usersError.value || 'Error al actualizar el usuario'
    }
  } catch (err) {
    console.error('Error updating user:', err)
    userError.value = 'Error al actualizar el usuario'
  } finally {
    isUserActionLoading.value = false
  }
}

const activateUser = async (userId: string) => {
  try {
    const success = await apiActivateUser(userId)
    
    if (success) {
      // Update user in list
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index].activo = true
      }
    }
  } catch (err) {
    console.error('Error activating user:', err)
    alert('Error al activar el usuario')
  }
}

const deactivateUser = async (userId: string) => {
  try {
    const success = await apiDeactivateUser(userId)
    
    if (success) {
      // Update user in list
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index].activo = false
      }
    }
  } catch (err) {
    console.error('Error deactivating user:', err)
    alert('Error al desactivar el usuario')
  }
}

const resetUserPassword = async (userId: string) => {
  if (!confirm('¿Está seguro de restablecer la contraseña de este usuario? Se enviará un enlace de restablecimiento a su correo electrónico.')) {
    return
  }
  
  try {
    const success = await apiResetPassword(userId)
    
    if (success) {
      alert('Se ha enviado un enlace de restablecimiento de contraseña al correo electrónico del usuario')
    } else {
      alert('Error al restablecer la contraseña')
    }
  } catch (err) {
    console.error('Error resetting password:', err)
    alert('Error al restablecer la contraseña')
  }
}

// Initialize
onMounted(async () => {
  await loadUsers()
})
</script>

<style scoped>
.badge {
  @apply inline-flex px-2 py-0.5 rounded text-xs font-medium;
}

.btn {
  @apply px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500;
}
</style> 