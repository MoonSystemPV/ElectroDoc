<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <h1 class="text-3xl font-extrabold mb-8 text-pink-500 dark:text-pink-400 tracking-tight">Proyectos</h1>
      <div class="flex flex-col gap-6">
        <div v-for="project in projects" :key="project.id" class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-7 transition-colors hover:shadow-2xl hover:-translate-y-1 transform duration-200 cursor-pointer">
          <h2 class="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">{{ project.nombre }}</h2>
          <p class="text-zinc-400 text-sm">Cliente: {{ project.cliente }}</p>
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