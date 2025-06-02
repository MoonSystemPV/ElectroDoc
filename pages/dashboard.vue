<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Statistics Card -->
            <div class="card">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Proyectos Activos</h2>
              <p class="text-3xl font-bold text-primary-600">12</p>
              <p class="mt-2 text-sm text-gray-500">Aumento del 8% en el último mes</p>
            </div>
            
            <!-- Documents Card -->
            <div class="card">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Documentos Recientes</h2>
              <p class="text-3xl font-bold text-primary-600">48</p>
              <p class="mt-2 text-sm text-gray-500">16 documentos nuevos esta semana</p>
            </div>
            
            <!-- Tasks Card -->
            <div class="card">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Tareas Pendientes</h2>
              <p class="text-3xl font-bold text-primary-600">7</p>
              <p class="mt-2 text-sm text-gray-500">2 tareas con vencimiento hoy</p>
            </div>
          </div>
          
          <!-- Recent Activity -->
          <div class="mt-8">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h2>
            <div class="card">
              <ul class="divide-y divide-gray-200">
                <li class="py-4">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <span class="material-icons text-primary-500">description</span>
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
                      <span class="badge bg-green-100 text-green-800">Completado</span>
                    </div>
                  </div>
                </li>
                <li class="py-4">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <span class="material-icons text-primary-500">folder_shared</span>
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
                      <span class="badge bg-blue-100 text-blue-800">Compartido</span>
                    </div>
                  </div>
                </li>
                <li class="py-4">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <span class="material-icons text-primary-500">edit_document</span>
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
                      <span class="badge bg-yellow-100 text-yellow-800">En progreso</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Dashboard component logic will be added here
</script> 