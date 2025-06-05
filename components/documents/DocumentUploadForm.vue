<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título del documento</label>
      <input
        type="text"
        id="title"
        v-model="form.title"
        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
        required
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
      ></textarea>
    </div>

    <div>
      <label for="file" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Archivo</label>
      <input
        type="file"
        id="file"
        @change="handleFileChange"
        class="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          dark:file:bg-blue-900/20 dark:file:text-blue-400
          hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
        required
      />
    </div>

    <div class="flex items-center justify-end space-x-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="isLoading"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? 'Subiendo...' : 'Subir documento' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'

const emit = defineEmits(['submit', 'cancel'])
const { showToast } = useToast()

const form = ref({
  title: '',
  description: '',
  file: null
})

const isLoading = ref(false)

const handleFileChange = (event) => {
  form.value.file = event.target.files[0]
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    // Aquí iría la lógica para subir el archivo
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
    showToast('Documento subido exitosamente', 'success')
    emit('submit', form.value)
  } catch (error) {
    showToast(error.message || 'Error al subir el documento', 'error')
  } finally {
    isLoading.value = false
  }
}
</script> 