<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <h1 class="text-3xl font-extrabold mb-8 text-blue-500 dark:text-white tracking-tight">Documentos</h1>
      <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 transition-colors">
        <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <input v-model="searchQuery" type="text" placeholder="Buscar documentos..." class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-72" />
          <select v-model="filterProject" class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-60">
            <option value="">Todos los proyectos</option>
            <option value="proyecto1">Proyecto Subestación Central</option>
            <option value="proyecto2">Línea 220kV</option>
            <option value="proyecto3">Subestación Norte</option>
            </select>
          <button @click="showAddDocumentModal = true" class="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-xl shadow transition">
            <span class="material-icons">add</span> Nuevo Documento
        </button>
      </div>
      
        <div v-if="isLoading" class="text-center p-8">
          <div class="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-2 text-zinc-600 dark:text-zinc-400">Cargando documentos...</p>
        </div>
        
        <div v-else-if="filteredDocuments.length === 0" class="text-center p-8">
          <p class="text-lg text-zinc-500 dark:text-zinc-400">No se encontraron documentos</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Documento</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Proyecto</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Última Actualización</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-700">
              <tr v-for="doc in filteredDocuments" :key="doc.id" class="hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <span class="material-icons text-xl"
                      :class="{
                        'text-blue-500': doc.type === 'pdf',
                        'text-green-500': doc.type === 'excel',
                        'text-yellow-500': doc.type === 'word'
                      }">
                      {{ getDocumentIcon(doc.type) }}
                    </span>
                    <span class="font-semibold text-zinc-800 dark:text-zinc-100">{{ doc.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-zinc-700 dark:text-zinc-100">{{ doc.project }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="{
                      'bg-green-100 dark:bg-green-500 text-green-700 dark:text-white': doc.status === 'approved',
                      'bg-yellow-100 dark:bg-yellow-500 text-yellow-700 dark:text-white': doc.status === 'pending',
                      'bg-red-100 dark:bg-red-500 text-red-700 dark:text-white': doc.status === 'rejected',
                      'bg-blue-100 dark:bg-blue-500 text-blue-700 dark:text-white': doc.status === 'draft'
                    }">
                    {{ getStatusText(doc.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-300">{{ formatDate(doc.updatedAt) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <button @click="editDocument(doc)" class="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700">
                      <span class="material-icons text-zinc-500 dark:text-zinc-400 text-sm">edit</span>
                    </button>
                    <button @click="downloadDocument(doc)" class="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700">
                      <span class="material-icons text-zinc-500 dark:text-zinc-400 text-sm">download</span>
                    </button>
                    <button @click="showDocumentOptions(doc)" class="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700">
                      <span class="material-icons text-zinc-500 dark:text-zinc-400 text-sm">more_vert</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginación -->
        <div class="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 sm:px-6 mt-4 rounded-xl">
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
      <div v-if="showAddDocumentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Nuevo Documento</h2>
          
          <div v-if="error" class="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="material-icons text-red-400">error</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
              </div>
            </div>
            </div>
            
          <form @submit.prevent="addDocument">
            <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombre del Documento</label>
              <input
                  v-model="newDocument.name" 
                type="text"
              required
                  class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
                  placeholder="Nombre del documento"
              />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Proyecto</label>
                <select 
                  v-model="newDocument.project" 
                  required 
                  class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
                >
                  <option value="proyecto1">Proyecto Subestación Central</option>
                  <option value="proyecto2">Línea 220kV</option>
                  <option value="proyecto3">Subestación Norte</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tipo de Documento</label>
                <select 
                  v-model="newDocument.type" 
              required
                  class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="word">Word</option>
                </select>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
                @click="showAddDocumentModal = false" 
                class="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                :disabled="isLoading"
          >
                <span v-if="isLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
                Crear Documento
          </button>
        </div>
      </form>
    </div>
  </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import MainLayout from '~/components/layout/MainLayout.vue'

definePageMeta({
  middleware: ['auth']
})

// Estado
const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const filterProject = ref('')
const showAddDocumentModal = ref(false)
const newDocument = ref({
  name: '',
  project: '',
  type: 'pdf'
})

// Sample data
const documents = ref([
  {
    id: 1,
    name: 'Especificaciones técnicas.pdf',
    type: 'pdf',
    project: 'Subestación Central',
    updatedAt: new Date(2023, 10, 15),
    status: 'approved'
  },
  {
    id: 2,
    name: 'Presupuesto final.xlsx',
    type: 'excel',
    project: 'Línea 220kV',
    updatedAt: new Date(2023, 11, 1),
    status: 'pending'
  },
  {
    id: 3,
    name: 'Planos eléctricos.pdf',
    type: 'pdf',
    project: 'Subestación Norte',
    updatedAt: new Date(2023, 11, 5),
    status: 'draft'
  },
  {
    id: 4,
    name: 'Informe de avance.docx',
    type: 'word',
    project: 'Línea 220kV',
    updatedAt: new Date(2023, 10, 28),
    status: 'approved'
  },
  {
    id: 5,
    name: 'Memoria de cálculo.pdf',
    type: 'pdf',
    project: 'Subestación Central',
    updatedAt: new Date(2023, 11, 3),
    status: 'rejected'
  }
])

// Computed properties
const filteredDocuments = computed(() => {
  let filtered = documents.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc => 
      doc.name.toLowerCase().includes(query) || 
      doc.project.toLowerCase().includes(query)
    )
  }
  
  if (filterProject.value) {
    const projectMap = {
      'proyecto1': 'Subestación Central',
      'proyecto2': 'Línea 220kV',
      'proyecto3': 'Subestación Norte'
    }
    filtered = filtered.filter(doc => doc.project === projectMap[filterProject.value])
  }
  
  return filtered
})

// Helper functions
function getDocumentIcon(type) {
  switch(type) {
    case 'pdf': return 'picture_as_pdf'
    case 'excel': return 'table_view'
    case 'word': return 'description'
    default: return 'insert_drive_file'
  }
}

function getStatusText(status) {
  switch(status) {
    case 'approved': return 'Aprobado'
    case 'pending': return 'Pendiente'
    case 'rejected': return 'Rechazado'
    case 'draft': return 'Borrador'
    default: return status
  }
}

function formatDate(date) {
  return format(date, "d 'de' MMMM, yyyy", { locale: es })
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
    
    documents.value.push(newDoc)
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

function downloadDocument(doc) {
  // Implementar lógica de descarga
  console.log('Descargar documento:', doc)
}

function showDocumentOptions(doc) {
  // Implementar lógica de opciones
  console.log('Mostrar opciones del documento:', doc)
}
</script> 