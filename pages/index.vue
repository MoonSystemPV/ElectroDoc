<template>
  <!-- Página de carga - se mostrará brevemente antes de redireccionar -->
  <div class="fixed inset-0 flex flex-col items-center justify-center bg-white">
    <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
    <p class="text-gray-600">Cargando ElectroDoc...</p>
  </div>
</template>

<script setup>
// Redirigir inmediatamente a la página de proyectos
onMounted(() => {
  console.log("Página principal cargada, redirigiendo a proyectos");
  navigateTo('/projects', { replace: true });
});
</script> 