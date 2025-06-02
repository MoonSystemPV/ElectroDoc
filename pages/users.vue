<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Usuarios</h1>
      
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
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
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
                  Estado
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
                      'bg-purple-100 text-purple-800': user.role === 'admin',
                      'bg-blue-100 text-blue-800': user.role === 'supervisor',
                      'bg-green-100 text-green-800': user.role === 'tecnico'
                    }"
                  >
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900 mr-3">
                    Editar
                  </button>
                  <button @click="confirmDeleteUser(user)" class="text-red-600 hover:text-red-900">
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
                <option value="admin">Administrador</option>
                <option value="supervisor">Supervisor</option>
                <option value="tecnico">Técnico</option>
              </select>
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
              Añadir Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import MainLayout from '~/components/layout/MainLayout.vue'

definePageMeta({
  middleware: ['auth', 'admin']
})

const { user, createUser } = useAuth()

// Estado local
const isLoading = ref(false)
const searchQuery = ref('')
const filterRole = ref('all')
const showAddUserModal = ref(false)
const users = ref([])

const newUser = ref({
  nombre: '',
  email: '',
  role: 'tecnico',
})

// Filtrar usuarios
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // Filtrar por rol
  if (filterRole.value !== 'all') {
    result = result.filter(user => user.role === filterRole.value)
  }
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.nombre.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    )
  }
  
  return result
})

// Cargar usuarios
const loadUsers = async () => {
  isLoading.value = true
  
  try {
    // Para este ejemplo, usar datos de demostración
    users.value = [
      {
        id: '1',
        nombre: 'Administrador Sistema',
        email: 'admin@electrodoc.com',
        role: 'admin',
      },
      {
        id: '2',
        nombre: 'Carlos Supervisor',
        email: 'supervisor@electrodoc.com',
        role: 'supervisor',
      },
      {
        id: '3',
        nombre: 'María Técnico',
        email: 'tecnico1@electrodoc.com',
        role: 'tecnico',
      },
      {
        id: '4',
        nombre: 'Juan Pérez',
        email: 'juan@electrodoc.com',
        role: 'tecnico',
      },
      {
        id: '5',
        nombre: 'Ana Supervisora',
        email: 'ana@electrodoc.com',
        role: 'supervisor',
      }
    ]
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  } finally {
    isLoading.value = false
  }
}

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

// Añadir usuario
const addUser = async () => {
  try {
    // Usar el método createUser del composable
    const success = await createUser({
      nombre: newUser.value.nombre,
      email: newUser.value.email,
      role: newUser.value.role
    });
    
    if (success) {
      // Añadir el nuevo usuario a la lista local
      const newId = Date.now().toString();
      
      users.value.push({
        id: newId,
        ...newUser.value
      });
      
      // Resetear formulario
      newUser.value = {
        nombre: '',
        email: '',
        role: 'tecnico',
      };
      
      showAddUserModal.value = false;
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    alert('Error al crear usuario');
  }
}

// Editar usuario
const editUser = (user) => {
  alert(`Editar usuario: ${user.nombre}`)
  // Aquí iría la lógica para editar
}

// Confirmar eliminación
const confirmDeleteUser = (user) => {
  if (confirm(`¿Está seguro de eliminar a ${user.nombre}?`)) {
    users.value = users.value.filter(u => u.id !== user.id)
  }
}

// Cargar usuarios al montar
onMounted(() => {
  loadUsers()
})
</script> 