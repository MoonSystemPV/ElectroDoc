<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center mb-6">
        <button 
          @click="router.push('/projects')" 
          class="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="text-2xl font-bold text-gray-800">Crear Nuevo Proyecto</h1>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>
        
        <form @submit.prevent="createProject" class="space-y-6">
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
              @click="router.push('/projects')"
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
                Creando...
              </span>
              <span v-else>Crear Proyecto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: ['auth'],
  meta: {
    requiresRole: ['administrativo', 'supervisor']
  }
})

// Composables
const router = useRouter()
const { createProject: apiCreateProject, error: projectError } = useProjects()
const { addActivity } = useActivities()

// State variables
const error = ref('')
const isSubmitting = ref(false)

// Form data
const projectData = ref({
  nombre: '',
  cliente: '',
  estado: 'activo',
  fechaInicio: '',
  fechaVencimiento: '',
  descripcion: '',
  ubicacion: ''
})

// Create project
const createProject = async () => {
  if (!projectData.value.nombre || !projectData.value.cliente || !projectData.value.fechaInicio) {
    error.value = 'Por favor complete todos los campos requeridos'
    return
  }
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    // Prepare data for creation
    const newProject = {
      nombre: projectData.value.nombre,
      cliente: projectData.value.cliente,
      estado: projectData.value.estado,
      fechaInicio: new Date(projectData.value.fechaInicio),
      fechaVencimiento: projectData.value.fechaVencimiento
        ? new Date(projectData.value.fechaVencimiento)
        : null,
      descripcion: projectData.value.descripcion || '',
      ubicacion: projectData.value.ubicacion || '',
      tecnicosAsignados: []
    }
    
    // Create project
    const projectId = await apiCreateProject(newProject)
    
    if (projectId) {
      // Log activity
      await addActivity({
        projectId,
        action: 'create_project',
        details: `Proyecto creado: ${newProject.nombre}`
      })
      
      // Navigate to project details
      router.push(`/projects/${projectId}`)
    } else {
      error.value = projectError.value || 'Error al crear el proyecto'
    }
  } catch (err) {
    console.error('Error creating project:', err)
    error.value = 'Error al crear el proyecto'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.input {
  @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style> 