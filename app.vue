<template>
  <div>
    <NuxtPage />
    <transition name="fade">
      <div
        v-if="toast.show"
        :class="[
          'fixed bottom-8 right-8 px-8 py-5 rounded-xl shadow-2xl text-white z-50 text-lg font-semibold flex items-center gap-3',
          toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600',
          toast.type === 'error' ? 'border-4 border-red-400' : ''
        ]"
        style="min-width: 320px; max-width: 90vw;"
      >
        <span v-if="toast.type === 'error'" class="material-icons text-2xl mr-2">error</span>
        <span v-else-if="toast.type === 'success'" class="material-icons text-2xl mr-2">check_circle</span>
        <span v-else class="material-icons text-2xl mr-2">info</span>
        <span>{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'

// Inicializar autenticación cuando la aplicación se carga
onMounted(async () => {
  const { initAuth } = useAuth()
  await initAuth()
})

const { toast } = useToast()

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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}
</style>
