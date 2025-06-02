<template>
  <div class="document-upload">
    <div v-if="uploadError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ uploadError }}
    </div>
    
    <form @submit.prevent="uploadFile" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
        <select
          v-model="uploadData.tipo"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Selecciona un tipo</option>
          <option value="TE1">Formulario TE1</option>
          <option value="TE2">Formulario TE2</option>
          <option value="plano">Plano Eléctrico</option>
          <option value="informe">Informe</option>
          <option value="certificado">Certificado</option>
          <option value="foto">Fotografía</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre personalizado (opcional)</label>
        <input
          v-model="uploadData.customName"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Dejar en blanco para usar nombre original"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
        <div 
          class="border-2 border-dashed border-gray-300 rounded-md px-6 py-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          @click="triggerFileInput"
          @dragover.prevent="dragover = true"
          @dragleave.prevent="dragover = false"
          @drop.prevent="onFileDrop"
          :class="{ 'border-blue-500 bg-blue-50': dragover }"
        >
          <input
            ref="fileInput"
            type="file"
            @change="onFileChange"
            class="hidden"
          />
          
          <div v-if="!uploadData.file">
            <span class="material-icons text-4xl text-gray-400">upload_file</span>
            <p class="mt-2 text-gray-600">Arrastra y suelta un archivo aquí o haz clic para seleccionarlo</p>
            <p class="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max. 10MB)</p>
          </div>
          
          <div v-else class="text-left">
            <div class="flex items-center">
              <span class="material-icons text-blue-500 mr-2">description</span>
              <div>
                <p class="font-medium text-gray-800">{{ uploadData.file.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(uploadData.file.size) }}</p>
              </div>
              <button
                type="button"
                @click.stop="uploadData.file = null"
                class="ml-auto p-1 text-gray-500 hover:text-red-500"
              >
                <span class="material-icons text-sm">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end gap-3 mt-6">
        <slot name="cancel-button">
          <button
            type="button"
            @click="$emit('cancel')"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
        </slot>
        
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!uploadData.file || !uploadData.tipo || isUploading"
        >
          <span v-if="isUploading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Subiendo...
          </span>
          <span v-else>Subir Documento</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDocuments, type DocumentType } from '~/composables/useDocuments'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['upload-success', 'cancel'])

// Composables
const { uploadDocument, error: documentError, isLoading: isUploading } = useDocuments()

// State
const uploadData = ref({
  tipo: '' as DocumentType,
  customName: '',
  file: null as File | null
})
const dragover = ref(false)
const uploadError = ref('')

// DOM refs
const fileInput = ref<HTMLInputElement | null>(null)

// Methods
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    uploadData.value.file = input.files[0]
  }
}

const onFileDrop = (event: DragEvent) => {
  dragover.value = false
  if (event.dataTransfer?.files.length) {
    uploadData.value.file = event.dataTransfer.files[0]
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadFile = async () => {
  if (!uploadData.value.file || !uploadData.value.tipo) {
    uploadError.value = 'Por favor completa todos los campos requeridos'
    return
  }

  uploadError.value = ''

  try {
    const document = await uploadDocument(
      props.projectId,
      uploadData.value.tipo,
      uploadData.value.file,
      uploadData.value.customName || undefined
    )

    if (document) {
      // Reset form
      uploadData.value = {
        tipo: '' as DocumentType,
        customName: '',
        file: null
      }
      
      // Emit success event
      emit('upload-success', document)
    } else {
      uploadError.value = documentError.value || 'Error al subir el documento'
    }
  } catch (err) {
    console.error('Error uploading document:', err)
    uploadError.value = 'Error al subir el documento'
  }
}
</script>

<style scoped>
/* Using global classes defined in main.css */
</style> 