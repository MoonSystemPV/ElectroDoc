<template>
  <AppLayout>
    <div v-if="isLoading" class="py-20 text-center text-gray-500">
      <div class="animate-spin mx-auto h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      <p class="mt-3">Cargando información del proyecto...</p>
    </div>
    
    <div v-else-if="!project" class="py-20 text-center text-gray-500">
      <span class="material-icons text-5xl mb-3">error_outline</span>
      <p class="text-xl font-medium mb-2">Proyecto no encontrado</p>
      <p class="text-gray-500 mb-4">El proyecto solicitado no existe o ha sido eliminado</p>
      
      <button
        @click="router.push('/projects')"
        class="btn btn-primary"
      >
        Volver a proyectos
      </button>
    </div>
    
    <div v-else class="space-y-6">
      <!-- Header with Back Button -->
      <div class="flex items-center mb-6">
        <button 
          @click="router.push('/projects')" 
          class="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="text-2xl font-bold text-gray-800">{{ project.nombre }}</h1>
      </div>
      
      <!-- Project Info Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center mb-2">
              <h2 class="text-xl font-bold text-gray-800">Información del Proyecto</h2>
              <span
                class="badge ml-3"
                :class="{
                  'bg-green-100 text-green-800': project.estado === 'activo',
                  'bg-blue-100 text-blue-800': project.estado === 'completado',
                  'bg-red-100 text-red-800': project.estado === 'cancelado'
                }"
              >
                {{ project.estado }}
              </span>
            </div>
            <p v-if="project.descripcion" class="text-gray-600 mb-6">{{ project.descripcion }}</p>
          </div>
          
          <div class="flex gap-2" v-if="canEditProject">
            <button
              @click="router.push(`/projects/${id}/edit`)"
              class="btn btn-secondary flex items-center"
              title="Editar proyecto"
            >
              <span class="material-icons text-sm mr-1">edit</span>
              Editar
            </button>
            
            <button
              @click="showStatusModal"
              class="btn btn-secondary flex items-center"
              title="Cambiar estado"
            >
              <span class="material-icons text-sm mr-1">update</span>
              Estado
            </button>
          </div>
        </div>
        
        <div class="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Cliente</h3>
            <p class="mt-1">{{ project.cliente }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Ubicación</h3>
            <p class="mt-1">{{ project.ubicacion || 'No especificada' }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Fecha de Inicio</h3>
            <p class="mt-1">{{ formatDate(project.fechaInicio) }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Fecha de Vencimiento</h3>
            <p class="mt-1">{{ project.fechaVencimiento ? formatDate(project.fechaVencimiento) : 'No especificada' }}</p>
          </div>
        </div>
      </div>
      
      <!-- Technicians Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold text-gray-800">Técnicos Asignados</h2>
          
          <button
            v-if="canEditProject"
            @click="showAssignTechniciansModal = true"
            class="btn btn-secondary flex items-center"
          >
            <span class="material-icons text-sm mr-1">person_add</span>
            Asignar Técnicos
          </button>
        </div>
        
        <div v-if="isLoadingTechnicians" class="py-8 text-center text-gray-500">
          <div class="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="mt-2">Cargando técnicos...</p>
        </div>
        
        <div v-else-if="assignedTechnicians.length === 0" class="py-8 text-center text-gray-500">
          <span class="material-icons text-4xl mb-2">engineering</span>
          <p>No hay técnicos asignados a este proyecto</p>
          
          <button
            v-if="canEditProject"
            @click="showAssignTechniciansModal = true"
            class="btn btn-primary mt-3"
          >
            Asignar Técnicos
          </button>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="tech in assignedTechnicians" 
            :key="tech.id" 
            class="flex items-center p-3 border rounded-md hover:bg-gray-50"
          >
            <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mr-3">
              {{ getTechnicianInitials(tech) }}
            </div>
            <div>
              <div class="font-medium">{{ tech.nombre }}</div>
              <div class="text-sm text-gray-500">{{ tech.email }}</div>
            </div>
            
            <button
              v-if="canEditProject"
              @click="removeTechnician(tech)"
              class="ml-auto p-1 text-gray-400 hover:text-red-500"
              title="Remover técnico"
            >
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Documents Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold text-gray-800">Documentos</h2>
          
          <button
            @click="showUploadModal = true"
            class="btn btn-primary flex items-center"
          >
            <span class="material-icons text-sm mr-1">upload_file</span>
            Subir Documento
          </button>
        </div>
        
        <div v-if="isLoadingDocuments" class="py-8 text-center text-gray-500">
          <div class="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="mt-2">Cargando documentos...</p>
        </div>
        
        <div v-else-if="documents.length === 0" class="py-8 text-center text-gray-500">
          <span class="material-icons text-4xl mb-2">folder_open</span>
          <p>No hay documentos en este proyecto</p>
          
          <button
            @click="showUploadModal = true"
            class="btn btn-primary mt-3"
          >
            Subir un documento
          </button>
        </div>
        
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="document in documents" :key="document.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span 
                        class="material-icons text-gray-400 mr-2"
                        :class="{
                          'text-blue-500': document.tipo === 'TE1' || document.tipo === 'TE2',
                          'text-green-500': document.tipo === 'plano',
                          'text-yellow-500': document.tipo === 'informe',
                          'text-purple-500': document.tipo === 'certificado',
                          'text-gray-500': document.tipo === 'foto'
                        }"
                      >
                        {{ getDocumentIcon(document.tipo) }}
                      </span>
                      <div class="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {{ document.nombre }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ getDocumentTypeName(document.tipo) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="badge"
                      :class="{
                        'bg-yellow-100 text-yellow-800': document.estado === 'pendiente',
                        'bg-green-100 text-green-800': document.estado === 'validado',
                        'bg-red-100 text-red-800': document.estado === 'rechazado'
                      }"
                    >
                      {{ document.estado }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ formatDate(document.fechaSubida) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        @click="viewDocument(document)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Ver documento"
                      >
                        <span class="material-icons text-sm">visibility</span>
                      </button>
                      
                      <button
                        @click="downloadDocument(document)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Descargar documento"
                      >
                        <span class="material-icons text-sm">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Activities Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
        
        <div v-if="isLoadingActivities" class="py-8 text-center text-gray-500">
          <div class="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="mt-2">Cargando actividades...</p>
        </div>
        
        <div v-else-if="activities.length === 0" class="py-8 text-center text-gray-500">
          <span class="material-icons text-4xl mb-2">history</span>
          <p>No hay actividades recientes</p>
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
                  <span class="font-medium text-gray-800">{{ getUserName(activity.userId) }}</span>
                  <span class="mx-2 text-gray-500">•</span>
                  <span class="text-sm text-gray-500">{{ formatDateTime(activity.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-600 mt-1">{{ activity.details || getActivityDescription(activity) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Upload Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <h2 class="text-xl font-bold mb-4">Subir Documento</h2>
        
        <div v-if="uploadError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ uploadError }}
        </div>
        
        <form @submit.prevent="uploadFile">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
              <select
                v-model="uploadData.tipo"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Selecciona un tipo</option>
                <option value="TE1">Formulario TE1</option>
                <option value="TE2">Formulario TE2</option>
                <option value="plano">Plano Eléctrico</option>
                <option value="informe">Informe</option>
                <option value="certificado">Certificado</option>
                <option value="foto">Fotografía</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre personalizado (opcional)</label>
              <input
                v-model="uploadData.customName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dejar en blanco para usar nombre original"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
              <div 
                class="border-2 border-dashed border-gray-300 rounded-md px-6 py-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                @click="$refs.fileInput.click()"
                @dragover.prevent="dragover = true"
                @dragleave.prevent="dragover = false"
                @drop.prevent="onFileDrop"
                :class="{ 'border-blue-500 bg-blue-50': dragover }"
              >
                <input
                  ref="fileInput"
                  type="file"
                  @change="onFileChange"
                  class="hidden"
                />
                
                <div v-if="!uploadData.file">
                  <span class="material-icons text-4xl text-gray-400">upload_file</span>
                  <p class="mt-2 text-gray-600">Arrastra y suelta un archivo aquí o haz clic para seleccionarlo</p>
                  <p class="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max. 10MB)</p>
                </div>
                
                <div v-else class="text-left">
                  <div class="flex items-center">
                    <span class="material-icons text-blue-500 mr-2">description</span>
                    <div>
                      <p class="font-medium text-gray-800">{{ uploadData.file.name }}</p>
                      <p class="text-xs text-gray-500">{{ formatFileSize(uploadData.file.size) }}</p>
                    </div>
                    <button
                      type="button"
                      @click.stop="uploadData.file = null"
                      class="ml-auto p-1 text-gray-500 hover:text-red-500"
                    >
                      <span class="material-icons text-sm">close</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showUploadModal = false"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!uploadData.file || !uploadData.tipo || isUploading"
            >
              <span v-if="isUploading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subiendo...
              </span>
              <span v-else>Subir Documento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Assign Technicians Modal -->
    <div
      v-if="showAssignTechniciansModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <h2 class="text-xl font-bold mb-4">Asignar Técnicos</h2>
        
        <div v-if="assignError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ assignError }}
        </div>
        
        <div v-if="isLoadingAvailableTechnicians" class="py-8 text-center text-gray-500">
          <div class="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="mt-2">Cargando técnicos disponibles...</p>
        </div>
        
        <div v-else-if="availableTechnicians.length === 0" class="py-8 text-center text-gray-500">
          <span class="material-icons text-4xl mb-2">engineering</span>
          <p>No hay técnicos disponibles para asignar</p>
        </div>
        
        <div v-else class="max-h-80 overflow-y-auto">
          <div 
            v-for="tech in availableTechnicians" 
            :key="tech.id" 
            class="flex items-center p-3 border-b hover:bg-gray-50"
          >
            <input
              :id="`assign-tech-${tech.id}`"
              type="checkbox"
              :value="tech.id"
              v-model="selectedTechnicians"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label :for="`assign-tech-${tech.id}`" class="ml-3 block text-sm font-medium text-gray-700 flex-grow">
              {{ tech.nombre }} ({{ tech.email }})
            </label>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="showAssignTechniciansModal = false"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            @click="assignTechnicians"
            class="btn btn-primary"
            :disabled="selectedTechnicians.length === 0 || isAssigning"
          >
            <span v-if="isAssigning" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Asignando...
            </span>
            <span v-else>Asignar Técnicos</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Status Change Modal -->
    <ProjectStatusModal
      v-model="showStatusChangeModal"
      :project-id="id"
      :current-status="project?.estado || 'activo'"
      @status-updated="handleStatusUpdated"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

// Import the status modal component
import ProjectStatusModal from '~/components/ProjectStatusModal.vue'

definePageMeta({
  middleware: 'auth'
})

// Composables
const route = useRoute()
const router = useRouter()
const { $firebase } = useNuxtApp()
const { user } = useAuth()
const { 
  getProjectById, 
  assignTechnician, 
  removeTechnician: apiRemoveTechnician, 
  updateProject,
  error: projectError 
} = useProjects()
const {
  getDocumentsByProject,
  uploadDocument: apiUploadDocument,
  error: documentError
} = useDocuments()
const { getProjectActivities } = useActivities()

// Route params
const id = computed(() => route.params.id as string)

// State variables
const project = ref<any>(null)
const documents = ref<any[]>([])
const activities = ref<any[]>([])
const assignedTechnicians = ref<any[]>([])
const availableTechnicians = ref<any[]>([])
const userMap = ref<Record<string, any>>({})

// Loading states
const isLoading = ref(true)
const isLoadingDocuments = ref(false)
const isLoadingActivities = ref(false)
const isLoadingTechnicians = ref(false)
const isLoadingAvailableTechnicians = ref(false)
const isUploading = ref(false)
const isAssigning = ref(false)

// Error states
const uploadError = ref('')
const assignError = ref('')

// UI control
const showUploadModal = ref(false)
const showAssignTechniciansModal = ref(false)
const showStatusChangeModal = ref(false)
const dragover = ref(false)
const selectedTechnicians = ref<string[]>([])

// File upload data
const uploadData = ref({
  tipo: '',
  customName: '',
  file: null as File | null
})

// Computed properties
const canEditProject = computed(() => {
  return user.value?.role === 'supervisor' || user.value?.role === 'administrativo'
})

// Helper functions
const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: es })
}

const formatDateTime = (date: Date) => {
  return format(date, 'dd MMM yyyy, HH:mm', { locale: es })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getDocumentTypeName = (type: string) => {
  switch (type) {
    case 'TE1': return 'Formulario TE1'
    case 'TE2': return 'Formulario TE2'
    case 'plano': return 'Plano Eléctrico'
    case 'informe': return 'Informe'
    case 'certificado': return 'Certificado'
    case 'foto': return 'Fotografía'
    default: return type
  }
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'TE1':
    case 'TE2':
      return 'description'
    case 'plano':
      return 'architecture'
    case 'informe':
      return 'article'
    case 'certificado':
      return 'verified'
    case 'foto':
      return 'image'
    default:
      return 'insert_drive_file'
  }
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

const getUserName = (userId: string) => {
  if (userMap.value[userId]) {
    return userMap.value[userId].nombre
  }
  return 'Usuario'
}

const getActivityDescription = (activity: any) => {
  return activity.details || 'Realizó una acción'
}

const getTechnicianInitials = (tech: any) => {
  if (!tech.nombre) return 'T'
  
  const nameParts = tech.nombre.split(' ')
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
  }
  return nameParts[0][0].toUpperCase()
}

// Load project data
const loadProject = async () => {
  isLoading.value = true
  
  try {
    const projectData = await getProjectById(id.value)
    
    if (projectData) {
      project.value = projectData
      await Promise.all([
        loadDocuments(),
        loadActivities(),
        loadTechnicians()
      ])
    }
  } catch (err) {
    console.error('Error loading project:', err)
  } finally {
    isLoading.value = false
  }
}

// Load documents
const loadDocuments = async () => {
  isLoadingDocuments.value = true
  
  try {
    const docs = await getDocumentsByProject(id.value)
    documents.value = docs
  } catch (err) {
    console.error('Error loading documents:', err)
  } finally {
    isLoadingDocuments.value = false
  }
}

// Load activities
const loadActivities = async () => {
  isLoadingActivities.value = true
  
  try {
    const acts = await getProjectActivities(id.value)
    activities.value = acts
    
    // Load user data for activities
    await loadUserData()
  } catch (err) {
    console.error('Error loading activities:', err)
  } finally {
    isLoadingActivities.value = false
  }
}

// Load technicians assigned to this project
const loadTechnicians = async () => {
  isLoadingTechnicians.value = true
  
  try {
    if (!project.value?.tecnicosAsignados?.length) {
      assignedTechnicians.value = []
      return
    }
    
    const techIds = project.value.tecnicosAsignados
    const techData: any[] = []
    
    // Fetch user data for each technician
    for (const techId of techIds) {
      const userDoc = await getDoc(doc($firebase.firestore, 'users', techId))
      
      if (userDoc.exists()) {
        techData.push({
          id: userDoc.id,
          ...userDoc.data()
        })
      }
    }
    
    assignedTechnicians.value = techData
  } catch (err) {
    console.error('Error loading technicians:', err)
  } finally {
    isLoadingTechnicians.value = false
  }
}

// Load available technicians for assignment
const loadAvailableTechnicians = async () => {
  isLoadingAvailableTechnicians.value = true
  
  try {
    const q = query(
      collection($firebase.firestore, 'users'),
      where('role', '==', 'tecnico')
    )
    
    const querySnapshot = await getDocs(q)
    const techData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Filter out technicians already assigned to this project
    availableTechnicians.value = techData.filter(tech => 
      !project.value.tecnicosAsignados.includes(tech.id)
    )
    
    // Initialize selected technicians
    selectedTechnicians.value = []
  } catch (err) {
    console.error('Error loading available technicians:', err)
  } finally {
    isLoadingAvailableTechnicians.value = false
  }
}

// Load user data for activities
const loadUserData = async () => {
  try {
    const userIds = new Set<string>()
    
    // Collect all user IDs from activities
    activities.value.forEach(activity => {
      if (activity.userId) {
        userIds.add(activity.userId)
      }
    })
    
    // Fetch user data for each ID
    for (const userId of userIds) {
      if (!userMap.value[userId]) {
        const userDoc = await getDoc(doc($firebase.firestore, 'users', userId))
        
        if (userDoc.exists()) {
          userMap.value[userId] = userDoc.data()
        }
      }
    }
  } catch (err) {
    console.error('Error loading user data:', err)
  }
}

// Document actions
const viewDocument = (document: any) => {
  window.open(document.url, '_blank')
}

const downloadDocument = (document: any) => {
  const link = document.createElement('a')
  link.href = document.url
  link.download = document.nombre
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// File upload functions
const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    uploadData.value.file = input.files[0]
  }
}

const onFileDrop = (event: DragEvent) => {
  dragover.value = false
  if (event.dataTransfer?.files.length) {
    uploadData.value.file = event.dataTransfer.files[0]
  }
}

const uploadFile = async () => {
  if (!uploadData.value.file || !uploadData.value.tipo) {
    uploadError.value = 'Por favor completa todos los campos requeridos'
    return
  }

  isUploading.value = true
  uploadError.value = ''

  try {
    await apiUploadDocument(
      id.value,
      uploadData.value.tipo,
      uploadData.value.file,
      uploadData.value.customName || undefined
    )

    // Refresh documents list
    await loadDocuments()

    // Reset form and close modal
    uploadData.value = {
      tipo: '',
      customName: '',
      file: null
    }
    showUploadModal.value = false
  } catch (err) {
    console.error('Error uploading document:', err)
    uploadError.value = documentError.value || 'Error al subir el documento'
  } finally {
    isUploading.value = false
  }
}

// Technician assignment functions
const showStatusModal = () => {
  showStatusChangeModal.value = true
}

const handleStatusUpdated = async ({ newStatus, comment }) => {
  // Refresh project data
  await loadProject()
}

const removeTechnician = async (technician: any) => {
  try {
    const result = await apiRemoveTechnician(id.value, technician.id)
    
    if (result) {
      // Refresh technicians list
      await loadTechnicians()
    }
  } catch (err) {
    console.error('Error removing technician:', err)
    alert('Error al remover técnico')
  }
}

const assignTechnicians = async () => {
  if (selectedTechnicians.value.length === 0) return
  
  isAssigning.value = true
  assignError.value = ''
  
  try {
    const promises = selectedTechnicians.value.map(techId => 
      assignTechnician(id.value, techId)
    )
    
    await Promise.all(promises)
    
    // Refresh technicians list
    await loadTechnicians()
    
    // Close modal
    showAssignTechniciansModal.value = false
  } catch (err) {
    console.error('Error assigning technicians:', err)
    assignError.value = 'Error al asignar técnicos'
  } finally {
    isAssigning.value = false
  }
}

// Initialize component
onMounted(async () => {
  await loadProject()
})
</script> 