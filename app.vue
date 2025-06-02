<template>
  <NuxtPage />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

// Inicializar autenticación cuando la aplicación se carga
onMounted(async () => {
  const { initAuth } = useAuth()
  await initAuth()
})

// Agregar Google Material Icons desde CDN
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons'
    }
  ]
})
</script>

<style>
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}
</style>
