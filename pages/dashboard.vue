<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Tarjeta de resumen de proyectos -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center mb-4">
            <span class="material-icons text-blue-500 mr-2">engineering</span>
            <h2 class="text-lg font-semibold">Proyectos</h2>
          </div>
          <p class="text-3xl font-bold mb-2">5</p>
          <p class="text-gray-500 text-sm">Proyectos activos</p>
        </div>
        
        <!-- Tarjeta de resumen de documentos -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center mb-4">
            <span class="material-icons text-green-500 mr-2">description</span>
            <h2 class="text-lg font-semibold">Documentos</h2>
          </div>
          <p class="text-3xl font-bold mb-2">24</p>
          <p class="text-gray-500 text-sm">Documentos gestionados</p>
        </div>
        
        <!-- Tarjeta de resumen de usuarios -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center mb-4">
            <span class="material-icons text-purple-500 mr-2">people</span>
            <h2 class="text-lg font-semibold">Usuarios</h2>
          </div>
          <p class="text-3xl font-bold mb-2">7</p>
          <p class="text-gray-500 text-sm">Usuarios activos</p>
        </div>
      </div>
      
      <div class="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Actividad Reciente</h2>
        <div class="space-y-4">
          <div class="flex items-start">
            <span class="material-icons text-blue-500 mr-2">task_alt</span>
            <div>
              <p class="font-medium">Documento aprobado</p>
              <p class="text-sm text-gray-500">Plano eléctrico Proyecto Norte - hace 2 horas</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="material-icons text-green-500 mr-2">add_circle</span>
            <div>
              <p class="font-medium">Nuevo proyecto creado</p>
              <p class="text-sm text-gray-500">Instalación Eléctrica Edificio Central - hace 1 día</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="material-icons text-amber-500 mr-2">upload_file</span>
            <div>
              <p class="font-medium">Documento subido</p>
              <p class="text-sm text-gray-500">Certificado TE1 Proyecto Sur - hace 2 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import MainLayout from '~/components/layout/MainLayout.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: ['auth']
})

const { user } = useAuth()

onMounted(() => {
  console.log('Dashboard cargado para usuario:', user.value?.nombre)
})
</script> 