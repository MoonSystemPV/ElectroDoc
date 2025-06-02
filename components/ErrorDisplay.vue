<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h2 class="text-2xl font-bold text-red-600 mb-4">
        Hubo un problema al cargar la aplicación
      </h2>
      
      <p class="text-gray-700 mb-4">
        Por favor, intenta las siguientes soluciones:
      </p>
      
      <ul class="list-disc pl-5 mb-6 text-gray-600 space-y-2">
        <li>Recarga la página (F5 o Ctrl+R)</li>
        <li>Limpia la caché del navegador</li>
        <li>Verifica tu conexión a internet</li>
        <li>Asegúrate de que Firebase esté accesible</li>
      </ul>
      
      <div v-if="errorMessage" class="bg-red-50 p-4 rounded-md mb-6">
        <p class="text-sm text-red-800">{{ errorMessage }}</p>
      </div>
      
      <button 
        @click="reloadPage" 
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Recargar página
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  errorMessage: {
    type: String,
    default: ''
  }
})

const reloadPage = () => {
  window.location.reload()
}
</script> 