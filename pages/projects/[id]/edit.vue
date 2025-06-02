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
    
    <div v-else class="max-w-3xl mx-auto">
      <div class="flex items-center mb-6">
        <button 
          @click="router.push(`/projects/${id}`)" 
          class="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="text-2xl font-bold text-gray-800">Editar Proyecto</h1>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>
        
        <form @submit.prevent="updateProjectData" class="space-y-6">
          <!-- Project Information -->
          <div>
            <h2 class="text-lg font-medium text-gray-900 border-b pb-2">Información del Proyecto</h2>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proyecto *
                </label>
                <input
                  id="nombre"
                  v-model="projectData.nombre"
                  type="text"
                  required
                  class="input"
                  placeholder="Ej: Instalación Eléctrica Edificio Central"
                />
              </div>
              
              <div>
                <label for="cliente" class="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <input
                  id="cliente"
                  v-model="projectData.cliente"
                  type="text"
                  required
                  class="input"
                  placeholder="Ej: Constructora ABC"
                />
              </div>
              
              <div>
                <label for="fechaInicio" class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio *
                </label>
                <input
                  id="fechaInicio"
                  v-model="projectData.fechaInicio"
                  type="date"
                  required
                  class="input"
                />
              </div>
              
              <div>
                <label for="fechaVencimiento" class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Vencimiento
                </label>
                <input
                  id="fechaVencimiento"
                  v-model="projectData.fechaVencimiento"
                  type="date"
                  class="input"
                />
              </div>
              
              <div class="md:col-span-2">
                <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  v-model="projectData.descripcion"
                  rows="3"
                  class="input"
                  placeholder="Breve descripción del proyecto..."
                ></textarea>
              </div>
              
              <div>
                <label for="ubicacion" class="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  id="ubicacion"
                  v-model="projectData.ubicacion"
                  type="text"
                  class="input"
                  placeholder="Ej: Santiago, Región Metropolitana"
                />
              </div>
              
              <div>
                <label for="estado" class="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  id="estado"
                  v-model="projectData.estado"
                  required
                  class="input"
                >
                  <option value="activo">Activo</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Submit Buttons -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              @click="router.push(`/projects/${id}`)"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useProjects, type Project } from '~/composables/useProjects'
import { useAuth } from '~/composables/useAuth'

// Explicitly define the page meta for Nuxt
definePageMeta({
  middleware: ['auth'],
  meta: {
    requiresRole: ['administrativo', 'supervisor']
  }
})

// Composables
const route = useRoute()
const router = useRouter()
const { getProjectById, updateProject, error: projectError } = useProjects()

// Route params
const id = computed(() => route.params.id as string)

// State variables
const project = ref<Project | null>(null)
const error = ref('')
const isLoading = ref(true)
const isSubmitting = ref(false)

// Form data with proper typings
const projectData = ref({
  nombre: '',
  cliente: '',
  estado: 'activo' as 'activo' | 'completado' | 'cancelado',
  fechaInicio: '',
  fechaVencimiento: '',
  descripcion: '',
  ubicacion: ''
})

// Load project data
const loadProject = async () => {
  isLoading.value = true
  
  try {
    const projectDoc = await getProjectById(id.value)
    
    if (projectDoc) {
      project.value = projectDoc
      
      // Format dates for the form
      const fechaInicio = format(projectDoc.fechaInicio, 'yyyy-MM-dd')
      const fechaVencimiento = projectDoc.fechaVencimiento 
        ? format(projectDoc.fechaVencimiento, 'yyyy-MM-dd') 
        : ''
      
      // Set form data
      projectData.value = {
        nombre: projectDoc.nombre,
        cliente: projectDoc.cliente,
        estado: projectDoc.estado,
        fechaInicio,
        fechaVencimiento,
        descripcion: projectDoc.descripcion || '',
        ubicacion: projectDoc.ubicacion || ''
      }
    }
  } catch (err) {
    console.error('Error loading project:', err)
    error.value = 'Error al cargar el proyecto'
  } finally {
    isLoading.value = false
  }
}

// Update project
const updateProjectData = async () => {
  if (!projectData.value.nombre || !projectData.value.cliente || !projectData.value.fechaInicio) {
    error.value = 'Por favor complete todos los campos requeridos'
    return
  }
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    // Prepare dates for Firestore
    const formattedData = {
      nombre: projectData.value.nombre,
      cliente: projectData.value.cliente,
      estado: projectData.value.estado,
      descripcion: projectData.value.descripcion,
      ubicacion: projectData.value.ubicacion,
      fechaInicio: new Date(projectData.value.fechaInicio),
      fechaVencimiento: projectData.value.fechaVencimiento 
        ? new Date(projectData.value.fechaVencimiento) 
        : null
    }
    
    await updateProject(id.value, formattedData)
    router.push(`/projects/${id.value}`)
  } catch (err) {
    console.error('Error updating project:', err)
    error.value = 'Error al actualizar el proyecto'
  } finally {
    isSubmitting.value = false
  }
}

// Load project data on component mount
onMounted(() => {
  loadProject()
})
</script> 