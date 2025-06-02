<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50">
    <div class="text-center p-8">
      <div class="flex justify-center mb-6">
        <div class="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="material-icons text-white text-4xl">bolt</span>
        </div>
      </div>
      <h1 class="text-3xl font-bold text-blue-600 mb-2">ElectroDoc</h1>
      <p class="text-gray-600 mb-8">Bienvenido al sistema de gestión documental</p>
      
      <div class="flex space-x-4 justify-center">
        <NuxtLink 
          to="/login" 
          class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Iniciar sesión
        </NuxtLink>
        
        <NuxtLink 
          to="/dashboard" 
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template> 