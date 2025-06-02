<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-bold mb-4">Subir Documento</h2>
    
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ errorMessage }}
    </div>
    
    <form @submit.prevent="submitForm">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
          <select
            v-model="formData.tipo"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Selecciona un tipo</option>
            <option value="TE1">TE1 - Declaración Instalación</option>
            <option value="TE2">TE2 - Protocolo de Pruebas</option>
            <option value="plano">Plano Eléctrico</option>
            <option value="informe">Informe Técnico</option>
            <option value="foto">Fotografía</option>
            <option value="certificado">Certificado</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Documento</label>
          <input
            v-model="formData.nombre"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese un nombre descriptivo"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
          <input
            ref="fileInput"
            type="file"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="handleFileChange"
          />
        </div>
      </div>
      
      <div class="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Subiendo...</span>
          <span v-else>Subir Documento</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import { useDocuments } from '~/composables/useDocuments'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['success', 'cancel'])

const { uploadDocument } = useDocuments()
const fileInput = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const formData = ref({
  tipo: '',
  nombre: '',
  file: null
})

const handleFileChange = (event) => {
  formData.value.file = event.target.files[0]
}

const submitForm = async () => {
  if (!formData.value.file || !formData.value.tipo || !formData.value.nombre) {
    errorMessage.value = 'Por favor, complete todos los campos'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    console.log('Subiendo documento al proyecto:', props.projectId)
    const result = await uploadDocument(
      props.projectId,
      formData.value.tipo,
      formData.value.file,
      formData.value.nombre
    )
    
    if (result) {
      console.log('Documento subido exitosamente:', result)
      
      // Restablecer formulario
      formData.value = {
        tipo: '',
        nombre: '',
        file: null
      }
      
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      
      // Notificar éxito
      emit('success', result)
    } else {
      errorMessage.value = 'Error al subir el documento'
    }
  } catch (error) {
    console.error('Error al subir documento:', error)
    errorMessage.value = 'Error al subir el documento: ' + (error.message || 'Error desconocido')
  } finally {
    isLoading.value = false
  }
}
</script> 