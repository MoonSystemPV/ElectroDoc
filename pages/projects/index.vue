<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Proyectos</h1>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div v-if="isLoading" class="text-center p-4">
          <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-2">Cargando proyectos...</p>
        </div>
        
        <div v-else-if="projects.length === 0" class="text-center p-8">
          <p class="text-lg text-gray-500">No hay proyectos disponibles</p>
          <button @click="loadProjects" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Recargar
          </button>
        </div>
        
        <div v-else>
          <ul class="space-y-2">
            <li v-for="project in projects" :key="project.id" class="border p-4 rounded hover:bg-gray-50">
              <div class="font-medium">{{ project.nombre }}</div>
              <div class="text-sm text-gray-500">Cliente: {{ project.cliente }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjects } from '~/composables/useProjects'
import MainLayout from '~/components/layout/MainLayout.vue'

// Obtenemos datos del composable
const { getProjects, isLoading, loadDemoProjects } = useProjects()

// Estado local
const projects = ref([])

// Carga proyectos
const loadProjects = async () => {
  try {
    // Intentamos cargar los proyectos normalmente
    const result = await getProjects()
    
    if (result && result.length > 0) {
      projects.value = result
      console.log('Proyectos cargados:', projects.value)
    } else {
      // Si no hay proyectos, cargamos los de demostración
      console.log('Cargando proyectos de demostración')
      const demoProjects = await loadDemoProjects()
      projects.value = demoProjects || []
    }
  } catch (error) {
    console.error('Error al cargar proyectos:', error)
    // Si hay un error, intentamos cargar los proyectos de demostración
    const demoProjects = await loadDemoProjects()
    projects.value = demoProjects || []
  }
}

// Cargar proyectos al montar el componente
onMounted(async () => {
  console.log('Componente de proyectos montado')
  await loadProjects()
})
</script> 