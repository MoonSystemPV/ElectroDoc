<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Proyectos</h1>
        <button 
          v-if="canEditProjects"
          @click="showNewProjectModal = true"
          class="btn btn-primary"
        >
          <span class="material-icons mr-2">add</span>
          Nuevo Proyecto
        </button>
      </div>

      <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 transition-colors">
        <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <input v-model="searchQuery" type="text" placeholder="Buscar proyectos..." class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-72" />
          <select v-model="filterStatus" class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-60">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="completado">Completado</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>

        <div v-if="isLoading" class="text-center p-8">
          <div class="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-2 text-zinc-600 dark:text-zinc-400">Cargando proyectos...</p>
        </div>

        <div v-else-if="filteredProjects.length === 0" class="text-center p-8">
          <p class="text-lg text-zinc-500 dark:text-zinc-400">No se encontraron proyectos</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="project in filteredProjects" :key="project.id" class="bg-zinc-50 dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{{ project.nombre }}</h3>
                  <p class="text-sm text-zinc-500 dark:text-zinc-400">Encargado: {{ project.supervisor }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    v-if="canEditProjects"
                    @click="deleteProject(project)"
                    class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                  <button 
                    v-if="canEditProjects"
                    @click="editProject(project)"
                    class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                </div>
              </div>
              
              <div class="space-y-3 mb-4">
                <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                  <span class="material-icons text-blue-500 mr-2">calendar_today</span>
                  <span>Inicio: {{ formatDate(project.fechaInicio) }}</span>
                </div>
                <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                  <span class="material-icons text-blue-500 mr-2">event</span>
                  <span>Fin: {{ formatDate(project.fechaFin) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <button 
                  @click="viewProjectDetails(project)"
                  class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  <span class="material-icons mr-1">folder</span>
                  Ver Carpetas
                </button>
                <button 
                  v-if="canEditProjects"
                  @click="showStatusModal = true; selectedProjectForStatus = project"
                  class="text-sm px-3 py-1 rounded-full transition-colors"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400': project.estado === 'activo',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400': project.estado === 'completado',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400': project.estado === 'cancelado'
                  }"
                >
                  {{ getStatusText(project.estado) }}
                </button>
                <span 
                  v-else
                  class="text-sm px-3 py-1 rounded-full"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400': project.estado === 'activo',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400': project.estado === 'completado',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400': project.estado === 'cancelado'
                  }"
                >
                  {{ getStatusText(project.estado) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div class="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 sm:px-6 mt-6 rounded-xl">
          <!-- Versión móvil de paginación -->
          <div class="flex items-center justify-between w-full sm:hidden">
            <button class="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700">
              Anterior
            </button>
            <div class="text-sm text-zinc-700 dark:text-zinc-300">
              <span>Página <span class="font-medium">1</span> de <span class="font-medium">3</span></span>
            </div>
            <button class="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700">
              Siguiente
            </button>
          </div>
          
          <!-- Versión desktop de paginación -->
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-zinc-700 dark:text-zinc-300">
                Mostrando <span class="font-medium">1</span> a <span class="font-medium">6</span> de <span class="font-medium">12</span> resultados
              </p>
            </div>
            <div>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <a href="#" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <span class="material-icons text-sm">chevron_left</span>
                </a>
                <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">1</a>
                <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">2</a>
                <a href="#" class="relative hidden items-center px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 md:inline-flex">3</a>
                <a href="#" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <span class="material-icons text-sm">chevron_right</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Nuevo Proyecto -->
      <div v-if="showNewProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Nuevo Proyecto</h2>
            <button @click="showNewProjectModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <ProjectForm 
            :is-supervisor="isSupervisor"
            :is-admin="isAdmin"
            @submit="handleProjectSubmit" 
            @cancel="showNewProjectModal = false" 
          />
        </div>
      </div>

      <!-- Modal de Editar Proyecto -->
      <div v-if="showEditProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Editar Proyecto</h2>
            <button @click="showEditProjectModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <ProjectForm 
            :project="selectedProject"
            :is-supervisor="isSupervisor"
            :is-admin="isAdmin"
            @submit="handleProjectUpdate" 
            @cancel="showEditProjectModal = false" 
          />
        </div>
      </div>

      <!-- Modal de Carpetas -->
      <div v-if="showFoldersModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <button @click="showFoldersModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">arrow_back</span>
            </button>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Carpetas del Proyecto</h2>
            <div class="flex items-center gap-2">
              <button 
                v-if="isSupervisor"
                @click="showNewFolderModal = true"
                class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <span class="material-icons">create_new_folder</span>
              </button>
              <button @click="showFoldersModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <div 
              v-for="folder in projectFolders" 
              :key="folder.id"
              class="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 relative group"
            >
              <div 
                class="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                @click="openFolder(folder.nombre)"
              >
                <div class="flex items-center justify-center mb-4">
                  <span class="material-icons text-4xl text-blue-500">folder</span>
                </div>
                <h3 class="text-lg font-semibold text-center text-zinc-900 dark:text-zinc-100">{{ folder.nombre }}</h3>
              </div>
              <button 
                v-if="isSupervisor"
                @click="deleteFolder(folder)"
                class="absolute top-2 right-2 p-1 rounded-full text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Nueva Carpeta -->
      <div v-if="showNewFolderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Nueva Carpeta</h3>
            <button @click="showNewFolderModal = false" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <form @submit.prevent="createNewFolder" class="space-y-4">
            <div>
              <label for="folderName" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Nombre de la Carpeta
              </label>
              <input
                id="folderName"
                v-model="newFolderName"
                type="text"
                required
                class="input"
                placeholder="Ej: Documentos Técnicos"
              />
            </div>
            
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                @click="showNewFolderModal = false"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       text-gray-700 dark:text-gray-200 
                       hover:bg-gray-50 dark:hover:bg-zinc-800 
                       focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400
                       transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors
                       dark:bg-blue-500 dark:hover:bg-blue-400"
                :disabled="isCreatingFolder"
              >
                <span v-if="isCreatingFolder" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </span>
                <span v-else>Crear Carpeta</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Contenido de Carpeta -->
      <div v-if="showFolderContentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] p-6 flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <button @click="showFolderContentModal = false; showFoldersModal = true" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">arrow_back</span>
            </button>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{{ selectedFolder }}</h2>
            <button @click="showFolderContentModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Aquí irá el contenido de la carpeta -->
              <div v-if="selectedFolder === 'Formularios_SEC'" class="space-y-4">
                <div class="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <span class="material-icons text-blue-500">description</span>
                  <span class="text-zinc-900 dark:text-zinc-100">Formulario SEC-001.pdf</span>
                </div>
                <div class="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <span class="material-icons text-blue-500">description</span>
                  <span class="text-zinc-900 dark:text-zinc-100">Formulario SEC-002.pdf</span>
                </div>
                <div class="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <span class="material-icons text-blue-500">description</span>
                  <span class="text-zinc-900 dark:text-zinc-100">Formulario SEC-003.pdf</span>
                </div>
              </div>

              <div v-if="selectedFolder === 'Planos'" class="space-y-4">
                <div class="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <span class="material-icons text-blue-500">image</span>
                  <span class="text-zinc-900 dark:text-zinc-100">Plano Eléctrico.dwg</span>
                </div>
                <div class="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <span class="material-icons text-blue-500">image</span>
                  <span class="text-zinc-900 dark:text-zinc-100">Plano Estructural.dwg</span>
                </div>
                <div class="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <span class="material-icons text-blue-500">image</span>
                  <span class="text-zinc-900 dark:text-zinc-100">Plano Arquitectónico.dwg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Opciones de Estado -->
      <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Cambiar Estado</h3>
            <button @click="showStatusModal = false" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div v-if="!canEditProjects" class="text-red-500 dark:text-red-400 mb-4">
            Solo los supervisores y administradores pueden cambiar el estado del proyecto
          </div>
          
          <div v-else class="space-y-3">
            <button
              v-for="status in ['activo', 'completado', 'cancelado']"
              :key="status"
              @click="updateProjectStatus(selectedProjectForStatus, status)"
              class="w-full px-4 py-2 rounded-lg text-left transition-colors"
              :class="{
                'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300': selectedProjectForStatus?.estado === status,
                'hover:bg-gray-50 dark:hover:bg-zinc-700': selectedProjectForStatus?.estado !== status
              }"
            >
              {{ status.charAt(0).toUpperCase() + status.slice(1) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '~/components/layout/MainLayout.vue'
import { useProjects } from '~/composables/useProjects'
import { useActivities } from '~/composables/useActivities'
import ProjectForm from '@/components/ProjectForm.vue'
import { collection, getDocs, doc, updateDoc, serverTimestamp, addDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { useAuth } from '~/composables/useAuth'

// Aplicar middleware de autenticación
definePageMeta({
  middleware: ['auth']
})

// Composables
const { getProjects, createProject, error: projectError } = useProjects()
const { addActivity } = useActivities()
const { user } = useAuth()
const isSupervisor = computed(() => user.value?.role === 'supervisor')
const isAdmin = computed(() => user.value?.role === 'admin')
const canEditProjects = computed(() => isSupervisor.value || isAdmin.value)

// Estado
const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const filterStatus = ref('')
const showAddProjectModal = ref(false)
const showFoldersModal = ref(false)
const showFolderContentModal = ref(false)
const selectedProject = ref(null)
const selectedFolder = ref('')
const projects = ref([])
const showStatusModal = ref(false)
const selectedProjectForStatus = ref(null)
const showNewFolderModal = ref(false)
const newFolderName = ref('')
const isCreatingFolder = ref(false)
const projectFolders = ref([])
const showNewProjectModal = ref(false)
const showEditProjectModal = ref(false)

// Nuevo proyecto
const newProject = ref({
  nombre: '',
  cliente: '',
  supervisor: '',
  fechaInicio: '',
  fechaFin: '',
  descripcion: '',
  ubicacion: '',
  estado: 'activo'
})

// Proyectos filtrados
const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    if (filterStatus.value && project.estado !== filterStatus.value) {
      return false
    }
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return (
        project.nombre.toLowerCase().includes(query) ||
        project.cliente.toLowerCase().includes(query)
      )
    }
    
    return true
  })
})

// Cargar proyectos
async function loadProjects() {
  isLoading.value = true
  try {
    console.log('Iniciando carga de proyectos...')
    const projectsRef = collection(db, 'projects')
    const querySnapshot = await getDocs(projectsRef)
    console.log('Proyectos obtenidos:', querySnapshot.docs.length)
    
    projects.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Datos del proyecto:', data)
      return {
        id: doc.id,
        ...data,
        fechaInicio: data.fechaInicio?.toDate?.() || data.fechaInicio,
        fechaFin: data.fechaFin?.toDate?.() || data.fechaVencimiento?.toDate?.() || data.fechaFin || data.fechaVencimiento
      }
    })
    console.log('Proyectos procesados:', projects.value)
  } catch (err) {
    console.error('Error al cargar proyectos:', err)
    error.value = 'Error al cargar los proyectos'
  } finally {
    isLoading.value = false
  }
}

// Cargar proyectos al montar el componente
onMounted(async () => {
  console.log('Usuario actual:', user.value)
  console.log('Es supervisor:', isSupervisor.value)
  console.log('Es admin:', isAdmin.value)
  console.log('Puede editar:', canEditProjects.value)
  await loadProjects()
})

// Funciones
function getStatusText(status) {
  switch (status) {
    case 'activo':
      return 'Activo'
    case 'completado':
      return 'Completado'
    case 'cancelado':
      return 'Cancelado'
    default:
      return status
  }
}

function formatDate(date) {
  if (!date) return 'No especificada'
  
  try {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return 'Fecha inválida'
    
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (e) {
    console.error('Error al formatear fecha:', e)
    return 'Fecha inválida'
  }
}

function editProject(project) {
  console.log('Intentando editar proyecto:', { project, canEdit: canEditProjects.value })
  
  if (!canEditProjects.value) {
    error.value = 'Solo los supervisores y administradores pueden editar proyectos'
    return
  }
  
  selectedProject.value = project
  showEditProjectModal.value = true
}

function showProjectOptions(project) {
  // Implementar opciones de proyecto
  console.log('Opciones de proyecto:', project)
}

function viewProjectDetails(project) {
  selectedProject.value = project
  showFoldersModal.value = true
  loadProjectFolders()
}

function onProjectFormSubmit(data) {
  addProject(data)
  showAddProjectModal.value = false
}

async function addProject(formData) {
  isLoading.value = true
  error.value = null
  try {
    // Mapeo de campos para la base de datos
    const projectData = {
      nombre: formData.nombre,
      cliente: formData.cliente,
      descripcion: formData.descripcion || '',
      fechaInicio: formData.fechaInicio,
      fechaVencimiento: formData.fechaFin || null,
      estado: formData.estado,
      tecnicosAsignados: []
    }
    const projectId = await createProject(projectData)
    if (projectId) {
      await addActivity({
        projectId: projectId.toString(),
        action: 'create_project',
        details: `Proyecto creado: ${projectData.nombre}`
      })
      await loadProjects()
    } else {
      error.value = projectError.value || 'Error al crear el proyecto'
    }
  } catch (err) {
    console.error('Error al crear proyecto:', err)
    error.value = 'Error al crear el proyecto'
  } finally {
    isLoading.value = false
  }
}

function openFolder(folderName) {
  selectedFolder.value = folderName
  showFoldersModal.value = false
  showFolderContentModal.value = true
}

// Mostrar opciones de estado
function showStatusOptions(project) {
  selectedProjectForStatus.value = project
  showStatusModal.value = true
}

// Actualizar estado del proyecto
async function updateProjectStatus(project, newStatus) {
  console.log('Intentando actualizar estado:', { project, newStatus, canEdit: canEditProjects.value })
  
  if (!canEditProjects.value) {
    error.value = 'Solo los supervisores y administradores pueden cambiar el estado del proyecto'
    return
  }

  try {
    const projectRef = doc(db, 'projects', project.id)
    await updateDoc(projectRef, {
      estado: newStatus
    })
    
    // Actualizar el estado localmente
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], estado: newStatus }
    }
    
    // Registrar actividad
    await addActivity({
      projectId: project.id,
      projectName: project.nombre,
      oldStatus: project.estado,
      newStatus
    })
    
    showStatusModal.value = false
  } catch (err) {
    console.error('Error al actualizar estado:', err)
    error.value = 'Error al actualizar el estado del proyecto'
  }
}

// Cargar carpetas del proyecto
async function loadProjectFolders() {
  if (!selectedProject.value) return
  
  try {
    const foldersRef = collection(db, `projects/${selectedProject.value.id}/folders`)
    const querySnapshot = await getDocs(foldersRef)
    projectFolders.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Error al cargar carpetas:', err)
    error.value = 'Error al cargar las carpetas del proyecto'
  }
}

// Crear nueva carpeta
async function createNewFolder() {
  if (!selectedProject.value || !newFolderName.value) return
  
  isCreatingFolder.value = true
  try {
    const foldersRef = collection(db, `projects/${selectedProject.value.id}/folders`)
    await addDoc(foldersRef, {
      nombre: newFolderName.value,
      fechaCreacion: serverTimestamp()
    })
    
    await loadProjectFolders()
    showNewFolderModal.value = false
    newFolderName.value = ''
  } catch (err) {
    console.error('Error al crear carpeta:', err)
    error.value = 'Error al crear la carpeta'
  } finally {
    isCreatingFolder.value = false
  }
}

// Eliminar carpeta
async function deleteFolder(folder) {
  if (!selectedProject.value || !folder.id) return
  
  if (!confirm(`¿Estás seguro de que deseas eliminar la carpeta "${folder.nombre}"?`)) return
  
  try {
    const folderRef = doc(db, `projects/${selectedProject.value.id}/folders`, folder.id)
    await deleteDoc(folderRef)
    
    await loadProjectFolders()
  } catch (err) {
    console.error('Error al eliminar carpeta:', err)
    error.value = 'Error al eliminar la carpeta'
  }
}

const defaultFolders = [
  'Formularios_SEC',
  'Planos',
  'Informes_Técnicos',
  'Evidencia_Fotográfica',
  'Certificados_Materiales',
  'Checklists',
  'Actas',
  'Otros'
]

// Crear carpetas por defecto para un proyecto
async function createDefaultFolders(projectId) {
  try {
    const foldersRef = collection(db, `projects/${projectId}/folders`)
    
    // Crear todas las carpetas por defecto
    const createFolderPromises = defaultFolders.map(folderName => 
      addDoc(foldersRef, {
        nombre: folderName,
        fechaCreacion: serverTimestamp()
      })
    )
    
    await Promise.all(createFolderPromises)
  } catch (err) {
    console.error('Error al crear carpetas por defecto:', err)
    throw new Error('Error al crear las carpetas por defecto')
  }
}

// Función para actualizar proyectos existentes
async function updateExistingProjects() {
  try {
    const projectsRef = collection(db, 'projects')
    const querySnapshot = await getDocs(projectsRef)
    
    const updatePromises = querySnapshot.docs.map(async (doc) => {
      const projectId = doc.id
      const foldersRef = collection(db, `projects/${projectId}/folders`)
      const foldersSnapshot = await getDocs(foldersRef)
      
      // Si el proyecto no tiene carpetas, crear las carpetas por defecto
      if (foldersSnapshot.empty) {
        await createDefaultFolders(projectId)
      }
    })
    
    await Promise.all(updatePromises)
    console.log('Proyectos existentes actualizados con carpetas por defecto')
  } catch (err) {
    console.error('Error al actualizar proyectos existentes:', err)
    error.value = 'Error al actualizar proyectos existentes'
  }
}

// Modificar onMounted para incluir la actualización de proyectos existentes
onMounted(async () => {
  await loadProjects()
  await updateExistingProjects()
})

// Modificar la función deleteProject para verificar permisos
async function deleteProject(project) {
  console.log('Intentando eliminar proyecto:', { project, canEdit: canEditProjects.value })
  
  if (!canEditProjects.value) {
    error.value = 'Solo los supervisores y administradores pueden eliminar proyectos'
    return
  }

  if (!confirm(`¿Estás seguro de que deseas eliminar el proyecto "${project.nombre}"?`)) return
  
  try {
    const projectRef = doc(db, 'projects', project.id)
    await deleteDoc(projectRef)
    
    // Actualizar la lista local
    projects.value = projects.value.filter(p => p.id !== project.id)
    
    // Registrar actividad
    await addActivity({
      projectId: project.id,
      projectName: project.nombre,
      action: 'delete'
    })
  } catch (err) {
    console.error('Error al eliminar proyecto:', err)
    error.value = 'Error al eliminar el proyecto'
  }
}

async function handleProjectSubmit(projectData) {
  try {
    // Guardar el proyecto en Firestore
    const projectsRef = collection(db, 'projects')
    await addDoc(projectsRef, {
      ...projectData,
      fechaCreacion: serverTimestamp(),
      estado: 'activo'
    })
    // Cierra el modal y recarga la lista
    showNewProjectModal.value = false
    await loadProjects()
  } catch (err) {
    console.error('Error al guardar el proyecto:', err)
    error.value = 'Error al guardar el proyecto'
  }
}
</script> 