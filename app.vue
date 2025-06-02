<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { initAuth } = useAuth()

onMounted(async () => {
  console.log('Inicializando aplicación con usuario demo')
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
}
</style>
