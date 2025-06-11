<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div class="flex items-center gap-3">
          <span 
            class="material-icons text-xl"
            :class="{
              'text-blue-500': document.tipo === 'TE1' || document.tipo === 'TE2',
              'text-green-500': document.tipo === 'plano',
              'text-yellow-500': document.tipo === 'informe',
              'text-purple-500': document.tipo === 'certificado',
              'text-gray-500': document.tipo === 'foto'
            }"
          >
            {{ getDocumentIcon(document.tipo) }}
          </span>
          <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{{ document.nombre }}</h2>
        </div>
        <button 
          @click="$emit('close')"
          class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden">
        <iframe 
          v-if="document.url"
          :src="document.url"
          class="w-full h-full"
          frameborder="0"
        ></iframe>
        <div v-else class="flex items-center justify-center h-full text-zinc-500">
          <p>No se puede mostrar el documento</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
        <div class="text-sm text-zinc-500">
          <span>Subido {{ formatDate(document.fechaSubida) }}</span>
        </div>
        <div class="flex gap-2">
          <button
            @click="downloadDocument"
            class="btn btn-outline flex items-center gap-1"
          >
            <span class="material-icons text-sm">download</span>
            Descargar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  document: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: es })
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

const downloadDocument = () => {
  const link = document.createElement('a')
  link.href = props.document.url
  link.download = props.document.nombre
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script> 