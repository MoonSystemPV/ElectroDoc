<template>
  <div class="document-card bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div class="p-4">
      <div class="flex items-start">
        <div 
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3"
          :class="{
            'bg-blue-100 text-blue-600': ['TE1', 'TE2'].includes(document.tipo),
            'bg-green-100 text-green-600': document.tipo === 'plano',
            'bg-yellow-100 text-yellow-600': document.tipo === 'informe',
            'bg-purple-100 text-purple-600': document.tipo === 'certificado',
            'bg-gray-100 text-gray-600': document.tipo === 'foto'
          }"
        >
          <span class="material-icons">
            {{ getDocumentIcon(document.tipo) }}
          </span>
        </div>
        
        <div class="flex-grow">
          <h3 class="text-md font-medium text-gray-900 truncate" :title="document.nombre">
            {{ document.nombre }}
          </h3>
          
          <div class="flex flex-wrap items-center mt-1 text-sm text-gray-500">
            <span class="mr-3">{{ getDocumentTypeName(document.tipo) }}</span>
            <span 
              class="badge"
              :class="{
                'bg-yellow-100 text-yellow-800': document.estado === 'pendiente',
                'bg-green-100 text-green-800': document.estado === 'validado',
                'bg-red-100 text-red-800': document.estado === 'rechazado'
              }"
            >
              {{ document.estado }}
            </span>
          </div>
          
          <div class="mt-2 text-xs text-gray-500">
            Subido {{ formatDate(document.fechaSubida) }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="border-t px-4 py-2 bg-gray-50 flex justify-end space-x-2">
      <button
        @click="$emit('view', document)"
        class="text-blue-600 hover:text-blue-900 p-1"
        title="Ver documento"
      >
        <span class="material-icons text-sm">visibility</span>
      </button>
      
      <button
        @click="$emit('download', document)"
        class="text-blue-600 hover:text-blue-900 p-1"
        title="Descargar documento"
      >
        <span class="material-icons text-sm">download</span>
      </button>
      
      <button
        v-if="canValidate && document.estado === 'pendiente'"
        @click="$emit('validate', document)"
        class="text-green-600 hover:text-green-900 p-1"
        title="Validar documento"
      >
        <span class="material-icons text-sm">check_circle</span>
      </button>
      
      <button
        v-if="canValidate && document.estado === 'pendiente'"
        @click="$emit('reject', document)"
        class="text-red-600 hover:text-red-900 p-1"
        title="Rechazar documento"
      >
        <span class="material-icons text-sm">cancel</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  canValidate: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view', 'download', 'validate', 'reject'])

// Helper functions
const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: es })
}

const getDocumentTypeName = (type: string) => {
  switch (type) {
    case 'TE1': return 'Formulario TE1'
    case 'TE2': return 'Formulario TE2'
    case 'plano': return 'Plano Eléctrico'
    case 'informe': return 'Informe'
    case 'certificado': return 'Certificado'
    case 'foto': return 'Fotografía'
    default: return type
  }
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'TE1':
    case 'TE2':
      return 'description'
    case 'plano':
      return 'architecture'
    case 'informe':
      return 'article'
    case 'certificado':
      return 'verified'
    case 'foto':
      return 'image'
    default:
      return 'insert_drive_file'
  }
}
</script>

<style scoped>
.badge {
  @apply inline-flex px-2 py-0.5 rounded text-xs font-medium;
}
</style> 