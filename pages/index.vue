<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-4xl font-extrabold text-primary-600">ElectroDoc</h1>
        <p class="mt-3 text-lg text-gray-600">
          Plataforma de gestión documental para proyectos eléctricos
        </p>
      </div>
      <div class="mt-8 text-center">
        <NuxtLink to="/login" class="btn btn-primary inline-block">
          Iniciar Sesión
        </NuxtLink>
        <p class="mt-3 text-sm text-gray-500">
          ¿Necesitas una cuenta? 
          <NuxtLink to="/register" class="text-primary-600 hover:text-primary-700">
            Registrarse
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Landing page logic
</script> 