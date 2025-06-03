<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Documentos</h1>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Proyecto</label>
            <select
            v-model="selectedProjectId"
            @change="loadDocumentsForProject"
            class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Seleccione un proyecto</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.nombre }}
            </option>
            </select>
      </div>
      
        <div v-if="selectedProjectId" class="mb-4">
          <button @click="showUploadModal = true" class="px-4 py-2 bg-blue-600 text-white rounded">
          Subir Documento
        </button>
      </div>
      
        <div v-if="isLoading" class="text-center p-4">
          <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-2">Cargando documentos...</p>
        </div>
        
        <div v-else-if="!selectedProjectId" class="text-center p-8">
          <p class="text-lg text-gray-500">Seleccione un proyecto para ver sus documentos</p>
        </div>
        
        <div v-else-if="documents.length === 0" class="text-center p-8">
          <p class="text-lg text-gray-500">No hay documentos disponibles</p>
        </div>
        
        <div v-else>
          <ul class="space-y-2">
            <li v-for="doc in documents" :key="doc.id" class="border p-4 rounded hover:bg-gray-50">
              <div class="font-medium">{{ doc.nombre }}</div>
              <div class="text-sm text-gray-500">Tipo: {{ doc.tipo }}</div>
              <div class="flex mt-2">
                <a :href="doc.url" target="_blank" class="text-blue-600 mr-3">Ver</a>
                <a :href="doc.url" download class="text-blue-600">Descargar</a>
                      </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </MainLayout>
    
    <!-- Upload Modal -->
  <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Subir Documento</h2>
        
        <form @submit.prevent="uploadFile">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
              <select
                v-model="uploadData.tipo"
                required
              class="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="" disabled>Selecciona un tipo</option>
              <option value="TE1">TE1 - Declaración</option>
              <option value="TE2">TE2 - Protocolo</option>
                <option value="plano">Plano Eléctrico</option>
              <option value="informe">Informe Técnico</option>
              <option value="foto">Fotografía</option>
                <option value="certificado">Certificado</option>
              </select>
            </div>
            
            <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Documento</label>
              <input
              v-model="uploadData.nombre"
                type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Nombre descriptivo"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                <input
                  ref="fileInput"
                  type="file"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md"
              @change="handleFileChange"
            />
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            @click="showUploadModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md"
            :disabled="isUploading"
          >
            {{ isUploading ? 'Subiendo...' : 'Subir Documento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '~/composables/useAuth'
import { useProjects } from '~/composables/useProjects'
import { useDocuments } from '~/composables/useDocuments'
import { useProjectStore } from '~/stores/projects'
import { useDocumentStore } from '~/stores/documents'
import { useRoute, useRouter } from 'vue-router'
import DocumentUploadForm from '~/components/DocumentUploadForm.vue'
import MainLayout from '~/components/layout/MainLayout.vue'

definePageMeta({
  middleware: 'auth'
})

// Composables
const { user } = useAuth()
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const { getProjects, loadDemoProjects } = useProjects()
const { getProjectDocuments, uploadDocument, validateDocument: validateDoc, rejectDocument: rejectDoc, isLoading } = useDocuments()

// Estado local
const searchQuery = ref('')
const filterStatus = ref('all')
const selectedProjectId = ref('')
const showUploadModal = ref(false)
const uploadError = ref('')
const isUploading = ref(false)
const fileInput = ref(null)

const uploadData = ref({
  projectId: '',
  tipo: '',
  nombre: '',
  file: null
})

// Computed properties
const projects = computed(() => projectStore.projects)
const documents = computed(() => documentStore.currentProjectDocuments)

const filteredDocuments = computed(() => {
  let filtered = [...documents.value]

  // Filter by status
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(doc => doc.estado === filterStatus.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc => 
        doc.nombre.toLowerCase().includes(query) ||
        doc.tipo.toLowerCase().includes(query)
      )
  }
  
  return filtered
})

// Methods
const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: es })
}

const getDocumentIcon = (tipo) => {
  switch (tipo) {
    case 'TE1':
    case 'TE2':
      return 'description'
    case 'plano':
      return 'architecture'
    case 'informe':
      return 'summarize'
    case 'foto':
      return 'photo'
    case 'certificado':
      return 'verified'
    default:
      return 'insert_drive_file'
  }
}

const getDocumentTypeName = (tipo) => {
  switch (tipo) {
    case 'TE1':
      return 'TE1 - Declaración'
    case 'TE2':
      return 'TE2 - Protocolo'
    case 'plano':
      return 'Plano Eléctrico'
    case 'informe':
      return 'Informe Técnico'
    case 'foto':
      return 'Fotografía'
    case 'certificado':
      return 'Certificado'
    default:
      return tipo
  }
}

const handleFileChange = (event) => {
  uploadData.value.file = event.target.files[0]
}

const loadProjects = async () => {
  try {
    await getProjects()
  } catch (error) {
    console.error('Error loading projects:', error)
    // Si hay error, cargar proyectos de demostración
    await loadDemoProjects()
  }
}

const loadDocumentsForProject = async () => {
  if (!selectedProjectId.value) return
  
  console.log('Cargando documentos para proyecto:', selectedProjectId.value)
  uploadData.value.projectId = selectedProjectId.value
  
  try {
    await getProjectDocuments(selectedProjectId.value)
    console.log('Documentos cargados:', documentStore.currentProjectDocuments)
  } catch (error) {
    console.error('Error loading documents:', error)
  }
}

const uploadFile = async () => {
  if (!uploadData.value.file) {
    uploadError.value = 'Por favor, seleccione un archivo'
    return
  }

  isUploading.value = true
  uploadError.value = ''

  try {
    await uploadDocument(
      selectedProjectId.value,
      uploadData.value.tipo,
      uploadData.value.file,
      uploadData.value.nombre
    )
    
    // Reset form
    uploadData.value = {
      projectId: selectedProjectId.value,
      tipo: '',
      nombre: '',
      file: null
    }
    
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    showUploadModal.value = false
    
    // Reload documents
    await loadDocumentsForProject()
  } catch (error) {
    console.error('Error uploading document:', error)
    uploadError.value = 'Error al subir el documento'
  } finally {
    isUploading.value = false
  }
}

const validateDocument = async (document) => {
  try {
    await validateDoc(document.id, 'Documento validado correctamente')
    await loadDocumentsForProject()
  } catch (error) {
    console.error('Error validating document:', error)
  }
}

const rejectDocument = async (document) => {
  try {
    await rejectDoc(document.id, 'Documento rechazado')
    await loadDocumentsForProject()
  } catch (error) {
    console.error('Error rejecting document:', error)
  }
}

// Manejar subida exitosa de documento
const handleUploadSuccess = async (document) => {
  showUploadModal.value = false
  await loadDocumentsForProject()
}

// Cargar proyecto al montar el componente
onMounted(async () => {
  await loadProjects()
  
  // Verificar si se pasó un projectId en la URL
  const route = useRoute()
  if (route.query.projectId) {
    selectedProjectId.value = route.query.projectId.toString()
    console.log('ProjectId de la URL:', selectedProjectId.value)
    await loadDocumentsForProject()
  }
})
</script> 

<style scoped>
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}
</style> 