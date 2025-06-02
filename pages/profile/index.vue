<template>
  <AppLayout>
    <div class="container mx-auto py-6 px-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>
      
      <div v-if="isLoading" class="py-20 text-center text-gray-500">
        <div class="animate-spin mx-auto h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p class="mt-3">Cargando información de perfil...</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- User Info Card -->
        <div class="bg-white rounded-lg shadow p-6 col-span-1">
          <div class="flex flex-col items-center">
            <div class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
              {{ getUserInitials() }}
            </div>
            
            <h2 class="text-xl font-bold text-gray-800">{{ user?.nombre }}</h2>
            <p class="text-gray-600">{{ user?.email }}</p>
            
            <div class="mt-2">
              <span 
                class="badge"
                :class="{
                  'bg-blue-100 text-blue-800': user?.role === 'tecnico',
                  'bg-purple-100 text-purple-800': user?.role === 'administrativo',
                  'bg-green-100 text-green-800': user?.role === 'supervisor'
                }"
              >
                {{ getUserRoleLabel() }}
              </span>
            </div>
            
            <div class="mt-6 w-full">
              <button 
                @click="showChangePasswordModal = true"
                class="btn btn-secondary w-full"
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
        
        <!-- Activities Card -->
        <div class="bg-white rounded-lg shadow p-6 col-span-1 md:col-span-2">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h2>
          
          <div v-if="isLoadingActivities" class="py-8 text-center text-gray-500">
            <div class="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p class="mt-2">Cargando actividades...</p>
          </div>
          
          <div v-else-if="activities.length === 0" class="py-10 text-center text-gray-500">
            <span class="material-icons text-4xl mb-2">history</span>
            <p>No tienes actividades recientes</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-md"
            >
              <div class="flex items-start">
                <div
                  class="rounded-full bg-white p-2 mr-3"
                  :class="{
                    'text-green-600': ['upload', 'status_update'].includes(activity.action),
                    'text-blue-600': ['create_project', 'update_project'].includes(activity.action),
                    'text-red-600': ['delete', 'delete_project'].includes(activity.action),
                    'text-yellow-600': ['version_update'].includes(activity.action)
                  }"
                >
                  <span class="material-icons text-sm">
                    {{ getActivityIcon(activity.action) }}
                  </span>
                </div>
                <div>
                  <div class="flex items-center">
                    <span class="text-sm text-gray-500">{{ formatDateTime(activity.timestamp) }}</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{{ activity.details || getActivityDescription(activity) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Projects Card -->
        <div class="bg-white rounded-lg shadow p-6 col-span-1 md:col-span-3">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Mis Proyectos</h2>
          
          <div v-if="isLoadingProjects" class="py-8 text-center text-gray-500">
            <div class="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p class="mt-2">Cargando proyectos...</p>
          </div>
          
          <div v-else-if="projects.length === 0" class="py-10 text-center text-gray-500">
            <span class="material-icons text-4xl mb-2">folder</span>
            <p>No tienes proyectos asignados</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProjectCard
              v-for="project in projects"
              :key="project.id"
              :project="project"
              :can-edit="canEditProject"
            />
          </div>
        </div>
      </div>
      
      <!-- Change Password Modal -->
      <div
        v-if="showChangePasswordModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <h2 class="text-xl font-bold mb-4">Cambiar Contraseña</h2>
          
          <div v-if="passwordError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ passwordError }}
          </div>
          
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Actual
              </label>
              <input
                id="currentPassword"
                v-model="passwordData.currentPassword"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                id="newPassword"
                v-model="passwordData.newPassword"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                id="confirmPassword"
                v-model="passwordData.confirmPassword"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="showChangePasswordModal = false"
                class="btn btn-secondary"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isChangingPassword"
              >
                <span v-if="isChangingPassword" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cambiando...
                </span>
                <span v-else>Cambiar Contraseña</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Components
import ProjectCard from '~/components/projects/ProjectCard.vue'

definePageMeta({
  middleware: 'auth'
})

// Composables
const { user, isLoading, changePassword: authChangePassword, error: authError } = useAuth()
const { getUserProjects, isLoading: projectsLoading } = useProjects()
const { getUserActivities, isLoading: activitiesLoading } = useActivities()

// State
const projects = ref<any[]>([])
const activities = ref<any[]>([])
const isLoadingProjects = ref(false)
const isLoadingActivities = ref(false)
const showChangePasswordModal = ref(false)
const isChangingPassword = ref(false)
const passwordError = ref('')
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const canEditProject = computed(() => {
  return user.value?.role === 'supervisor' || user.value?.role === 'administrativo'
})

// Methods
const getUserInitials = () => {
  if (!user.value?.nombre) return '?'
  
  const nameParts = user.value.nombre.split(' ')
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
  }
  return nameParts[0][0].toUpperCase()
}

const getUserRoleLabel = () => {
  switch (user.value?.role) {
    case 'tecnico': return 'Técnico'
    case 'administrativo': return 'Administrativo'
    case 'supervisor': return 'Supervisor'
    default: return user.value?.role || 'Usuario'
  }
}

const formatDateTime = (date: Date) => {
  return format(date, 'dd MMM yyyy, HH:mm', { locale: es })
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'create_project':
      return 'add_circle'
    case 'update_project':
      return 'edit'
    case 'assign_technician':
      return 'person_add'
    case 'remove_technician':
      return 'person_remove'
    case 'upload':
      return 'upload_file'
    case 'status_update':
      return 'update'
    default:
      return 'info'
  }
}

const getActivityDescription = (activity: any) => {
  return activity.details || 'Realizó una acción'
}

const loadUserProjects = async () => {
  if (!user.value) return
  
  isLoadingProjects.value = true
  
  try {
    projects.value = await getUserProjects()
  } catch (err) {
    console.error('Error loading user projects:', err)
  } finally {
    isLoadingProjects.value = false
  }
}

const loadUserActivities = async () => {
  if (!user.value) return
  
  isLoadingActivities.value = true
  
  try {
    activities.value = await getUserActivities(user.value.id)
  } catch (err) {
    console.error('Error loading user activities:', err)
  } finally {
    isLoadingActivities.value = false
  }
}

const changePassword = async () => {
  passwordError.value = ''
  
  // Validate passwords
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    passwordError.value = 'Las contraseñas no coinciden'
    return
  }
  
  if (passwordData.value.newPassword.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  
  isChangingPassword.value = true
  
  try {
    const success = await authChangePassword(
      passwordData.value.currentPassword,
      passwordData.value.newPassword
    )
    
    if (success) {
      // Reset form and close modal
      passwordData.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      showChangePasswordModal.value = false
      
      // Show success notification (would be implemented in a real app)
      alert('Contraseña cambiada exitosamente')
    } else {
      passwordError.value = authError.value || 'Error al cambiar la contraseña'
    }
  } catch (err) {
    console.error('Error changing password:', err)
    passwordError.value = 'Error al cambiar la contraseña'
  } finally {
    isChangingPassword.value = false
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([
    loadUserProjects(),
    loadUserActivities()
  ])
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