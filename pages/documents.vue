<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Documentos</h1>
      
      <!-- Filters and Actions -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input type="text" 
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" 
              placeholder="Buscar documentos..." 
              v-model="searchQuery" />
            <span class="material-icons absolute right-3 top-2 text-gray-400">search</span>
          </div>
          <div>
            <select 
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              v-model="filterProject"
            >
              <option value="">Todos los proyectos</option>
              <option value="proyecto1">Proyecto Subestación Central</option>
              <option value="proyecto2">Línea 220kV</option>
              <option value="proyecto3">Subestación Norte</option>
            </select>
          </div>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
          <span class="material-icons mr-1">add</span>
          Nuevo Documento
        </button>
      </div>

      <!-- Documents List -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <ul class="divide-y divide-gray-200">
          <li v-for="doc in filteredDocuments" :key="doc.id">
            <div class="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 mr-4">
                    <span class="material-icons" 
                        :class="{ 
                          'text-blue-500': doc.type === 'pdf', 
                          'text-green-500': doc.type === 'excel',
                          'text-yellow-500': doc.type === 'word'
                        }">
                      {{ getDocumentIcon(doc.type) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ doc.name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ doc.project }} • Actualizado {{ formatDate(doc.updatedAt) }}
                    </p>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium" 
                      :class="{
                        'bg-green-100 text-green-800': doc.status === 'approved',
                        'bg-yellow-100 text-yellow-800': doc.status === 'pending',
                        'bg-red-100 text-red-800': doc.status === 'rejected',
                        'bg-blue-100 text-blue-800': doc.status === 'draft'
                      }">
                    {{ getStatusText(doc.status) }}
                  </span>
                  <div class="flex space-x-1">
                    <button class="p-1 rounded-full hover:bg-gray-100">
                      <span class="material-icons text-gray-500 text-sm">edit</span>
                    </button>
                    <button class="p-1 rounded-full hover:bg-gray-100">
                      <span class="material-icons text-gray-500 text-sm">download</span>
                    </button>
                    <button class="p-1 rounded-full hover:bg-gray-100">
                      <span class="material-icons text-gray-500 text-sm">more_vert</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      
      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-md">
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando <span class="font-medium">1</span> a <span class="font-medium">10</span> de <span class="font-medium">24</span> resultados
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <a href="#" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                <span class="material-icons text-sm">chevron_left</span>
              </a>
              <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">1</a>
              <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">2</a>
              <a href="#" class="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 md:inline-flex">3</a>
              <a href="#" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                <span class="material-icons text-sm">chevron_right</span>
              </a>
            </nav>
          </div>
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

// Reactive state
const searchQuery = ref('')
const filterProject = ref('')

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
</script> 