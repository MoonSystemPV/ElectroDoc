<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <div class="mb-10">
        <h1 class="text-4xl font-extrabold tracking-tight text-blue-500 dark:text-white mb-2 animate-fade-in">Dashboard</h1>
        <p class="text-lg text-zinc-500 dark:text-zinc-300 animate-fade-in delay-100">Bienvenido a tu panel de control de ElectroDoc.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <template v-if="isTechnician">
          <!-- Cuadro: Tareas atrasadas -->
          <div class="bg-gradient-to-br from-white to-red-100 dark:from-zinc-800 dark:to-red-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-250 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-red-500 dark:text-red-400 mr-3 text-5xl group-hover:scale-110 transition">warning</span>
              <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">Tareas atrasadas</h2>
            </div>
            <p class="text-3xl font-extrabold text-red-700 dark:text-red-300 mb-2">{{ tareasAtrasadasTecnico }}</p>
          </div>
          <!-- Cuadro: Tareas pendientes -->
          <div class="bg-gradient-to-br from-white to-yellow-100 dark:from-zinc-800 dark:to-yellow-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-250 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-yellow-500 dark:text-yellow-400 mr-3 text-5xl group-hover:scale-110 transition">pending_actions</span>
              <h2 class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Tareas pendientes</h2>
            </div>
            <p class="text-3xl font-extrabold text-yellow-700 dark:text-yellow-300 mb-2">{{ tareasPendientesTecnico }}</p>
          </div>
          <!-- Cuadro: Tareas completadas -->
          <div class="bg-gradient-to-br from-white to-green-100 dark:from-zinc-800 dark:to-green-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-250 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-green-500 dark:text-green-400 mr-3 text-5xl group-hover:scale-110 transition">check_circle</span>
              <h2 class="text-2xl font-bold text-green-600 dark:text-green-400">Tareas completadas</h2>
            </div>
            <p class="text-3xl font-extrabold text-green-700 dark:text-green-300 mb-2">{{ tareasCompletadasTecnico }}</p>
          </div>
        </template>
        <template v-else-if="isSupervisor">
          <!-- Documentos validados -->
          <div class="bg-gradient-to-br from-white to-green-100 dark:from-zinc-800 dark:to-green-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-250 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-green-500 dark:text-green-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">verified</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Documentos validados</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="documentosValidadosSupervisor">{{ documentosValidadosSupervisor }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Documentos validados')">Ver más</button>
          </div>
          <!-- Documentos rechazados -->
          <div class="bg-gradient-to-br from-white to-red-50 dark:from-zinc-800 dark:to-red-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-200 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-red-500 dark:text-red-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">block</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Documentos rechazados</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="documentosRechazados">{{ documentosRechazados }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Documentos rechazados')">Ver más</button>
          </div>
          <!-- Técnicos de sus proyectos -->
          <div class="bg-gradient-to-br from-white to-cyan-50 dark:from-zinc-800 dark:to-cyan-900/20 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-300 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-cyan-400 dark:text-cyan-300 mr-3 text-5xl group-hover:animate-pulse transition-transform">people</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{{ usuariosBoxTitle }}</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="filteredUsuarios.length">{{ filteredUsuarios.length }}</p>
            <p class="text-zinc-400 text-sm">Técnicos activos en tus proyectos</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Usuarios')">Ver más</button>
          </div>
          <!-- Tareas atrasadas -->
          <div class="bg-gradient-to-br from-white to-red-100 dark:from-zinc-800 dark:to-red-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-350 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-red-500 dark:text-red-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">error</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Tareas atrasadas</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="tareasAtrasadasSupervisor">{{ tareasAtrasadasSupervisor }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Tareas atrasadas')">Ver más</button>
          </div>
          <!-- Tareas pendientes -->
          <div class="bg-gradient-to-br from-white to-yellow-100 dark:from-zinc-800 dark:to-yellow-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-400 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-yellow-500 dark:text-yellow-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">hourglass_empty</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Tareas pendientes</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="tareasPendientesSupervisor">{{ tareasPendientesSupervisor }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Tareas pendientes')">Ver más</button>
          </div>
          <!-- Tareas completadas -->
          <div class="bg-gradient-to-br from-white to-green-100 dark:from-zinc-800 dark:to-green-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-450 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-green-500 dark:text-green-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">task_alt</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Tareas completadas</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="tareasCompletadasSupervisor">{{ tareasCompletadasSupervisor }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Tareas completadas')">Ver más</button>
          </div>
        </template>
        <template v-else>
          <!-- Cuadros de Proyectos: solo para no supervisores -->
          <template v-if="!isSupervisor">
            <!-- Tarjeta de resumen de proyectos -->
            <div class="bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in cursor-default select-none">
              <div class="flex items-center mb-4">
                <span class="material-icons text-zinc-400 dark:text-zinc-300 mr-3 text-5xl group-hover:animate-pulse transition-transform">folder</span>
                <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Proyectos</h2>
              </div>
              <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="totalProyectos">{{ totalProyectos }}</p>
              <p class="text-zinc-400 text-sm">Proyectos totales</p>
              <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Proyectos')">Ver más</button>
            </div>
            <!-- Proyectos en ejecución -->
            <div class="bg-gradient-to-br from-white to-blue-100 dark:from-zinc-800 dark:to-blue-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-50 cursor-default select-none">
              <div class="flex items-center mb-4">
                <span class="material-icons text-blue-500 dark:text-blue-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">play_circle</span>
                <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Proyectos en ejecución</h2>
              </div>
              <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="proyectosEjecucion">{{ proyectosEjecucion }}</p>
              <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Proyectos en ejecución')">Ver más</button>
            </div>
            <!-- Proyectos retrasados -->
            <div class="bg-gradient-to-br from-white to-red-100 dark:from-zinc-800 dark:to-red-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-100 cursor-default select-none">
              <div class="flex items-center mb-4">
                <span class="material-icons text-red-500 dark:text-red-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">schedule</span>
                <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Proyectos retrasados</h2>
              </div>
              <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="proyectosRetrasados">{{ proyectosRetrasados }}</p>
              <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Proyectos retrasados')">Ver más</button>
            </div>
            <!-- Proyectos finalizados -->
            <div class="bg-gradient-to-br from-white to-green-100 dark:from-zinc-800 dark:to-green-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-150 cursor-default select-none">
              <div class="flex items-center mb-4">
                <span class="material-icons text-green-500 dark:text-green-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">check_circle</span>
                <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Proyectos finalizados</h2>
              </div>
              <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="proyectosFinalizados">{{ proyectosFinalizados }}</p>
              <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Proyectos finalizados')">Ver más</button>
            </div>
          </template>
          <!-- Documentos rechazados para supervisor, retrasados para otros -->
          <div v-if="isSupervisor" class="bg-gradient-to-br from-white to-red-50 dark:from-zinc-800 dark:to-red-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-200 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-red-500 dark:text-red-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">block</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Documentos rechazados</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="documentosRechazados">{{ documentosRechazados }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Documentos rechazados')">Ver más</button>
          </div>
          <div v-else class="bg-gradient-to-br from-white to-red-50 dark:from-zinc-800 dark:to-red-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-200 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-red-500 dark:text-red-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">warning</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Documentos retrasados</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="documentosRetrasados">{{ documentosRetrasados }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Documentos retrasados')">Ver más</button>
          </div>
          <!-- Documentos validados -->
          <div class="bg-gradient-to-br from-white to-green-100 dark:from-zinc-800 dark:to-green-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-250 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-green-500 dark:text-green-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">verified</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Documentos validados</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="documentosValidadosSupervisor">{{ documentosValidadosSupervisor }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Documentos validados')">Ver más</button>
          </div>
          <!-- Usuarios -->
          <div class="bg-gradient-to-br from-white to-cyan-50 dark:from-zinc-800 dark:to-cyan-900/20 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-300 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-cyan-400 dark:text-cyan-300 mr-3 text-5xl group-hover:animate-pulse transition-transform">people</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{{ usuariosBoxTitle }}</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="filteredUsuarios.length">{{ filteredUsuarios.length }}</p>
            <p class="text-zinc-400 text-sm">{{ isSupervisor ? 'Técnicos activos en tus proyectos' : 'Usuarios activos' }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Usuarios')">Ver más</button>
          </div>
          <!-- Tareas atrasadas -->
          <div class="bg-gradient-to-br from-white to-red-100 dark:from-zinc-800 dark:to-red-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-350 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-red-500 dark:text-red-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">error</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Tareas atrasadas</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="tareasAtrasadasSupervisor">{{ tareasAtrasadasSupervisor }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Tareas atrasadas')">Ver más</button>
          </div>
          <!-- Tareas pendientes -->
          <div class="bg-gradient-to-br from-white to-yellow-100 dark:from-zinc-800 dark:to-yellow-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-400 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-yellow-500 dark:text-yellow-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">hourglass_empty</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Tareas pendientes</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="tareasPendientesSupervisor">{{ tareasPendientesSupervisor }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Tareas pendientes')">Ver más</button>
          </div>
          <!-- Tareas completadas -->
          <div class="bg-gradient-to-br from-white to-green-100 dark:from-zinc-800 dark:to-green-900/10 p-7 rounded-2xl shadow-xl flex flex-col items-start transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group animate-fade-in delay-450 cursor-default select-none">
            <div class="flex items-center mb-4">
              <span class="material-icons text-green-500 dark:text-green-400 mr-3 text-5xl group-hover:animate-pulse transition-transform">task_alt</span>
              <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Tareas completadas</h2>
            </div>
            <p class="text-5xl font-extrabold mb-2 text-zinc-900 dark:text-white animate-count select-none" :data-count="tareasCompletadasSupervisor">{{ tareasCompletadasSupervisor }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" @click="openModal('Tareas completadas')">Ver más</button>
          </div>
        </template>
      </div>
      <!-- Modal genérico -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-2xl w-full p-8 text-center relative">
          <button @click="showModal = false" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
            <span class="material-icons">close</span>
          </button>
          <h3 class="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">{{ modalTitle }}</h3>
          <template v-if="modalTitle === 'Proyectos' || modalTitle === 'Proyectos en ejecución' || modalTitle === 'Proyectos retrasados' || modalTitle === 'Proyectos finalizados'">
            <div class="space-y-4 text-left max-h-[420px] overflow-y-auto pr-2">
              <div v-for="proyecto in filteredProyectos.slice(0, 5)" :key="proyecto.id" class="rounded-xl shadow p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 flex flex-col md:flex-row md:items-center md:justify-between transition-colors">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="material-icons text-blue-500 dark:text-blue-300">folder</span>
                    <span class="font-bold text-lg text-zinc-800 dark:text-zinc-100">{{ proyecto.nombre }}</span>
                  </div>
                  <div class="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-300">
                    <span><b>Estado:</b> <span class="capitalize">{{ proyecto.estado }}</span></span>
                    <span><b>Inicio:</b> {{ proyecto.fechaInicio ? new Date(proyecto.fechaInicio).toLocaleDateString() : '-' }}</span>
                    <span><b>Fin:</b> {{ proyecto.fechaFin ? new Date(proyecto.fechaFin).toLocaleDateString() : '-' }}</span>
                  </div>
                </div>
              </div>
              <div v-if="filteredProyectos.length === 0" class="text-center text-zinc-500 dark:text-zinc-400 py-8">No hay proyectos para mostrar.</div>
            </div>
          </template>
          <template v-else-if="modalTitle === 'Documentos retrasados' || modalTitle === 'Documentos validados'">
            <div class="space-y-4 text-left max-h-[420px] overflow-y-auto pr-2">
              <div v-for="documento in filteredDocumentos.slice(0, 5)" :key="documento.id" class="rounded-xl shadow p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 flex flex-col md:flex-row md:items-center md:justify-between transition-colors">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="material-icons text-green-500 dark:text-green-300">description</span>
                    <span class="font-bold text-lg text-zinc-800 dark:text-zinc-100">{{ documento.nombre }}</span>
                  </div>
                  <div class="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-300 mb-1">
                    <span><b>Estado:</b> <span class="capitalize">{{ documento.estado }}</span></span>
                    <span><b>Proyecto:</b> {{ getProjectName(documento.proyectoId) }}</span>
                  </div>
                  <div v-if="documento.comentarios" class="text-xs italic text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-zinc-700 rounded px-2 py-1 w-fit max-w-full truncate">
                    "{{ documento.comentarios }}"
                  </div>
                </div>
              </div>
              <div v-if="filteredDocumentos.length === 0" class="text-center text-zinc-500 dark:text-zinc-400 py-8">No hay documentos para mostrar.</div>
            </div>
          </template>
          <template v-else-if="modalTitle === 'Usuarios'">
            <div class="space-y-4 text-left max-h-[420px] overflow-y-auto pr-2">
              <div v-for="usuario in filteredUsuarios.slice(0, 5)" :key="usuario.id || usuario.uid" class="rounded-xl shadow p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 flex flex-col md:flex-row md:items-center md:justify-between transition-colors">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="material-icons text-cyan-500 dark:text-cyan-300">person</span>
                    <span class="font-bold text-lg text-zinc-800 dark:text-zinc-100">{{ usuario.nombre || usuario.displayName || usuario.email }}</span>
                  </div>
                  <div class="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-300">
                    <span><b>Proyecto:</b> {{ getProjectName(usuario.proyectoId) }}</span>
                    <span><b>Rol:</b> {{ usuario.role || '-' }}</span>
                  </div>
                </div>
              </div>
              <div v-if="filteredUsuarios.length === 0" class="text-center text-zinc-500 dark:text-zinc-400 py-8">No hay usuarios para mostrar.</div>
            </div>
          </template>
          <template v-else-if="modalTitle === 'Tareas atrasadas' || modalTitle === 'Tareas pendientes' || modalTitle === 'Tareas completadas'">
            <div class="space-y-4 text-left max-h-[420px] overflow-y-auto pr-2">
              <div v-for="tarea in filteredTareas.slice(0, 5)" :key="tarea.id" class="rounded-xl shadow p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 flex flex-col md:flex-row md:items-center md:justify-between transition-colors">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="material-icons text-yellow-500 dark:text-yellow-300">task_alt</span>
                    <span class="font-bold text-lg text-zinc-800 dark:text-zinc-100 line-clamp-3" :title="tarea.nombre">
                      {{ tarea.nombre }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-300">
                    <span><b>Estado:</b> <span class="capitalize">{{ tarea.estado }}</span></span>
                    <span><b>Inicio:</b> {{ formatFecha(tarea.createdAt) }}</span>
                    <span><b>Fin:</b> {{ formatFecha(tarea.fechaVencimiento) }}</span>
                    <span><b>Técnico:</b> {{ getTecnicoName(tarea.tecnicosAsignados) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="filteredTareas.length === 0" class="text-center text-zinc-500 dark:text-zinc-400 py-8">No hay tareas para mostrar.</div>
            </div>
          </template>
          <template v-else>
            <p class="text-lg text-zinc-600 dark:text-zinc-200">Aquí se mostrará <b>{{ modalTitle }}</b></p>
          </template>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import MainLayout from '~/components/layout/MainLayout.vue'
import { useAuth } from '~/composables/useAuth'
import { useProjects } from '~/composables/useProjects'
import { useDocuments } from '~/composables/useDocuments'
import { useTasks } from '~/composables/useTasks'
import { db } from '@/utils/firebase'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: ['auth']
})

const { user, getAllUsers } = useAuth()
const { getProjects } = useProjects()
const { fetchDocumentsFromFirestore } = useDocuments()
const { getTasksByProjectId } = useTasks()
const router = useRouter()

const totalProyectos = ref(0)
const totalDocumentos = ref(0)
const totalUsuarios = ref(0)
const proyectosEjecucion = ref(0)
const proyectosRetrasados = ref(0)
const proyectosFinalizados = ref(0)
const documentosRetrasados = ref(0)
const documentosValidados = ref(0)
const tareasAtrasadas = ref(0)
const tareasPendientes = ref(0)
const tareasCompletadas = ref(0)
const proyectosPorId = ref({})
const proyectos = ref([])
const documentos = ref([])
const usuarios = ref([])
const tareas = ref([])
const showModal = ref(false)
const modalTitle = ref('')

const isSupervisor = computed(() => user.value?.role === 'supervisor')
const isTechnician = computed(() => user.value?.role === 'tecnico')
const supervisorProjectIds = computed(() => {
  if (!isSupervisor.value || !user.value?.id) return []
  return proyectos.value.filter(p => p.supervisorId === user.value.id).map(p => p.id)
})
const documentosRechazados = computed(() => {
  if (!isSupervisor.value) return documentos.value.filter(d => d.estado === 'rechazado').length
  return documentos.value.filter(d => d.estado === 'rechazado' && supervisorProjectIds.value.includes(d.projectId || d.proyectoId)).length
})
const documentosValidadosSupervisor = computed(() => {
  if (!isSupervisor.value) return documentos.value.filter(d => d.estado === 'validado').length
  return documentos.value.filter(d => d.estado === 'validado' && supervisorProjectIds.value.includes(d.projectId || d.proyectoId)).length
})
const tareasAtrasadasSupervisor = computed(() => {
  if (!isSupervisor.value) return tareas.value.filter(t => t.estado === 'atrasada').length
  return tareas.value.filter(t => t.estado === 'atrasada' && supervisorProjectIds.value.includes(t.proyectoId || t.projectId)).length
})
const tareasPendientesSupervisor = computed(() => {
  if (!isSupervisor.value) return tareas.value.filter(t => t.estado === 'pendiente').length
  return tareas.value.filter(t => t.estado === 'pendiente' && supervisorProjectIds.value.includes(t.proyectoId || t.projectId)).length
})
const tareasCompletadasSupervisor = computed(() => {
  if (!isSupervisor.value) return tareas.value.filter(t => t.estado === 'completada').length
  return tareas.value.filter(t => t.estado === 'completada' && supervisorProjectIds.value.includes(t.proyectoId || t.projectId)).length
})
const usuariosBoxTitle = computed(() => isSupervisor.value ? 'Técnicos de mis proyectos' : 'Usuarios')
const filteredUsuarios = computed(() => {
  if (isSupervisor.value) {
    const tecnicosIds = new Set()
    tareas.value.forEach(t => {
      if (supervisorProjectIds.value.includes(t.proyectoId || t.projectId) && Array.isArray(t.tecnicosAsignados)) {
        t.tecnicosAsignados.forEach(id => tecnicosIds.add(id))
      }
    })
    return usuarios.value.filter(u => u.role === 'tecnico' && tecnicosIds.has(u.id || u.uid))
  }
  if (modalTitle.value === 'Usuarios') return usuarios.value
  return []
})
const filteredDocumentos = computed(() => {
  if (isSupervisor.value) {
    if (modalTitle.value === 'Documentos rechazados') {
      return documentos.value.filter(d => d.estado === 'rechazado' && supervisorProjectIds.value.includes(d.projectId || d.proyectoId))
    }
    if (modalTitle.value === 'Documentos validados') {
      return documentos.value.filter(d => d.estado === 'validado' && supervisorProjectIds.value.includes(d.projectId || d.proyectoId))
    }
  }
  if (modalTitle.value === 'Documentos retrasados') return documentos.value.filter(d => d.estado === 'atrasada' || d.estado === 'retrasado')
  if (modalTitle.value === 'Documentos validados') return documentos.value.filter(d => d.estado === 'validado')
  if (modalTitle.value === 'Documentos rechazados') return documentos.value.filter(d => d.estado === 'rechazado')
  return []
})
const filteredTareas = computed(() => {
  if (isSupervisor.value) {
    return tareas.value.filter(t => supervisorProjectIds.value.includes(t.proyectoId || t.projectId))
  }
  if (modalTitle.value === 'Tareas atrasadas') return tareas.value.filter(t => t.estado === 'atrasada')
  if (modalTitle.value === 'Tareas pendientes') return tareas.value.filter(t => t.estado === 'pendiente')
  if (modalTitle.value === 'Tareas completadas') return tareas.value.filter(t => t.estado === 'completada')
  return []
})

const filteredProyectos = computed(() => {
  if (modalTitle.value === 'Proyectos') return proyectos.value
  if (modalTitle.value === 'Proyectos en ejecución') return proyectos.value.filter(p => p.estado === 'activo')
  if (modalTitle.value === 'Proyectos retrasados') return proyectos.value.filter(p => p.estado === 'retrasado')
  if (modalTitle.value === 'Proyectos finalizados') return proyectos.value.filter(p => p.estado === 'completado')
  return []
})

// Tareas asignadas al técnico
const tareasTecnico = computed(() => {
  if (!isTechnician.value || !user.value?.id || !Array.isArray(tareas.value)) return []
  return tareas.value.filter(t => Array.isArray(t.tecnicosAsignados) && t.tecnicosAsignados.includes(user.value.id))
})

const tareasAtrasadasTecnico = computed(() => tareasTecnico.value.filter(t => t.estado === 'atrasada').length)
const tareasPendientesTecnico = computed(() => tareasTecnico.value.filter(t => t.estado === 'pendiente').length)
const tareasCompletadasTecnico = computed(() => tareasTecnico.value.filter(t => t.estado === 'completada').length)

onMounted(async () => {
  // Cargar proyectos
  const proyectosData = await getProjects()
  console.log('Proyectos obtenidos:', proyectosData)
  // Forzar que todos tengan campo 'nombre'
  proyectos.value = proyectosData.map(p => ({
    ...p,
    nombre: (typeof p.nombre === 'string' && p.nombre.trim().length > 0) ? p.nombre : p.id
  }))
  totalProyectos.value = proyectos.value.length
  proyectosEjecucion.value = proyectos.value.filter(p => p.estado === 'activo').length
  proyectosRetrasados.value = proyectos.value.filter(p => p.estado === 'retrasado').length
  proyectosFinalizados.value = proyectos.value.filter(p => p.estado === 'completado').length

  // Cargar documentos
  const documentosData = await fetchDocumentsFromFirestore()
  documentos.value = documentosData
  totalDocumentos.value = documentosData.length
  documentosRetrasados.value = documentosData.filter(d => d.estado === 'atrasada' || d.estado === 'retrasado').length
  documentosValidados.value = documentosData.filter(d => d.estado === 'validado').length

  // Cargar usuarios
  const usuariosData = await getAllUsers()
  usuarios.value = usuariosData
  totalUsuarios.value = usuariosData.length

  // Cargar tareas
  const { collection, getDocs, updateDoc, doc } = await import('firebase/firestore')
  const tareasSnapshot = await getDocs(collection(db, 'tareas'))
  const tareasData = tareasSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  tareas.value = tareasData

  // Actualizar tareas vencidas a 'atrasada' en Firestore
  const hoy = new Date()
  for (const tarea of tareasData) {
    if (
      tarea.estado === 'pendiente' &&
      tarea.fechaVencimiento &&
      new Date(tarea.fechaVencimiento) < hoy
    ) {
      try {
        await updateDoc(doc(db, 'tareas', tarea.id), { estado: 'atrasada' })
        tarea.estado = 'atrasada'
      } catch (e) {
        console.error('Error actualizando tarea a atrasada:', tarea.id, e)
      }
    }
  }

  tareasAtrasadas.value = tareasData.filter(t => t.estado === 'atrasada').length
  tareasPendientes.value = tareasData.filter(t => t.estado === 'pendiente').length
  tareasCompletadas.value = tareasData.filter(t => t.estado === 'completada').length

  // Guardar los nombres de proyectos para referencia rápida en los modales
  proyectosPorId.value = Object.fromEntries(proyectos.value.map(p => [p.id, p.nombre]))

  nextTick(() => {
    document.querySelectorAll('.animate-count').forEach(el => {
      if (el instanceof HTMLElement) {
        animateCount(el)
      }
    })
  })
  console.log('Dashboard cargado para usuario:', user.value?.nombre)
})

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

function goToTarea(tarea) {
  router.push({ path: '/Tareas', query: { id: tarea.id } })
}
function goToProyecto(proyecto) {
  router.push({ path: `/projects/${proyecto.id}` })
}
function goToDocumento(documento) {
  // Si tienes una ruta específica para documentos, cámbiala aquí
  router.push({ path: '/documents', query: { id: documento.id } })
}
function goToUsuario(usuario) {
  // Si tienes una ruta específica para usuarios, cámbiala aquí
  router.push({ path: '/profile', query: { id: usuario.uid || usuario.id } })
}

// Agregar función para obtener el nombre del proyecto por ID
function getProjectName(id) {
  // Primero busca en el diccionario
  if (proyectosPorId.value[id]) return proyectosPorId.value[id]
  // Si no está, busca en la lista de proyectos cargados
  const p = proyectos.value.find(p => p.id === id)
  if (p && p.nombre) return p.nombre
  // Si no hay nombre, muestra el ID
  return id
}

function openModal(title) {
  modalTitle.value = title
  showModal.value = true
}

function formatFecha(fecha) {
  if (!fecha) return '-';
  // Firestore Timestamp
  if (fecha.toDate) return fecha.toDate().toLocaleDateString();
  // String ISO
  if (typeof fecha === 'string' && !isNaN(Date.parse(fecha))) return new Date(fecha).toLocaleDateString();
  // Date
  if (fecha instanceof Date) return fecha.toLocaleDateString();
  return '-';
}

function getTecnicoName(tecnicosAsignados) {
  if (!tecnicosAsignados || !Array.isArray(tecnicosAsignados) || tecnicosAsignados.length === 0) return '-';
  
  // Tomar el primer técnico asignado
  const tecnicoId = tecnicosAsignados[0];
  
  // Buscar en la lista de usuarios cargada
  const tecnico = usuarios.value.find(u => u.id === tecnicoId || u.uid === tecnicoId);
  
  if (tecnico) {
    return tecnico.nombre || tecnico.displayName || tecnico.email || '-';
  }
  
  return '-';
}
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