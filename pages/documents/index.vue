<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <h1 class="text-3xl font-extrabold mb-8 text-blue-500 dark:text-white tracking-tight">Documentos</h1>
      <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 transition-colors">
        <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <input v-model="searchQuery" type="text" placeholder="Buscar documentos..." class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-72" />
          <select v-model="filterProject" class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-60">
            <option value="">Todos los proyectos</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.nombre }}
            </option>
          </select>
          <button @click="openAddDocumentModal" class="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-xl shadow transition">
            <span class="material-icons">add</span> Nuevo Documento
          </button>
        </div>
        
        <div v-if="isLoading" class="text-center p-8">
          <div class="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-2 text-zinc-600 dark:text-zinc-400">Cargando documentos...</p>
        </div>
        
        <div v-else-if="documents.length === 0" class="text-center p-8">
          <p class="text-lg text-zinc-500 dark:text-zinc-400">No se encontraron documentos</p>
        </div>
        
        <div v-else class="flex flex-col space-y-2">
          <DocumentCard
            v-for="doc in filteredDocuments"
            :key="doc.id"
            :document="doc"
            :can-validate="isAdmin || isSupervisor"
            @view="viewDocument"
            @download="downloadDocument"
            @validate="validateDocument"
            @reject="rejectDocument"
            @update="loadDocuments"
            class="w-full"
          />
        </div>
        
        <!-- Paginación -->
        <div class="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 sm:px-6 mt-4 rounded-xl">
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
                Mostrando <span class="font-medium">1</span> a <span class="font-medium">10</span> de <span class="font-medium">24</span> resultados
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

      <!-- Modal de Nuevo Documento -->
      <transition name="modal-fade">
        <div v-if="showAddDocumentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div class="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-modal-in border border-blue-100 dark:border-zinc-800">
            <button @click="showAddDocumentModal = false" class="absolute top-4 right-4 text-zinc-400 hover:text-blue-600 text-2xl">
              <span class="material-icons">close</span>
            </button>
            <div class="flex items-center gap-3 mb-6">
              <span class="material-icons text-blue-500 text-3xl">upload_file</span>
              <h2 class="text-2xl font-extrabold text-blue-600 dark:text-blue-300 tracking-tight">Nuevo Documento</h2>
            </div>
            <form @submit.prevent="handleUpload" class="space-y-5">
              <!-- Tipo de Documento -->
              <div>
                <label class="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Tipo de Documento</label>
                <select v-model="newDocument.tipo" required class="input-modern w-full">
                  <option value="" disabled>Selecciona un tipo</option>
                  <option v-for="tipo in tiposDocumento" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option>
                </select>
              </div>
              <!-- Proyecto -->
              <div>
                <label class="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Proyecto</label>
                <select v-model="newDocument.projectId" required class="input-modern w-full">
                  <option value="" disabled>Selecciona un proyecto</option>
                  <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>
              <!-- Nombre personalizado -->
              <div>
                <label class="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Nombre personalizado (opcional)</label>
                <input v-model="newDocument.customName" type="text" class="input-modern w-full" placeholder="Dejar en blanco para usar nombre original" />
              </div>
              <!-- Archivo -->
              <div>
                <label class="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Archivo</label>
                <div
                  class="file-drop-area input-modern w-full flex flex-col items-center justify-center text-center py-8 border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-2xl cursor-pointer transition hover:border-blue-400 bg-blue-50/30 dark:bg-blue-900/10"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="onFileDrop"
                  @click="triggerFileInput"
                  :class="{ 'border-blue-500': isDragging }"
                >
                  <input ref="fileInput" type="file" class="hidden" @change="onFileChange" :accept="acceptTypes" />
                  <span class="material-icons text-5xl text-blue-400 mb-2">cloud_upload</span>
                  <span class="text-zinc-500 dark:text-zinc-400 text-sm">Arrastra y suelta un archivo aquí o haz clic para seleccionarlo</span>
                  <span class="text-xs text-zinc-400 mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max. 10MB)</span>
                  <div v-if="newDocument.file" class="mt-4 text-blue-600 dark:text-blue-300 text-sm">
                    <span class="material-icons align-middle mr-1">attach_file</span>
                    {{ newDocument.file.name }}
                    <button type="button" @click.stop="removeFile" class="ml-2 text-red-500 hover:text-red-700">
                      <span class="material-icons text-base">close</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-8">
                <button type="button" @click="showAddDocumentModal = false" class="px-5 py-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Cancelar</button>
                <button type="submit" class="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2">
                  <span class="material-icons text-base">save</span>
                  Subir Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import MainLayout from '~/components/layout/MainLayout.vue'
import DocumentUpload from '~/components/documents/DocumentUpload.vue'
import DocumentCard from '~/components/documents/DocumentCard.vue'
import { useProjectStore } from '~/stores/projects'
import { useDocumentStore } from '~/stores/documents'
import { useProjects } from '~/composables/useProjects'
import { useDocuments } from '~/composables/useDocuments'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { getFirestore, collection, query, getDocs, orderBy, Timestamp, onSnapshot } from 'firebase/firestore'
import { db } from '@/utils/firebase'

definePageMeta({
  middleware: ['auth']
})

// Estado
const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const filterProject = ref('')
const showAddDocumentModal = ref(false)
const showEditProjectModal = ref(false)
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const { createProject, updateProject } = useProjects()
const { user,isAdmin, isSupervisor } = useAuth()
const { showToast } = useToast()
const { validateDocument: validateDoc, rejectDocument: rejectDoc, fetchDocumentsFromFirestore } = useDocuments()

// Estado para el nuevo proyecto
const newProject = ref({
  nombre: '',
  cliente: '',
  descripcion: '',
  fechaInicio: '',
  fechaVencimiento: '',
  ubicacion: '',
  estado: 'activo'
})

// Estado para el proyecto a editar
const projectToEdit = ref(null)

// Estado para el modal y el nuevo documento
const newDocument = ref({ project: '' })

const projects = ref([])

const { $firebase } = useNuxtApp()

const isDragging = ref(false)
const fileInput = ref(null)
const acceptTypes = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'

const tiposDocumento = [
  { value: 'TE1', label: 'Formulario TE1' },
  { value: 'TE2', label: 'Formulario TE2' },
  { value: 'plano', label: 'Plano Eléctrico' },
  { value: 'informe', label: 'Informe' },
  { value: 'certificado', label: 'Certificado' },
  { value: 'foto', label: 'Fotografía' },
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'Word (DOC)' },
  { value: 'docx', label: 'Word (DOCX)' },
  { value: 'xls', label: 'Excel (XLS)' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'jpg', label: 'Imagen JPG' },
  { value: 'jpeg', label: 'Imagen JPEG' },
  { value: 'png', label: 'Imagen PNG' }
]

// Helper functions
function formatDate(date) {
  if (!date) return ''
  
  try {
    // Si es un Timestamp de Firestore
    if (date instanceof Timestamp) {
      return format(date.toDate(), "d 'de' MMMM, yyyy", { locale: es })
    }
    // Si es una fecha
    if (date instanceof Date) {
      return format(date, "d 'de' MMMM, yyyy", { locale: es })
    }
    // Si es un string
    if (typeof date === 'string') {
      return format(parseISO(date), "d 'de' MMMM, yyyy", { locale: es })
    }
    return ''
  } catch (err) {
    console.error('Error formateando fecha:', err)
    return ''
  }
}

function getDocumentIcon(tipo) {
  switch(tipo?.toLowerCase()) {
    case 'te1':
    case 'te2':
    case 'pdf':
      return 'picture_as_pdf'
    case 'plano':
      return 'architecture'
    case 'informe':
      return 'description'
    case 'foto':
      return 'image'
    case 'certificado':
      return 'verified'
    default:
      return 'insert_drive_file'
  }
}

// Computed properties
const documents = computed(() => documentStore.documents || [])

const filteredDocuments = computed(() => {
  let filtered = documents.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc => 
      doc.nombre?.toLowerCase().includes(query)
    )
  }
  
  if (filterProject.value) {
    filtered = filtered.filter(doc => doc.projectId === filterProject.value)
  }
  
  return filtered
})

// Cargar documentos desde Firestore
const loadDocuments = async () => {
  isLoading.value = true
  try {
    await fetchDocumentsFromFirestore()
  } catch (err) {
    console.error('Error al cargar documentos:', err)
    error.value = 'Error al cargar los documentos'
  } finally {
    isLoading.value = false
  }
}

// Funciones de negocio
async function addDocument() {
  isLoading.value = true
  error.value = null
  
  try {
    // Aquí iría la lógica para crear el documento
    const projectMap = {
      'proyecto1': 'Subestación Central',
      'proyecto2': 'Línea 220kV',
      'proyecto3': 'Subestación Norte'
    }
    
    const newDoc = {
      id: documents.value.length + 1,
      name: newDocument.value.name,
      type: newDocument.value.type,
      project: projectMap[newDocument.value.project],
      updatedAt: new Date(),
      status: 'draft'
    }
    
    documentStore.addDocument(newDoc)
    showAddDocumentModal.value = false
    newDocument.value = {
      name: '',
      project: '',
      type: 'pdf'
    }
  } catch (err) {
    error.value = 'Error al crear el documento'
  } finally {
    isLoading.value = false
  }
}

function editDocument(doc) {
  // Implementar lógica de edición
  console.log('Editar documento:', doc)
}

// Funciones para manejar documentos
const viewDocument = (doc) => {
  if (doc.url && typeof doc.url === 'string' && doc.url.startsWith('http')) {
    window.open(doc.url, '_blank');
  } else {
    showToast('El documento no tiene un enlace válido para visualizar.', 'error');
  }
}

const downloadDocument = (doc) => {
  const link = document.createElement('a')
  link.href = doc.url
  link.download = doc.nombre
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const validateDocument = async (doc) => {
  try {
    await validateDoc(doc.id)
    showToast('Documento validado correctamente', 'success')
  } catch (error) {
    console.error('Error al validar documento:', error)
    showToast('Error al validar el documento', 'error')
  }
}

const rejectDocument = async (doc) => {
  try {
    await rejectDoc(doc.id)
    showToast('Documento rechazado correctamente', 'success')
  } catch (error) {
    console.error('Error al rechazar documento:', error)
    showToast('Error al rechazar el documento', 'error')
  }
}

// Funciones para manejar proyectos
async function handleCreateProject() {
  isLoading.value = true
  error.value = null
  
  try {
    const projectData = {
      ...newProject.value,
      fechaInicio: new Date(newProject.value.fechaInicio),
      fechaVencimiento: newProject.value.fechaVencimiento ? new Date(newProject.value.fechaVencimiento) : null
    }
    
    await createProject(projectData)
    showAddDocumentModal.value = false
    newProject.value = {
      nombre: '',
      cliente: '',
      descripcion: '',
      fechaInicio: '',
      fechaVencimiento: '',
      ubicacion: '',
      estado: 'activo'
    }
  } catch (err) {
    console.error('Error al crear proyecto:', err)
    error.value = 'Error al crear el proyecto'
  } finally {
    isLoading.value = false
  }
}

async function handleEditProject() {
  if (!projectToEdit.value) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const projectData = {
      ...projectToEdit.value,
      fechaInicio: new Date(projectToEdit.value.fechaInicio),
      fechaVencimiento: projectToEdit.value.fechaVencimiento ? new Date(projectToEdit.value.fechaVencimiento) : null
    }
    
    await updateProject(projectToEdit.value.id, projectData)
    showEditProjectModal.value = false
    projectToEdit.value = null
  } catch (err) {
    console.error('Error al actualizar proyecto:', err)
    error.value = 'Error al actualizar el proyecto'
  } finally {
    isLoading.value = false
  }
}

function editProject(project) {
  projectToEdit.value = {
    ...project,
    fechaInicio: format(project.fechaInicio, 'yyyy-MM-dd'),
    fechaVencimiento: project.fechaVencimiento ? format(project.fechaVencimiento, 'yyyy-MM-dd') : ''
  }
  showEditProjectModal.value = true
}

// Cargar documentos al montar el componente
onMounted(async () => {
  console.log('Componente montado, verificando autenticación...');
  console.log('Usuario autenticado:', user);
  console.log('Es admin:', isAdmin.value);
  console.log('Es supervisor:', isSupervisor.value);
  
  console.log('Iniciando carga de documentos...');
  await loadDocuments();
  console.log('Documentos cargados:', documents.value);

  onSnapshot(collection(db, 'projects'), (querySnapshot) => {
    projects.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

// Actualizar la función handleUploadSuccess para recargar los documentos
const handleUploadSuccess = async (document) => {
  showAddDocumentModal.value = false
  await loadDocuments()
}

// Función para abrir el modal
const openAddDocumentModal = () => {
  if (filterProject.value) {
    newDocument.value.project = filterProject.value
  } else if (projects.value.length > 0) {
    newDocument.value.project = projects.value[0].id
  } else {
    newDocument.value.project = ''
  }
  showAddDocumentModal.value = true
}

function triggerFileInput() {
  fileInput.value && fileInput.value.click()
}
function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    newDocument.value.file = file
  }
}
function onFileDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    newDocument.value.file = file
  }
}
function removeFile() {
  newDocument.value.file = null
  if (fileInput.value) fileInput.value.value = ''
}

async function handleUpload() {
  if (!newDocument.value.file || !newDocument.value.tipo || !newDocument.value.projectId) {
    error.value = 'Por favor completa todos los campos requeridos';
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    await useDocuments().uploadDocument(
      newDocument.value.projectId,
      newDocument.value.tipo,
      newDocument.value.file,
      newDocument.value.customName || undefined
    );
    showAddDocumentModal.value = false;
    newDocument.value = { project: '' };
    await loadDocuments();
  } catch (err) {
    error.value = 'Error al subir el documento';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.input-modern {
  @apply border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/80 text-zinc-800 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm;
  backdrop-filter: blur(2px);
}
.file-drop-area {
  @apply border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-2xl cursor-pointer transition hover:border-blue-400;
}
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.animate-modal-in {
  animation: modal-in 0.3s ease-out;
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95);}
  to { opacity: 1; transform: scale(1);}
}
</style> 