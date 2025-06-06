<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
      <h2 class="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Cambiar Estado del Proyecto</h2>
      
      <div v-if="error" class="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="material-icons text-red-400">error</span>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nuevo Estado
            </label>
            <select
              v-model="newStatus"
              class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
              required
            >
              <option value="activo">Activo</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Comentario (opcional)
            </label>
            <textarea
              v-model="comment"
              rows="3"
              class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
              placeholder="Agregar un comentario sobre el cambio de estado..."
            ></textarea>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            </span>
            <span v-else>Actualizar Estado</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', data: { newStatus: string, comment: string }): void
}>()

const newStatus = ref('activo')
const comment = ref('')
const error = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  error.value = ''
  
  try {
    emit('update', {
      newStatus: newStatus.value,
      comment: comment.value
    })
    
    // Reset form
    newStatus.value = 'activo'
    comment.value = ''
    
    // Close modal
    emit('close')
  } catch (err) {
    console.error('Error updating project status:', err)
    error.value = 'Error al actualizar el estado del proyecto'
  } finally {
    isSubmitting.value = false
  }
}
</script> 