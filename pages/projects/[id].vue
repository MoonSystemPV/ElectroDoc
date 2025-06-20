<template>
  <AppLayout>
    <div v-if="isLoading" class="py-20 text-center text-gray-500">
      <div class="animate-spin mx-auto h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      <p class="mt-3">Cargando proyecto...</p>
    </div>
    
    <div v-else-if="!project" class="py-20 text-center text-gray-500">
      <span class="material-icons text-5xl mb-3">error_outline</span>
      <p class="text-xl font-medium mb-2">Proyecto no encontrado</p>
      <p class="text-gray-500 mb-4">El proyecto que buscas no existe o no tienes acceso a él</p>
      <NuxtLink to="/projects" class="btn btn-primary">
        Volver a proyectos
      </NuxtLink>
    </div>
    
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <NuxtLink to="/projects" class="text-blue-600 hover:text-blue-800">
              <span class="material-icons">arrow_back</span>
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-800">{{ project.nombre }}</h1>
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
          <p class="text-gray-600 mt-1">Cliente: {{ project.cliente }}</p>
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="downloadProject"
            class="btn btn-success flex items-center"
            :disabled="isDownloading"
          >
            <span v-if="isDownloading" class="material-icons text-sm mr-1 animate-spin">download</span>
            <span v-else class="material-icons text-sm mr-1">download</span>
            {{ isDownloading ? 'Descargando...' : 'Descargar Proyecto' }}
          </button>
          
          <button class="btn btn-outline flex items-center">
            <span class="material-icons text-sm mr-1">edit</span>
            Editar
          </button>
          
          <button
            class="btn btn-primary flex items-center"
            @click="goToDocuments"
          >
            <span class="material-icons text-sm mr-1">description</span>
            Ver documentos
          </button>
        </div>
      </div>
      
      <!-- Project details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Main info -->
        <div class="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Información del Proyecto</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Descripción</h3>
              <p class="mt-1 text-gray-900">{{ project.descripcion || 'Sin descripción' }}</p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Fecha de inicio</h3>
                <p class="mt-1 text-gray-900">{{ formatDate(project.fechaInicio) }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500">Fecha de vencimiento</h3>
                <p class="mt-1 text-gray-900">{{ project.fechaVencimiento ? formatDate(project.fechaVencimiento) : 'Sin fecha definida' }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500">Ubicación</h3>
                <p class="mt-1 text-gray-900">{{ project.ubicacion || 'Sin ubicación' }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500">Creado</h3>
                <p class="mt-1 text-gray-900">{{ formatDate(project.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Technical team -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Equipo Técnico</h2>
            
            <div v-if="project.tecnicosAsignados && project.tecnicosAsignados.length > 0">
              <div class="flex items-center mb-4">
                <div class="flex -space-x-2">
                  <div v-for="(tecnico, index) in project.tecnicosAsignados.slice(0, 3)" :key="index" class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 border-2 border-white">
                    <span class="font-medium text-sm">T{{ index + 1 }}</span>
                  </div>
                  
                  <div v-if="project.tecnicosAsignados.length > 3" class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 border-2 border-white">
                    <span class="font-medium text-sm">+{{ project.tecnicosAsignados.length - 3 }}</span>
                  </div>
                </div>
                
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ project.tecnicosAsignados.length }} técnicos asignados</p>
                </div>
              </div>
              
              <button class="btn btn-sm btn-outline w-full">
                Gestionar técnicos
              </button>
            </div>
            
            <div v-else class="text-center py-4 text-gray-500">
              <span class="material-icons mb-2">engineering</span>
              <p>No hay técnicos asignados</p>
              <button class="btn btn-sm btn-outline mt-2">
                Asignar técnicos
              </button>
            </div>
          </div>
          
          <!-- Documents summary -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">Documentos</h2>
              <button 
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                @click="loadDocuments"
              >
                Actualizar
              </button>
            </div>
            
            <div v-if="isLoadingDocuments" class="py-8 text-center text-gray-500">
              <div class="animate-spin mx-auto h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p class="mt-2 text-sm">Cargando documentos...</p>
            </div>
            
            <div v-else-if="documents.length === 0" class="text-center py-6 text-gray-500">
              <span class="material-icons mb-2">folder_open</span>
              <p>No hay documentos disponibles</p>
              <button 
                @click="router.push(`/documents?projectId=${project.id}`)"
                class="btn btn-sm btn-outline mt-2"
              >
                Subir documentos
              </button>
            </div>
            
            <div v-else>
              <ul class="divide-y divide-gray-200">
                <li v-for="doc in documents.slice(0, 3)" :key="doc.id" class="py-3">
                  <div class="flex items-center">
                    <span 
                      class="material-icons text-gray-400 mr-2"
                      :class="{
                        'text-blue-500': doc.tipo === 'TE1' || doc.tipo === 'TE2',
                        'text-green-500': doc.tipo === 'plano',
                        'text-yellow-500': doc.tipo === 'informe',
                        'text-purple-500': doc.tipo === 'certificado',
                        'text-gray-500': doc.tipo === 'foto'
                      }"
                    >
                      {{ getDocumentIcon(doc.tipo) }}
                    </span>
                    <div class="text-sm max-w-xs truncate">
                      <p class="font-medium text-gray-900 truncate">{{ doc.nombre }}</p>
                      <span
                        class="badge-sm"
                        :class="{
                          'bg-yellow-100 text-yellow-800': doc.estado === 'pendiente',
                          'bg-green-100 text-green-800': doc.estado === 'validado',
                          'bg-red-100 text-red-800': doc.estado === 'rechazado'
                        }"
                      >
                        {{ doc.estado }}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
              
              <div v-if="documents.length > 3" class="mt-4 text-center">
                <button 
                  @click="router.push(`/documents?projectId=${project.id}`)"
                  class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todos los documentos ({{ documents.length }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import type { DocumentType } from '~/composables/useDocuments'

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
  documents: getDocumentsByProject,
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
const isDownloading = ref(false)

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
  tipo: '' as DocumentType,
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
    const docs = getDocumentsByProject.value
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
      tipo: '' as DocumentType,
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
const showStatusModal = (type: string) => {
  showStatusChangeModal.value = true
}

const handleStatusUpdated = async ({ newStatus, comment }: { newStatus: string, comment: string }) => {
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

// Navegación a documentos
const goToDocuments = () => {
  if (project.value && project.value.id) {
    console.log('Navegando a documentos del proyecto:', project.value.id)
    router.push(`/documents?projectId=${project.value.id}`)
  }
}

// Download project
const downloadProject = async () => {
  if (!project.value) return
  
  isDownloading.value = true
  
  try {
    const response = await fetch('/api/download-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: project.value.id })
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    // Crear blob y descargar
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.value.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    // Mostrar mensaje de éxito
    alert(`Proyecto "${project.value.nombre}" descargado exitosamente`)
  } catch (error) {
    console.error('Error al descargar proyecto:', error)
    alert('Error al descargar el proyecto')
  } finally {
    isDownloading.value = false
  }
}

// Initialize component
onMounted(async () => {
  await loadProject()
})
</script> 