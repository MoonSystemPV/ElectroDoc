<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <h1 class="text-3xl font-extrabold mb-8 text-pink-500 dark:text-pink-400 tracking-tight">Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Tarjeta de resumen de proyectos -->
        <div class="bg-white dark:bg-zinc-800 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-colors">
          <div class="flex items-center mb-4">
            <span class="material-icons text-pink-400 dark:text-pink-300 mr-3 text-4xl">engineering</span>
            <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Proyectos</h2>
          </div>
          <p class="text-4xl font-extrabold mb-2 text-zinc-900 dark:text-white">5</p>
          <p class="text-zinc-400 text-sm">Proyectos activos</p>
        </div>
        <!-- Tarjeta de resumen de documentos -->
        <div class="bg-white dark:bg-zinc-800 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-colors">
          <div class="flex items-center mb-4">
            <span class="material-icons text-amber-400 mr-3 text-4xl">description</span>
            <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Documentos</h2>
          </div>
          <p class="text-4xl font-extrabold mb-2 text-zinc-900 dark:text-white">24</p>
          <p class="text-zinc-400 text-sm">Documentos gestionados</p>
        </div>
        <!-- Tarjeta de resumen de usuarios -->
        <div class="bg-white dark:bg-zinc-800 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-colors">
          <div class="flex items-center mb-4">
            <span class="material-icons text-cyan-400 mr-3 text-4xl">people</span>
            <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Usuarios</h2>
          </div>
          <p class="text-4xl font-extrabold mb-2 text-zinc-900 dark:text-white">7</p>
          <p class="text-zinc-400 text-sm">Usuarios activos</p>
        </div>
      </div>
      <div class="mt-12 bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl transition-colors">
        <h2 class="text-xl font-bold mb-6 text-pink-500 dark:text-pink-400">Actividad Reciente</h2>
        <div class="space-y-6">
          <div class="flex items-start">
            <span class="material-icons text-pink-400 dark:text-pink-300 mr-4 text-3xl">task_alt</span>
            <div>
              <p class="font-semibold text-zinc-800 dark:text-zinc-100">Documento aprobado</p>
              <p class="text-sm text-zinc-400">Plano eléctrico Proyecto Norte - hace 2 horas</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="material-icons text-amber-400 mr-4 text-3xl">add_circle</span>
            <div>
              <p class="font-semibold text-zinc-800 dark:text-zinc-100">Nuevo proyecto creado</p>
              <p class="text-sm text-zinc-400">Instalación Eléctrica Edificio Central - hace 1 día</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="material-icons text-cyan-400 mr-4 text-3xl">upload_file</span>
            <div>
              <p class="font-semibold text-zinc-800 dark:text-zinc-100">Documento subido</p>
              <p class="text-sm text-zinc-400">Certificado TE1 Proyecto Sur - hace 2 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import MainLayout from '~/components/layout/MainLayout.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: ['auth']
})

const { user } = useAuth()

onMounted(() => {
  console.log('Dashboard cargado para usuario:', user.value?.nombre)
})
</script> 