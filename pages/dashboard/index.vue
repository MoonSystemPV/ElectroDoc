<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">
              Bienvenido, {{ user?.nombre || 'Usuario' }}
            </h2>
            <p class="text-gray-600 mt-1">
              {{ welcomeMessage }}
            </p>
          </div>
          
          <div class="mt-4 md:mt-0">
            <button
              v-if="userRole === 'supervisor' || userRole === 'administrativo'"
              @click="router.push('/projects/new')"
              class="btn btn-primary flex items-center"
            >
              <span class="material-icons text-sm mr-1">add</span>
              Nuevo Proyecto
            </button>
          </div>
        </div>
      </div>
      
      <!-- Stats Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="rounded-full bg-blue-100 p-3">
              <span class="material-icons text-blue-600">assignment</span>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-800">Proyectos Activos</h3>
              <p class="text-2xl font-bold">{{ isLoading ? '...' : projectsCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="rounded-full bg-green-100 p-3">
              <span class="material-icons text-green-600">description</span>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-800">Documentos</h3>
              <p class="text-2xl font-bold">{{ isLoading ? '...' : documentsCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="rounded-full bg-yellow-100 p-3">
              <span class="material-icons text-yellow-600">pending_actions</span>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-800">Pendientes</h3>
              <p class="text-2xl font-bold">{{ isLoading ? '...' : pendingCount }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Projects Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Proyectos Recientes</h3>
          <NuxtLink to="/projects" class="text-blue-600 hover:text-blue-800 text-sm">
            Ver todos
          </NuxtLink>
        </div>
        
        <div v-if="isLoading" class="py-8 text-center text-gray-500">
          <div class="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="mt-2">Cargando proyectos...</p>
        </div>
        
        <div v-else-if="recentProjects.length === 0" class="py-8 text-center text-gray-500">
          <span class="material-icons text-4xl mb-2">assignment</span>
          <p>No hay proyectos recientes</p>
          <button
            v-if="userRole === 'supervisor' || userRole === 'administrativo'"
            @click="router.push('/projects/new')"
            class="btn btn-primary mt-3"
          >
            Crear nuevo proyecto
          </button>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="project in recentProjects" :key="project.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ project.nombre }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ project.cliente }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="badge"
                    :class="{
                      'bg-green-100 text-green-800': project.estado === 'activo',
                      'bg-blue-100 text-blue-800': project.estado === 'completado',
                      'bg-red-100 text-red-800': project.estado === 'cancelado'
                    }"
                  >
                    {{ project.estado }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatDate(project.fechaInicio) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="router.push(`/projects/${project.id}`)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Recent Activities Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Actividad Reciente</h3>
        </div>
        
        <div v-if="isLoading" class="py-8 text-center text-gray-500">
          <div class="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="mt-2">Cargando actividades...</p>
        </div>
        
        <div v-else-if="recentActivities.length === 0" class="py-8 text-center text-gray-500">
          <span class="material-icons text-4xl mb-2">history</span>
          <p>No hay actividades recientes</p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-md"
          >
            <div class="flex items-start">
              <div
                class="rounded-full bg-white p-2 mr-3"
                :class="{
                  'text-green-600': ['upload', 'status_update'].includes(activity.action),
                  'text-blue-600': ['login', 'create_project', 'update_project'].includes(activity.action),
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
                  <span class="font-medium text-gray-800">{{ getUserName(activity.userId) }}</span>
                  <span class="mx-2 text-gray-500">•</span>
                  <span class="text-sm text-gray-500">{{ formatDateTime(activity.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-600 mt-1">{{ getActivityDescription(activity) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { user } = useAuth()
const { projects, getActiveProjects, isLoading: projectsLoading } = useProjects()
const { getDocumentsByUser, isLoading: documentsLoading } = useDocuments()
const { activities, getRecentActivities, isLoading: activitiesLoading } = useActivities()

// Computed properties
const userRole = computed(() => user.value?.role)

const welcomeMessage = computed(() => {
  const role = userRole.value
  const hour = new Date().getHours()
  
  let greeting = 'Buenos días'
  if (hour >= 12 && hour < 18) greeting = 'Buenas tardes'
  else if (hour >= 18) greeting = 'Buenas noches'
  
  if (role === 'tecnico') {
    return `${greeting}. Aquí puedes gestionar tus documentos y proyectos asignados.`
  } else if (role === 'administrativo') {
    return `${greeting}. Aquí puedes administrar documentos y proyectos.`
  } else if (role === 'supervisor') {
    return `${greeting}. Bienvenido al panel de control.`
  }
  
  return `${greeting}. Bienvenido a ElectroDoc.`
})

const projectsCount = computed(() => projects.value.length)

const documentsCount = computed(() => {
  // This will be calculated when we fetch documents
  return user.value?.documentsCount || 0
})

const pendingCount = computed(() => {
  // This will be calculated when we fetch documents
  return user.value?.pendingCount || 0
})

const recentProjects = computed(() => {
  return projects.value.slice(0, 5)
})

const recentActivities = computed(() => {
  return activities.value.slice(0, 5)
})

const isLoading = computed(() => {
  return projectsLoading.value || documentsLoading.value || activitiesLoading.value
})

// Helper functions
const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: es })
}

const formatDateTime = (date: Date) => {
  return format(date, 'dd MMM yyyy, HH:mm', { locale: es })
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'login':
      return 'login'
    case 'logout':
      return 'logout'
    case 'create_project':
      return 'add_circle'
    case 'update_project':
      return 'edit'
    case 'delete_project':
      return 'delete'
    case 'assign_technician':
      return 'person_add'
    case 'remove_technician':
      return 'person_remove'
    case 'upload':
      return 'upload_file'
    case 'download':
      return 'download'
    case 'status_update':
      return 'update'
    case 'delete':
      return 'delete'
    case 'version_update':
      return 'history'
    default:
      return 'info'
  }
}

const getUserName = (userId: string) => {
  // In a real app, we would fetch the user name from the database
  // For now, we'll just return the user ID
  if (user.value && userId === user.value.id) {
    return user.value.nombre
  }
  return 'Usuario'
}

const getActivityDescription = (activity: any) => {
  switch (activity.action) {
    case 'login':
      return 'Inició sesión en el sistema'
    case 'logout':
      return 'Cerró sesión'
    case 'create_project':
      return `Creó un nuevo proyecto: ${activity.details}`
    case 'update_project':
      return `Actualizó el proyecto: ${activity.details}`
    case 'delete_project':
      return `Eliminó el proyecto: ${activity.details}`
    case 'assign_technician':
      return activity.details
    case 'remove_technician':
      return activity.details
    case 'upload':
      return `Subió un documento: ${activity.details}`
    case 'download':
      return `Descargó un documento: ${activity.details}`
    case 'status_update':
      return activity.details
    case 'delete':
      return `Eliminó un documento: ${activity.details}`
    case 'version_update':
      return activity.details
    default:
      return activity.details || 'Realizó una acción'
  }
}

// Load data on component mount
onMounted(async () => {
  await getActiveProjects()
  await getRecentActivities()
  
  // Calculate document counts
  if (user.value) {
    const documents = await getDocumentsByUser(user.value.id)
    user.value.documentsCount = documents.length
    user.value.pendingCount = documents.filter(doc => doc.estado === 'pendiente').length
  }
})
</script> 