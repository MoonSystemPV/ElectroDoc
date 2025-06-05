<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <div class="mb-10">
        <h1 class="text-4xl font-extrabold tracking-tight text-blue-500 dark:text-white mb-2 animate-fade-in">Dashboard</h1>
        <p class="text-lg text-zinc-500 dark:text-zinc-300 animate-fade-in delay-100">Bienvenido a tu panel de control de ElectroDoc.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <!-- Tarjeta de resumen de proyectos -->
        <div class="bg-gradient-to-br from-white to-blue-50 dark:from-zinc-800 dark:to-blue-900/20 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in cursor-default select-none">
          <div class="flex items-center mb-4">
            <span class="material-icons text-blue-400 dark:text-blue-300 mr-3 text-5xl group-hover:animate-pulse transition-transform">engineering</span>
            <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Proyectos</h2>
          </div>
          <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="5">5</p>
          <p class="text-zinc-400 text-sm">Proyectos activos</p>
        </div>
        <!-- Tarjeta de resumen de documentos -->
        <div class="bg-gradient-to-br from-white to-green-50 dark:from-zinc-800 dark:to-green-900/20 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-100 cursor-default select-none">
          <div class="flex items-center mb-4">
            <span class="material-icons text-amber-400 dark:text-amber-300 mr-3 text-5xl group-hover:animate-pulse transition-transform">description</span>
            <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Documentos</h2>
          </div>
          <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="24">24</p>
          <p class="text-zinc-400 text-sm">Documentos gestionados</p>
        </div>
        <!-- Tarjeta de resumen de usuarios -->
        <div class="bg-gradient-to-br from-white to-cyan-50 dark:from-zinc-800 dark:to-cyan-900/20 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-200 cursor-default select-none">
          <div class="flex items-center mb-4">
            <span class="material-icons text-cyan-400 dark:text-cyan-300 mr-3 text-5xl group-hover:animate-pulse transition-transform">people</span>
            <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Usuarios</h2>
          </div>
          <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="7">7</p>
          <p class="text-zinc-400 text-sm">Usuarios activos</p>
        </div>
            </div>
      <!-- Línea de tiempo de actividad reciente -->
      <div class="mt-12 bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl transition-colors animate-fade-in delay-300">
        <h2 class="text-2xl font-bold mb-8 text-blue-500 dark:text-blue-400">Actividad Reciente</h2>
        <div class="relative pl-8 space-y-10">
          <!-- Línea vertical -->
          <div class="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 dark:from-blue-900 to-transparent rounded-full"></div>
          <!-- Evento 1 -->
          <div class="flex items-start gap-4 animate-fade-in">
            <span class="material-icons text-blue-400 dark:text-blue-300 bg-white dark:bg-zinc-900 rounded-full p-2 shadow-md border border-blue-100 dark:border-blue-700">task_alt</span>
            <div>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 mb-1">Aprobado</span>
              <p class="font-semibold text-zinc-800 dark:text-zinc-100">Documento aprobado</p>
              <p class="text-sm text-zinc-400">Plano eléctrico Proyecto Norte - hace 2 horas</p>
            </div>
          </div>
          <!-- Evento 2 -->
          <div class="flex items-start gap-4 animate-fade-in delay-100">
            <span class="material-icons text-amber-400 dark:text-amber-300 bg-white dark:bg-zinc-900 rounded-full p-2 shadow-md border border-amber-100 dark:border-amber-700">add_circle</span>
            <div>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 mb-1">Nuevo</span>
              <p class="font-semibold text-zinc-800 dark:text-zinc-100">Nuevo proyecto creado</p>
              <p class="text-sm text-zinc-400">Instalación Eléctrica Edificio Central - hace 1 día</p>
            </div>
          </div>
          <!-- Evento 3 -->
          <div class="flex items-start gap-4 animate-fade-in delay-200">
            <span class="material-icons text-cyan-400 dark:text-cyan-300 bg-white dark:bg-zinc-900 rounded-full p-2 shadow-md border border-cyan-100 dark:border-cyan-700">upload_file</span>
              <div>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 mb-1">Subido</span>
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
import { onMounted, nextTick } from 'vue'
import MainLayout from '~/components/layout/MainLayout.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: ['auth']
})

const { user } = useAuth()

// Animación de conteo para los números de las tarjetas
const animateCount = (element) => {
  const target = parseInt(element.getAttribute('data-count') || '0')
  const duration = 1500 // 1.5 seconds
  const steps = 60 // 60 steps for smooth animation
  const stepDuration = duration / steps
  const increment = target / steps
  let current = 0
  let step = 0

  const updateCount = () => {
    step++
    current = Math.min(Math.round(increment * step), target)
    element.textContent = current.toString()

    if (step < steps) {
      setTimeout(updateCount, stepDuration)
    } else {
      // Add bounce effect when reaching target
      element.classList.add('animate-bounce')
      setTimeout(() => {
        element.classList.remove('animate-bounce')
      }, 500)
    }
  }

  updateCount()
}

onMounted(() => {
  nextTick(() => {
    document.querySelectorAll('.animate-count').forEach(el => {
      if (el instanceof HTMLElement) {
        animateCount(el)
}
    })
  })
  console.log('Dashboard cargado para usuario:', user.value?.nombre)
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
}

.animate-fade-in {
  animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
}

.animate-fade-in.delay-100 { animation-delay: 0.1s; }
.animate-fade-in.delay-200 { animation-delay: 0.2s; }
.animate-fade-in.delay-300 { animation-delay: 0.3s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-bounce {
  animation: bounce 0.5s cubic-bezier(.4,0,.2,1);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.animate-pulse {
  animation: pulse 1s cubic-bezier(.4,0,.2,1) infinite;
}
</style> 