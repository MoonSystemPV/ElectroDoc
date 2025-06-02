<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Proyectos</h1>
          <p class="text-gray-600">Gestiona tus proyectos eléctricos</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <span class="material-icons text-sm">search</span>
            </span>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar proyectos..." 
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <select 
            v-model="statusFilter" 
            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
          </select>
          
          <button 
            v-if="canCreateProject"
            @click="router.push('/projects/new')" 
            class="btn btn-primary flex items-center"
          >
            <span class="material-icons text-sm mr-1">add</span>
            Nuevo Proyecto
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="py-20 text-center text-gray-500">
        <div class="animate-spin mx-auto h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p class="mt-3">Cargando proyectos...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="displayProjects.length === 0" class="py-20 text-center text-gray-500">
        <span class="material-icons text-5xl mb-3">folder</span>
        
        <div v-if="projects.length === 0">
          <p class="text-xl font-medium mb-2">No hay proyectos disponibles</p>
          <p class="text-gray-500 mb-4">Aún no se han creado proyectos</p>
        </div>
        
        <div v-else>
          <p class="text-xl font-medium mb-2">No se encontraron resultados</p>
          <p class="text-gray-500 mb-4">Intenta con otra búsqueda o filtro</p>
        </div>
        
        <button
          v-if="canCreateProject"
          @click="router.push('/projects/new')"
          class="btn btn-primary"
        >
          Crear Proyecto
        </button>
      </div>
      
      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="project in displayProjects" 
          :key="project.id"
          class="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
        >
          <div class="p-5">
            <div class="flex justify-between items-start mb-2">
              <h2 class="text-lg font-bold text-gray-800 hover:text-blue-600 truncate" style="max-width: 80%;">
                <NuxtLink :to="`/projects/${project.id}`">
                  {{ project.nombre }}
                </NuxtLink>
              </h2>
              
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
            </div>
            
            <div class="text-gray-600 mb-3 truncate">
              Cliente: {{ project.cliente }}
            </div>
            
            <div class="flex flex-wrap text-sm text-gray-500 gap-y-1">
              <div class="w-full">
                <span class="material-icons text-xs mr-1 align-middle">calendar_today</span>
                {{ formatDate(project.fechaInicio) }}
              </div>
              
              <div v-if="project.fechaVencimiento" class="w-full">
                <span class="material-icons text-xs mr-1 align-middle">event</span>
                Vence: {{ formatDate(project.fechaVencimiento) }}
              </div>
              
              <div v-if="project.ubicacion" class="w-full truncate">
                <span class="material-icons text-xs mr-1 align-middle">location_on</span>
                {{ project.ubicacion }}
              </div>
            </div>
          </div>
          
          <div class="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
            <div class="flex items-center text-sm text-gray-500">
              <span class="material-icons text-xs mr-1">engineering</span>
              {{ project.tecnicosAsignados?.length || 0 }} técnicos
            </div>
            
            <NuxtLink :to="`/projects/${project.id}`" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Ver detalles
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

definePageMeta({
  middleware: 'auth'
})

// Composables
const router = useRouter()
const { user } = useAuth()
const { getProjects, getUserProjects, isLoading, error } = useProjects()

// State variables
const projects = ref<any[]>([])
const searchQuery = ref('')
const statusFilter = ref('')

// Computed properties
const canCreateProject = computed(() => {
  return user.value?.role === 'supervisor' || user.value?.role === 'administrativo'
})

const displayProjects = computed(() => {
  let filteredProjects = [...projects.value]
  
  // Apply status filter
  if (statusFilter.value) {
    filteredProjects = filteredProjects.filter(p => p.estado === statusFilter.value)
  }
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filteredProjects = filteredProjects.filter(p => 
      p.nombre.toLowerCase().includes(query) ||
      p.cliente.toLowerCase().includes(query) ||
      (p.ubicacion && p.ubicacion.toLowerCase().includes(query))
    )
  }
  
  return filteredProjects
})

// Methods
const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: es })
}

const loadProjects = async () => {
  try {
    // Load projects based on user role
    let projectsData
    
    if (user.value?.role === 'tecnico') {
      projectsData = await getUserProjects()
    } else {
      projectsData = await getProjects()
    }
    
    projects.value = projectsData
  } catch (err) {
    console.error('Error loading projects:', err)
  }
}

// Load data on mount
onMounted(async () => {
  await loadProjects()
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

.input {
  @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style> 