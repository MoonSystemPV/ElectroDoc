<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <!-- Statistics Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Proyectos Activos</h2>
          <p class="text-3xl font-bold text-blue-600">12</p>
          <p class="mt-2 text-sm text-gray-500">Aumento del 8% en el último mes</p>
        </div>
        
        <!-- Documents Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Documentos Recientes</h2>
          <p class="text-3xl font-bold text-blue-600">48</p>
          <p class="mt-2 text-sm text-gray-500">16 documentos nuevos esta semana</p>
        </div>
        
        <!-- Tasks Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Tareas Pendientes</h2>
          <p class="text-3xl font-bold text-blue-600">7</p>
          <p class="mt-2 text-sm text-gray-500">2 tareas con vencimiento hoy</p>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h2>
        <ul class="divide-y divide-gray-200">
          <li class="py-4">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <span class="material-icons text-blue-500">description</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  Informe técnico actualizado
                </p>
                <p class="text-sm text-gray-500 truncate">
                  Proyecto Subestación Central
                </p>
              </div>
              <div>
                <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Completado</span>
              </div>
            </div>
          </li>
          <li class="py-4">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <span class="material-icons text-blue-500">folder_shared</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  Compartido con cliente
                </p>
                <p class="text-sm text-gray-500 truncate">
                  Documentación técnica - Proyecto Línea 220kV
                </p>
              </div>
              <div>
                <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Compartido</span>
              </div>
            </div>
          </li>
          <li class="py-4">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <span class="material-icons text-blue-500">edit</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  Revisión de planos eléctricos
                </p>
                <p class="text-sm text-gray-500 truncate">
                  Proyecto Subestación Norte
                </p>
              </div>
              <div>
                <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">En progreso</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import MainLayout from '~/components/layout/MainLayout.vue'

// Definir que esta página requiere autenticación
definePageMeta({
  middleware: ['auth']
})

const { user, logout } = useAuth()
const router = useRouter()

// Manejar el cierre de sesión
const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

onMounted(() => {
  console.log('Dashboard montado')
})
</script> 