<template>
  <div class="project-card bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
    <div class="p-5">
      <div class="flex justify-between items-start mb-2">
        <h2 class="text-lg font-bold text-gray-800 hover:text-blue-600 truncate" style="max-width: 80%;">
          <NuxtLink :to="`/projects/${project.id}`">
            {{ project.nombre }}
          </NuxtLink>
        </h2>
        
        <span
          class="badge"
          :class="{
            'bg-green-100 text-green-800': project.estado === 'activo',
            'bg-blue-100 text-blue-800': project.estado === 'completado',
            'bg-red-100 text-red-800': project.estado === 'cancelado'
          }"
        >
          {{ project.estado }}
        </span>
      </div>
      
      <div class="text-gray-600 mb-3 truncate">
        Cliente: {{ project.cliente }}
      </div>
      
      <div class="flex flex-wrap text-sm text-gray-500 gap-y-1">
        <div class="w-full">
          <span class="material-icons text-xs mr-1 align-middle">calendar_today</span>
          {{ formatDate(project.fechaInicio) }}
        </div>
        
        <div v-if="project.fechaVencimiento" class="w-full">
          <span class="material-icons text-xs mr-1 align-middle">event</span>
          Vence: {{ formatDate(project.fechaVencimiento) }}
        </div>
        
        <div v-if="project.ubicacion" class="w-full truncate">
          <span class="material-icons text-xs mr-1 align-middle">location_on</span>
          {{ project.ubicacion }}
        </div>
      </div>
    </div>
    
    <div class="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
      <div class="flex items-center text-sm text-gray-500">
        <span class="material-icons text-xs mr-1">engineering</span>
        {{ project.tecnicosAsignados?.length || 0 }} técnicos
      </div>
      
      <div class="flex space-x-2">
        <NuxtLink :to="`/projects/${project.id}`" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
          Ver detalles
        </NuxtLink>
        
        <template v-if="canEdit">
          <NuxtLink :to="`/projects/${project.id}/edit`" class="text-yellow-600 hover:text-yellow-800 font-medium text-sm">
            <span class="material-icons text-sm">edit</span>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

// Helper functions
const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: es })
}
</script>

<style scoped>
.badge {
  @apply inline-flex px-2 py-0.5 rounded text-xs font-medium;
}
</style> 