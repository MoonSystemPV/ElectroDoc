<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-md hidden md:block">
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 class="text-xl font-semibold text-primary-600">ElectroDoc</h1>
      </div>
      <nav class="mt-6 px-3">
        <div class="space-y-1">
          <NuxtLink to="/dashboard" class="group flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="[
            $route.path === '/dashboard' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
          ]">
            <span class="material-icons mr-3 text-sm" :class="[
              $route.path === '/dashboard' ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
            ]">dashboard</span>
            Dashboard
          </NuxtLink>
          
          <NuxtLink to="/projects" class="group flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="[
            $route.path.startsWith('/project') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
          ]">
            <span class="material-icons mr-3 text-sm" :class="[
              $route.path.startsWith('/project') ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
            ]">folder</span>
            Proyectos
          </NuxtLink>
          
          <NuxtLink to="/documents" class="group flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="[
            $route.path.startsWith('/document') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
          ]">
            <span class="material-icons mr-3 text-sm" :class="[
              $route.path.startsWith('/document') ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
            ]">description</span>
            Documentos
          </NuxtLink>
          
          <NuxtLink to="/tasks" class="group flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="[
            $route.path.startsWith('/task') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
          ]">
            <span class="material-icons mr-3 text-sm" :class="[
              $route.path.startsWith('/task') ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
            ]">assignment</span>
            Tareas
          </NuxtLink>
          
          <NuxtLink to="/users" class="group flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="[
            $route.path.startsWith('/user') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
          ]">
            <span class="material-icons mr-3 text-sm" :class="[
              $route.path.startsWith('/user') ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
            ]">people</span>
            Usuarios
          </NuxtLink>
        </div>
        
        <div class="mt-8">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Configuración
          </h3>
          <div class="mt-1 space-y-1">
            <NuxtLink to="/profile" class="group flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="[
              $route.path.startsWith('/profile') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
            ]">
              <span class="material-icons mr-3 text-sm" :class="[
                $route.path.startsWith('/profile') ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
              ]">person</span>
              Mi perfil
            </NuxtLink>
            
            <NuxtLink to="/settings" class="group flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="[
              $route.path.startsWith('/settings') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
            ]">
              <span class="material-icons mr-3 text-sm" :class="[
                $route.path.startsWith('/settings') ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-700'
              ]">settings</span>
              Configuración
            </NuxtLink>
          </div>
        </div>
      </nav>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top navigation -->
      <div class="bg-white shadow z-10">
        <div class="mx-auto px-2 sm:px-4 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex px-2 lg:px-0">
              <div class="flex-shrink-0 flex items-center">
                <!-- Mobile logo -->
                <h1 class="text-xl font-semibold text-primary-600 md:hidden">ElectroDoc</h1>
              </div>
              <button class="px-4 text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-600 md:hidden">
                <span class="material-icons">menu</span>
              </button>
            </div>
            <div class="flex items-center">
              <!-- Search -->
              <div class="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
                <div class="max-w-lg w-full lg:max-w-xs">
                  <label for="search" class="sr-only">Buscar</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="material-icons text-gray-400 text-sm">search</span>
                    </div>
                    <input id="search" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 sm:text-sm" placeholder="Buscar" type="search">
                  </div>
                </div>
              </div>
              
              <!-- Notifications -->
              <button class="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span class="material-icons">notifications</span>
              </button>
              
              <!-- Profile dropdown -->
              <div class="ml-4 relative flex-shrink-0">
                <div>
                  <button class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span class="sr-only">Abrir menú de usuario</span>
                    <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                      <span class="font-medium text-sm">JS</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
// Layout component logic
</script> 