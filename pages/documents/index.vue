<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Documentos</h1>
          <p class="text-gray-600 mt-1">Gestiona tus documentos de proyectos eléctricos</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <span class="material-icons text-sm">search</span>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar documentos..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <div class="flex-shrink-0">
            <select
              v-model="filterStatus"
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="validado">Validados</option>
              <option value="rechazado">Rechazados</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Upload Document Button (Only show for authorized roles) -->
      <div v-if="userRole && ['tecnico', 'administrativo', 'supervisor'].includes(userRole)">
        <button
          @click="showUploadModal = true"
          class="btn btn-primary flex items-center"
        >
          <span class="material-icons text-sm mr-1">upload_file</span>
          Subir Documento
        </button>
      </div>
      
      <!-- Documents List -->
      <div class="bg-white rounded-lg shadow">
        <div v-if="isLoading" class="py-20 text-center text-gray-500">
          <div class="animate-spin mx-auto h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p class="mt-3">Cargando documentos...</p>
        </div>
        
        <div v-else-if="filteredDocuments.length === 0" class="py-20 text-center text-gray-500">
          <span class="material-icons text-5xl mb-3">folder_open</span>
          <p class="text-xl font-medium mb-2">No hay documentos</p>
          <p class="text-gray-500 mb-4">No se encontraron documentos para mostrar</p>
          
          <button
            v-if="userRole && ['tecnico', 'administrativo', 'supervisor'].includes(userRole)"
            @click="showUploadModal = true"
            class="btn btn-primary"
          >
            Subir un nuevo documento
          </button>
        </div>
        
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="document in filteredDocuments" :key="document.id" class="hover:bg-gray-50">
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
                    <div class="text-sm text-gray-500">{{ getProjectName(document.proyectoId || document.projectId) }}</div>
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
                      
                      <button
                        v-if="canValidateDocument(document)"
                        @click="showValidationModal(document)"
                        class="text-green-600 hover:text-green-900"
                        title="Validar/Rechazar documento"
                      >
                        <span class="material-icons text-sm">verified</span>
                      </button>
                      
                      <button
                        v-if="canUpdateDocument(document)"
                        @click="showUpdateModal(document)"
                        class="text-yellow-600 hover:text-yellow-900"
                        title="Actualizar documento"
                      >
                        <span class="material-icons text-sm">update</span>
                      </button>
                      
                      <button
                        v-if="canDeleteDocument(document)"
                        @click="showDeleteConfirmation(document)"
                        class="text-red-600 hover:text-red-900"
                        title="Eliminar documento"
                      >
                        <span class="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
              <select
                v-model="uploadData.projectId"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Selecciona un proyecto</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.nombre }}
                </option>
              </select>
            </div>
            
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
                @click="() => fileInput?.click()"
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
              :disabled="!uploadData.file || !uploadData.projectId || !uploadData.tipo || isUploading"
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
    
    <!-- Validation Modal -->
    <div
      v-if="showValidateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Validar Documento</h2>
        
        <div v-if="validateError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ validateError }}
        </div>
        
        <form @submit.prevent="validateDocument">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <div class="flex gap-4">
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="validateData.status"
                    value="validado"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-gray-700">Validar</span>
                </label>
                
                <label class="flex items-center">
                  <input
                    type="radio"
                    v-model="validateData.status"
                    value="rechazado"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-gray-700">Rechazar</span>
                </label>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
              <textarea
                v-model="validateData.comments"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa comentarios sobre la validación..."
              ></textarea>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showValidateModal = false"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              class="btn"
              :class="{
                'btn-primary': validateData.status === 'validado',
                'btn-danger': validateData.status === 'rechazado'
              }"
              :disabled="!validateData.status || isValidating"
            >
              <span v-if="isValidating" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
              <span v-else>
                {{ validateData.status === 'validado' ? 'Validar' : 'Rechazar' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Eliminar Documento</h2>
        
        <p class="text-gray-700 mb-6">
          ¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer.
        </p>
        
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="showDeleteModal = false"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            @click="deleteDocument"
            class="btn btn-danger"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Eliminando...
            </span>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '~/composables/useAuth'
import { useDocuments, type Document, type DocumentType, type DocumentStatus } from '~/composables/useDocuments'
import { useProjects, type Project } from '~/composables/useProjects'
import { useDocumentStore } from '~/stores/documents'

definePageMeta({
  middleware: 'auth'
})

// Composables
const { user } = useAuth()
const documentUtils = useDocuments()
const projectUtils = useProjects()
const documentStore = useDocumentStore()

// Access document store's state
const documents = computed(() => documentStore.documents)
const projects = ref<Project[]>([])
const isLoading = computed(() => documentUtils.isLoading.value)

// Implementing missing methods
const getDocumentsByUser = async (userId: string) => {
  try {
    // This would typically be implemented in the composable, but we'll simulate it here
    // by getting all documents for the projects the user has access to
    const userProjects = await projectUtils.getUserProjects()
    // Store projects for later use
    projects.value = Array.isArray(userProjects) ? userProjects : []
    
    if (Array.isArray(userProjects)) {
      for (const project of userProjects) {
        await documentUtils.getProjectDocuments(project.id)
      }
    }
    
    return documentStore.documents
  } catch (error) {
    console.error('Error fetching user documents:', error)
    return []
  }
}

const updateDocumentStatus = async (documentId: string, status: DocumentStatus, comments?: string) => {
  try {
    if (status === 'validado') {
      return await documentUtils.validateDocument(documentId, comments)
    } else if (status === 'rechazado') {
      return await documentUtils.rejectDocument(documentId, comments)
    }
    return false
  } catch (error) {
    console.error('Error updating document status:', error)
    return false
  }
}

// Computed properties
const userRole = computed(() => user.value?.role)

// Search and filtering
const searchQuery = ref('')
const filterStatus = ref('all')

// Type for document in the component
interface DocumentWithProject extends Document {
  projectName?: string;
  version: number; // Required field from Document
}

const filteredDocuments = computed(() => {
  let result = documents.value

  // Apply status filter
  if (filterStatus.value !== 'all') {
    result = result.filter(doc => doc.estado === filterStatus.value)
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(doc => {
      return (
        doc.nombre.toLowerCase().includes(query) ||
        getProjectName(doc.projectId).toLowerCase().includes(query) ||
        doc.tipo.toLowerCase().includes(query)
      )
    })
  }

  return result
})

// Upload modal and data
const showUploadModal = ref(false)
const uploadData = ref({
  projectId: '',
  tipo: '' as DocumentType,
  customName: '',
  file: null as File | null
})
const isUploading = ref(false)
const uploadError = ref('')
const dragover = ref(false)

// Validation modal and data
const showValidateModal = ref(false)
const validateData = ref({
  documentId: '',
  status: 'validado' as DocumentStatus,
  comments: ''
})
const isValidating = ref(false)
const validateError = ref('')
const selectedDocument = ref<DocumentWithProject | null>(null)

// Delete modal
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// File input reference - use template ref with proper type
const fileInput = ref<HTMLInputElement | null>(null)

// Helper functions
const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: es })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getProjectName = (projectId: string) => {
  if (!projectId) return 'Proyecto Desconocido';
  
  if (Array.isArray(projects.value)) {
    const project = projects.value.find(p => p.id === projectId)
    return project ? project.nombre : 'Proyecto Desconocido'
  }
  return 'Proyecto Desconocido'
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
  if (!uploadData.value.file || !uploadData.value.projectId || !uploadData.value.tipo) {
    uploadError.value = 'Por favor completa todos los campos requeridos'
    return
  }

  isUploading.value = true
  uploadError.value = ''

  try {
    await documentUtils.uploadDocument(
      uploadData.value.projectId,
      uploadData.value.tipo,
      uploadData.value.file,
      uploadData.value.customName || undefined
    )

    // Refresh documents list
    if (user.value?.id) {
      await getDocumentsByUser(user.value.id)
    }

    // Reset form and close modal
    uploadData.value = {
      projectId: '',
      tipo: '' as DocumentType,
      customName: '',
      file: null
    }
    showUploadModal.value = false
  } catch (err) {
    console.error('Error uploading document:', err)
    uploadError.value = 'Error al subir el documento. Por favor intenta de nuevo.'
  } finally {
    isUploading.value = false
  }
}

// Permission checks
const canValidateDocument = (doc: Document) => {
  return userRole.value === 'supervisor' || userRole.value === 'administrativo'
}

const canUpdateDocument = (doc: Document) => {
  return doc.uploadedBy === user.value?.id || userRole.value === 'supervisor'
}

const canDeleteDocument = (doc: Document) => {
  return userRole.value === 'supervisor'
}

// Document actions
const viewDocument = (doc: Document) => {
  window.open(doc.url, '_blank')
}

const downloadDocument = (doc: Document) => {
  const link = document.createElement('a')
  link.href = doc.url
  link.download = doc.nombre
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const showValidationModal = (doc: Document) => {
  selectedDocument.value = {
    ...doc,
    projectName: getProjectName(doc.projectId)
  } as DocumentWithProject
  
  validateData.value = {
    documentId: doc.id,
    status: 'validado',
    comments: ''
  }
  showValidateModal.value = true
}

const validateDocument = async () => {
  if (!validateData.value.documentId || !validateData.value.status) {
    validateError.value = 'Información incompleta'
    return
  }

  isValidating.value = true
  validateError.value = ''

  try {
    await updateDocumentStatus(
      validateData.value.documentId,
      validateData.value.status,
      validateData.value.comments
    )

    // Refresh documents list
    if (user.value?.id) {
      await getDocumentsByUser(user.value.id)
    }

    // Close modal
    showValidateModal.value = false
  } catch (err) {
    console.error('Error validating document:', err)
    validateError.value = 'Error al validar el documento. Por favor intenta de nuevo.'
  } finally {
    isValidating.value = false
  }
}

const showUpdateModal = (doc: Document) => {
  selectedDocument.value = {
    ...doc,
    projectName: getProjectName(doc.projectId)
  } as DocumentWithProject
  // Show update modal logic
}

const showDeleteConfirmation = (doc: Document) => {
  selectedDocument.value = {
    ...doc,
    projectName: getProjectName(doc.projectId)
  } as DocumentWithProject
  showDeleteModal.value = true
}

const deleteDocument = async () => {
  if (!selectedDocument.value) return

  isDeleting.value = true

  try {
    await documentUtils.deleteDocument(selectedDocument.value.id)

    // Refresh documents list
    if (user.value?.id) {
      await getDocumentsByUser(user.value.id)
    }

    // Close modal
    showDeleteModal.value = false
  } catch (err) {
    console.error('Error deleting document:', err)
    alert('Error al eliminar el documento. Por favor intenta de nuevo.')
  } finally {
    isDeleting.value = false
  }
}

// Load data on component mount
onMounted(async () => {
  // Load user's documents
  if (user.value?.id) {
    await getDocumentsByUser(user.value.id)
    // We already get projects in getDocumentsByUser
  }
})
</script> 