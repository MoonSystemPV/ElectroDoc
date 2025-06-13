<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Proyectos</h1>
      </div>

      <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 transition-colors">
        <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <input v-model="searchQuery" type="text" placeholder="Buscar proyectos..." class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-72" />
          <select v-model="filterStatus" class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-60">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="completado">Completado</option>
            <option value="suspendido">Suspendido</option>
          </select>
          <button v-if="canEditProjects" @click="openNewProjectModal" class="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-xl shadow transition">
            <span class="material-icons">add</span> Nuevo Proyecto
          </button>
        </div>

        <div v-if="isLoading" class="text-center p-8">
          <div class="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p class="mt-2 text-zinc-600 dark:text-zinc-400">Cargando proyectos...</p>
        </div>

        <div v-else-if="filteredProjects.length === 0" class="text-center p-8">
          <p class="text-lg text-zinc-500 dark:text-zinc-400">No se encontraron proyectos</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="project in filteredProjects" :key="project.id"
            class="bg-zinc-50 dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            :class="{'expired-project': isProjectExpired(project)}"
          >
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    <button @click="openProjectModal(project)" class="hover:text-blue-600 underline transition-colors">
                      {{ project.nombre }}
                    </button>
                  </h3>
                  <p class="text-sm text-zinc-500 dark:text-zinc-400">Encargado: {{ project.supervisor }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    v-if="canEditProjects"
                    @click="deleteProject(project)"
                    class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                  <button 
                    v-if="canEditProjects"
                    @click="editProject(project)"
                    class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                </div>
              </div>
              <div class="space-y-2 mb-4">
                <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                  <span class="material-icons text-blue-500 mr-2">calendar_today</span>
                  <span>Inicio: {{ formatDate(project.fechaInicio) }}</span>
                </div>
                <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                  <span class="material-icons text-blue-500 mr-2">event</span>
                  <span>Fin: {{ formatDate(project.fechaFin) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <button 
                  @click="viewProjectDetails(project)"
                  class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  <span class="material-icons mr-1">folder</span>
                  Ver Carpetas
                </button>
                <button 
                  v-if="canEditProjects"
                  @click="!isProjectExpired(project) && (showStatusModal = true, selectedProjectForStatus = project)"
                  class="text-sm px-3 py-1 rounded-full transition-colors"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400': project.estado === 'activo',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400': project.estado === 'completado',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400': project.estado === 'cancelado',
                    'cursor-not-allowed opacity-60': isProjectExpired(project)
                  }"
                  :disabled="isProjectExpired(project)"
                >
                  {{ isProjectExpired(project) ? 'Caducado' : getStatusText(project.estado) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div class="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 sm:px-6 mt-6 rounded-xl">
          <!-- Versión móvil de paginación -->
          <div class="flex items-center justify-between w-full sm:hidden">
            <button class="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700">
              Anterior
            </button>
            <div class="text-sm text-zinc-700 dark:text-zinc-300">
              <span>Página <span class="font-medium">1</span> de <span class="font-medium">3</span></span>
            </div>
            <button class="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700">
              Siguiente
            </button>
          </div>
          
          <!-- Versión desktop de paginación -->
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-zinc-700 dark:text-zinc-300">
                Mostrando <span class="font-medium">1</span> a <span class="font-medium">6</span> de <span class="font-medium">12</span> resultados
              </p>
            </div>
            <div>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <a href="#" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <span class="material-icons text-sm">chevron_left</span>
                </a>
                <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">1</a>
                <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">2</a>
                <a href="#" class="relative hidden items-center px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 md:inline-flex">3</a>
                <a href="#" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <span class="material-icons text-sm">chevron_right</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Nuevo Proyecto -->
      <div v-if="showNewProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Nuevo Proyecto</h2>
            <button @click="showNewProjectModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <ProjectForm 
            :is-supervisor="isSupervisor"
            :is-admin="isAdmin"
            @submit="handleProjectSubmit" 
            @cancel="showNewProjectModal = false" 
          />
        </div>
      </div>

      <!-- Modal de Editar Proyecto -->
      <div v-if="showEditProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Editar Proyecto</h2>
            <button @click="showEditProjectModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <ProjectForm 
            :project="selectedProject"
            :is-supervisor="isSupervisor"
            :is-admin="isAdmin"
            @submit="handleProjectUpdate" 
            @cancel="showEditProjectModal = false" 
          />
        </div>
      </div>

      <!-- Modal de Carpetas -->
      <div v-if="showFoldersModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <button @click="showFoldersModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">arrow_back</span>
            </button>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Carpetas del Proyecto</h2>
            <div class="flex items-center gap-2">
              <button 
                v-if="isSupervisor"
                @click="showNewFolderModal = true"
                class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <span class="material-icons">create_new_folder</span>
              </button>
              <button @click="showFoldersModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <div 
              v-for="folder in projectFolders" 
              :key="folder.id"
              class="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 relative group"
            >
              <div 
                class="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                @click="openFolder(folder.nombre)"
              >
                <div class="flex items-center justify-center mb-4">
                  <span class="material-icons text-4xl text-blue-500">folder</span>
                </div>
                <h3 class="text-lg font-semibold text-center text-zinc-900 dark:text-zinc-100">{{ folder.nombre }}</h3>
              </div>
              <button 
                v-if="isSupervisor"
                @click="deleteFolder(folder)"
                class="absolute top-2 right-2 p-1 rounded-full text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Nueva Carpeta -->
      <div v-if="showNewFolderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Nueva Carpeta</h3>
            <button @click="showNewFolderModal = false" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <form @submit.prevent="createNewFolder" class="space-y-4">
            <div>
              <label for="folderName" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Nombre de la Carpeta
              </label>
              <input
                id="folderName"
                v-model="newFolderName"
                type="text"
                required
                class="input"
                placeholder="Ej: Documentos Técnicos"
              />
            </div>
            
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                @click="showNewFolderModal = false"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       text-gray-700 dark:text-gray-200 
                       hover:bg-gray-50 dark:hover:bg-zinc-800 
                       focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400
                       transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors
                       dark:bg-blue-500 dark:hover:bg-blue-400"
                :disabled="isCreatingFolder"
              >
                <span v-if="isCreatingFolder" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </span>
                <span v-else>Crear Carpeta</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Contenido de Carpeta -->
      <div v-if="showFolderContentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] p-6 flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <button @click="showFolderContentModal = false; showFoldersModal = true" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">arrow_back</span>
            </button>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{{ selectedFolder }}</h2>
            <button @click="showFolderContentModal = false" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div v-if="folderUrls.length === 0" class="text-center py-8">
              <span class="material-icons text-4xl text-zinc-400 dark:text-zinc-600 mb-2">folder_open</span>
              <p class="text-zinc-500 dark:text-zinc-400">No hay documentos</p>
            </div>
            <div v-else class="flex flex-col gap-4">
              <DocumentCard
                v-for="doc in folderUrls"
                :key="doc.id"
                :document="doc"
                :can-validate="isAdmin || isSupervisor"
                @view="viewDocument"
                @download="downloadDocument"
                @validate="validateDocument"
                @reject="rejectDocument"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Opciones de Estado -->
      <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Cambiar Estado</h3>
            <button @click="showStatusModal = false" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div v-if="!canEditProjects" class="text-red-500 dark:text-red-400 mb-4">
            Solo los supervisores y administradores pueden cambiar el estado del proyecto
          </div>
          <div v-else class="flex flex-col gap-3 mb-4">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              @click="updateProjectStatus(selectedProjectForStatus, option.value)"
              type="button"
              :class="[
                'flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold transition-all border',
                selectedProjectForStatus?.estado === option.value
                  ? option.activeClass
                  : option.inactiveClass,
                selectedProjectForStatus?.estado === option.value ? 'ring-2 ring-blue-400 dark:ring-blue-300' : ''
              ]"
            >
              <span class="material-icons" :class="option.iconClass">{{ option.icon }}</span>
              <span>{{ option.label }}</span>
              <span v-if="selectedProjectForStatus?.estado === option.value" class="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-300">Actual</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal flotante de detalles de proyecto -->
      <transition name="modal">
        <div v-if="showProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full p-8 overflow-y-auto max-h-[90vh]">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-blue-600 dark:text-blue-300 flex items-center gap-2">
                <span class="material-icons">folder</span>
                {{ selectedProjectModal?.nombre }}
              </h2>
              <button @click="closeProjectModal" class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <span class="material-icons">close</span>
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <!-- Datos clave del proyecto -->
              <div class="bg-zinc-50 dark:bg-zinc-800 rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Resumen</h3>
                <ul class="space-y-2 text-sm">
                  <li><strong>Cliente:</strong> {{ selectedProjectModal?.cliente }}</li>
                  <li><strong>Estado:</strong> {{ selectedProjectModal?.estado }}</li>
                  <li><strong>Fecha de inicio:</strong> {{ formatDate(selectedProjectModal?.fechaInicio) }}</li>
                  <li><strong>Fecha de fin:</strong> {{ formatDate(selectedProjectModal?.fechaFin) }}</li>
                  <li><strong>Técnicos asignados:</strong>
                    <span v-if="selectedProjectModal?.tecnicosAsignados && selectedProjectModal.tecnicosAsignados.length">
                      <span v-for="uid in selectedProjectModal.tecnicosAsignados" :key="uid" class="user-pill">{{ getUserName(uid) }}</span>
                    </span>
                    <span v-else>Ninguno</span>
                  </li>
                </ul>
              </div>
              <!-- Tareas del proyecto -->
              <div class="bg-zinc-50 dark:bg-zinc-800 rounded-lg shadow p-6 md:col-span-1">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Tareas</h3>
                <div v-if="isLoadingTareasModal" class="py-8 text-center text-gray-500">
                  <div class="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  <p class="mt-2">Cargando tareas...</p>
                </div>
                <div v-else-if="projectTareasModal.length === 0" class="text-center py-6 text-gray-500">
                  <span class="material-icons mb-2">task_alt</span>
                  <p>No hay tareas asignadas</p>
                </div>
                <div v-else class="space-y-4">
                  <div v-for="tarea in projectTareasModal" :key="tarea.id" class="tarea-card group">
                    <div class="flex items-center mb-2">
                      <span class="material-icons text-blue-400 mr-3 text-2xl">task</span>
                      <h4 class="text-base font-bold text-zinc-900 dark:text-white flex-1 truncate group-hover:text-blue-600 transition-colors">
                        {{ tarea.nombre }}
                      </h4>
                    </div>
                    <div class="mb-2 text-zinc-600 dark:text-zinc-400 text-sm">
                      <p class="truncate">{{ tarea.descripcion || 'Sin descripción' }}</p>
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="badge-modern"
              :class="{
                          'badge-pendiente': tarea.estado === 'pendiente',
                          'badge-completada': tarea.estado === 'completada',
                          'badge-atrasada': tarea.estado === 'atrasada'
              }"
            >
                        {{ tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1) }}
                      </span>
          </div>
                    <div class="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span class="font-semibold">Técnicos asignados:</span>
                      <span v-if="tarea.tecnicosAsignados && tarea.tecnicosAsignados.length">
                        <span v-for="uid in tarea.tecnicosAsignados" :key="uid" class="inline-block mr-1">
                          <span class="user-pill">{{ getUserName(uid) }}</span>
                        </span>
                      </span>
                      <span v-else>Ninguno</span>
        </div>
      </div>
                </div>
              </div>
              <!-- Archivos/documentos del proyecto -->
              <div class="bg-zinc-50 dark:bg-zinc-800 rounded-lg shadow p-6 md:col-span-1">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Archivos</h3>
                <div v-if="isLoadingDocumentsModal" class="py-8 text-center text-gray-500">
                  <div class="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  <p class="mt-2">Cargando archivos...</p>
                </div>
                <div v-else-if="projectDocumentsModal.length === 0" class="text-center py-6 text-gray-500">
                  <span class="material-icons mb-2">folder_open</span>
                  <p>No hay archivos subidos</p>
                </div>
                <div v-else>
                  <ul class="divide-y divide-gray-200">
                    <li v-for="doc in projectDocumentsModal" :key="doc.id" class="py-3 flex items-center">
                      <div class="flex items-center">
                        <span class="material-icons text-gray-400 mr-2">{{ getDocumentIcon(doc.tipo) }}</span>
                        <div class="text-sm max-w-xs truncate">
                          <p class="font-medium text-gray-900 truncate">{{ doc.nombre }}</p>
                          <span class="badge-sm"
                            :class="{
                              'bg-yellow-100 text-yellow-800': doc.estado === 'pendiente',
                              'bg-green-100 text-green-800': doc.estado === 'validado',
                              'bg-red-100 text-red-800': doc.estado === 'rechazado'
                            }"
                          >
                            {{ doc.estado }}
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc, serverTimestamp, addDoc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import MainLayout from '~/components/layout/MainLayout.vue'
import { useProjects } from '~/composables/useProjects'
import { useActivities } from '~/composables/useActivities'
import ProjectForm from '@/components/ProjectForm.vue'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import DocumentCard from '@/components/documents/DocumentCard.vue'

// Aplicar middleware de autenticación
definePageMeta({
  middleware: ['auth']
})

// Composables
const { getProjects, createProject, error: projectError } = useProjects()
const { addActivity } = useActivities()
const { user } = useAuth()
const { showToast } = useToast()
const isSupervisor = computed(() => user.value?.role === 'supervisor')
const isAdmin = computed(() => user.value?.role === 'admin')
const canEditProjects = computed(() => isSupervisor.value || isAdmin.value)

// Estado
const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const filterStatus = ref('')
const showAddProjectModal = ref(false)
const showFoldersModal = ref(false)
const showFolderContentModal = ref(false)
const selectedProject = ref(null)
const selectedFolder = ref('')
const projects = ref([])
const showStatusModal = ref(false)
const selectedProjectForStatus = ref(null)
const showNewFolderModal = ref(false)
const newFolderName = ref('')
const isCreatingFolder = ref(false)
const projectFolders = ref([])
const showNewProjectModal = ref(false)
const showEditProjectModal = ref(false)
const folderUrls = ref([])
const showAddUrlModal = ref(false)
const isAddingUrl = ref(false)
const newUrl = ref({
  name: '',
  url: ''
})


// Datos para nuevo proyecto
const newProject = ref({
  nombre: '',
  cliente: '',
  descripcion: '',
  estado: 'activo',
  fechaCreacion: '',
  fechaInicio: '',
  fechaFin: '',
  tecnicosAsignados: []
})

// Datos para edición de proyecto
const editProjectData = ref({
  id: '',
  nombre: '',
  cliente: '',
  descripcion: '',
  estado: 'activo',
  fechaCreacion: '',
  fechaInicio: '',
  fechaFin: '',
  tecnicosAsignados: []
})

const defaultFolders = [
  'Formularios_SEC',
  'Planos',
  'Informes_Técnicos',
  'Evidencia_Fotográfica',
  'Certificados_Materiales',
  'Checklists',
  'Actas',
  'Otros'
]

onMounted(() => {
  isLoading.value = true
  onSnapshot(collection(db, 'projects'), (querySnapshot) => {
    projects.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    isLoading.value = false
  })
})

// Cargar proyectos
async function loadProjects() {
  isLoading.value = true
  try {
    console.log('Iniciando carga de proyectos...')
    const projectsRef = collection(db, 'projects')
    const querySnapshot = await getDocs(projectsRef)
    console.log('Proyectos obtenidos:', querySnapshot.docs.length)
    
    projects.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Datos del proyecto:', data)
      return {
        id: doc.id,
        ...data,
        fechaInicio: data.fechaInicio?.toDate?.() || data.fechaInicio,
        fechaFin: data.fechaFin?.toDate?.() || data.fechaVencimiento?.toDate?.() || data.fechaFin || data.fechaVencimiento
      }
    })
    console.log('Proyectos procesados:', projects.value)
  } catch (err) {
    console.error('Error al cargar proyectos:', err)
    error.value = 'Error al cargar los proyectos'
  } finally {
    isLoading.value = false
  }
}

// Cargar proyectos al montar el componente
onMounted(async () => {
  console.log('Usuario actual:', user.value)
  console.log('Es supervisor:', isSupervisor.value)
  console.log('Es admin:', isAdmin.value)
  console.log('Puede editar:', canEditProjects.value)
  await loadProjects()
})

// Funciones
function getStatusText(status) {
  switch (status) {
    case 'activo': return 'Activo'
    case 'completado': return 'Completado'
    case 'cancelado': return 'Cancelado'
    case 'suspendido': return 'Suspendido'
    default: return status
  }
}

function formatDate(date) {
  if (!date) return 'No especificada'
  
  try {
    // Si es un Timestamp de Firestore
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    // Si es string o Date
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return 'Fecha inválida'
    
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (e) {
    console.error('Error al formatear fecha:', e)
    return 'Fecha inválida'
  }
}

function formatDateInput(date) {
  if (!date) return '';
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  if (date.seconds) {
    return new Date(date.seconds * 1000).toISOString().slice(0, 10);
  }
  // Si es string
  return new Date(date).toISOString().slice(0, 10);
}

function openNewProjectModal() {
  showNewProjectModal.value = true
  error.value = null
  newProject.value = {
    nombre: '',
    cliente: '',
    descripcion: '',
    estado: 'activo',
    fechaCreacion: '',
    fechaInicio: '',
    fechaFin: '',
    tecnicosAsignados: []
  }
}

function parseLocalDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // 12:00 para evitar problemas de timezone
}

async function addProject() {
  isLoading.value = true;
  error.value = null;
  if (!newProject.value.nombre || !newProject.value.cliente || !newProject.value.descripcion || !newProject.value.fechaInicio || !newProject.value.fechaFin) {
    error.value = 'Completa todos los campos.';
    isLoading.value = false;
    return;
  }
  try {
    const projectData = {
      ...newProject.value,
      fechaCreacion: Timestamp.now(),
      fechaInicio: newProject.value.fechaInicio ? Timestamp.fromDate(parseLocalDate(newProject.value.fechaInicio)) : null,
      fechaFin: newProject.value.fechaFin ? Timestamp.fromDate(parseLocalDate(newProject.value.fechaFin)) : null,
      tecnicosAsignados: []
    };
    await addDoc(collection(db, 'projects'), projectData);
    showNewProjectModal.value = false;
    await loadProjects();
  } catch (err) {
    error.value = 'Error al crear proyecto: ' + (err?.message || err);
  } finally {
    isLoading.value = false;
  }
}

function editProject(project) {
  selectedProject.value = {
    ...project,
    fechaInicio: project.fechaInicio ? formatDateInput(project.fechaInicio) : '',
    fechaFin: project.fechaFin ? formatDateInput(project.fechaFin) : ''
  };
  showEditProjectModal.value = true;
  error.value = null;
}

function showProjectOptions(project) {
  // Implementar opciones de proyecto
  console.log('Opciones de proyecto:', project)
}

function viewProjectDetails(project) {
  selectedProject.value = project
  showFoldersModal.value = true
  loadProjectFolders()
}

async function handleProjectUpdate(projectData) {
  isLoading.value = true;
  try {
    const refDoc = doc(db, 'projects', selectedProject.value.id);
    await updateDoc(refDoc, {
      ...projectData,
      fechaInicio: projectData.fechaInicio ? Timestamp.fromDate(parseLocalDate(projectData.fechaInicio)) : null,
      fechaFin: projectData.fechaFin ? Timestamp.fromDate(parseLocalDate(projectData.fechaFin)) : null,
    });
    showEditProjectModal.value = false;
    await loadProjects();
  } catch (e) {
    error.value = 'Error al actualizar proyecto';
  } finally {
    isLoading.value = false;
  }
}

async function openFolder(folderName) {
  selectedFolder.value = folderName
  showFoldersModal.value = false
  showFolderContentModal.value = true
  
  try {
    // Obtenemos el documento de la carpeta
    const foldersRef = collection(db, `projects/${selectedProject.value.id}/folders`)
    const foldersSnapshot = await getDocs(foldersRef)
    const folderDoc = foldersSnapshot.docs.find(doc => doc.data().nombre === folderName)
    
    if (!folderDoc) {
      console.error('Carpeta no encontrada')
      folderUrls.value = []
      return
    }

    // Obtenemos los URLs del campo url de la carpeta (puede ser array de strings, array de objetos, o string)
    const folderData = folderDoc.data()
    if (Array.isArray(folderData.url)) {
      folderUrls.value = folderData.url
        .filter(item => {
          if (typeof item === 'string') return item.trim() !== ''
          if (typeof item === 'object' && item.url) return item.url.trim() !== ''
          return false
        })
        .map(item => {
          if (typeof item === 'string') {
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              nombre: item,
              url: item,
              estado: 'pendiente',
              tipo: 'documento',
              fechaSubida: new Date(),
              comentarios: '',
              projectId: selectedProject.value.id,
              folderId: folderDoc.id
            }
          } else {
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              nombre: item.nombre || item.nombreDocumento || item.url,
              url: item.url,
              estado: item.estado || 'pendiente',
              tipo: item.tipo || 'documento',
              fechaSubida: item.fechaSubida
                ? (item.fechaSubida.toDate ? item.fechaSubida.toDate() : new Date(item.fechaSubida))
                : new Date(),
              comentarios: item.comentarios || '',
              projectId: item.projectId || selectedProject.value.id,
              folderId: item.folderId || folderDoc.id
            }
          }
        })
    } else if (typeof folderData.url === 'string' && folderData.url.length > 0) {
      folderUrls.value = [{
        id: folderDoc.id,
        nombre: folderData.url,
        url: folderData.url,
        estado: 'pendiente',
        tipo: 'documento',
        fechaSubida: new Date(),
        comentarios: '',
        projectId: selectedProject.value.id,
        folderId: folderDoc.id
      }]
    } else {
      folderUrls.value = []
    }
  } catch (err) {
    console.error('Error al cargar URLs de la carpeta:', err)
    error.value = 'Error al cargar los URLs de la carpeta'
    folderUrls.value = []
  }
}

// Mostrar opciones de estado
function showStatusOptions(project) {
  selectedProjectForStatus.value = project
  showStatusModal.value = true
}

// Actualizar estado del proyecto
async function updateProjectStatus(project, newStatus) {
  console.log('Intentando actualizar estado:', { project, newStatus, canEdit: canEditProjects.value })
  
  if (!canEditProjects.value) {
    error.value = 'Solo los supervisores y administradores pueden cambiar el estado del proyecto'
    return
  }

  try {
    const projectRef = doc(db, 'projects', project.id)
    await updateDoc(projectRef, {
      estado: newStatus
    })
    
    // Actualizar el estado localmente
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], estado: newStatus }
    }
    
    // Registrar actividad
    await addActivity({
      projectId: project.id,
      projectName: project.nombre,
      oldStatus: project.estado,
      newStatus
    })
    
    showStatusModal.value = false
  } catch (err) {
    console.error('Error al actualizar estado:', err)
    error.value = 'Error al actualizar el estado del proyecto'
  }
}

// Cargar carpetas del proyecto
async function loadProjectFolders() {
  if (!selectedProject.value) return
  
  try {
    const foldersRef = collection(db, `projects/${selectedProject.value.id}/folders`)
    const querySnapshot = await getDocs(foldersRef)
    projectFolders.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Error al cargar carpetas:', err)
    error.value = 'Error al cargar las carpetas del proyecto'
  }
}

// Crear carpetas por defecto para un proyecto
async function createDefaultFolders(projectId) {
  try {
    const foldersRef = collection(db, `projects/${projectId}/folders`)
    
    // Crear todas las carpetas por defecto
    const createFolderPromises = defaultFolders.map(folderName => 
      addDoc(foldersRef, {
        nombre: folderName,
        fechaCreacion: serverTimestamp(),
        url: [] // Campo url como array vacío
      })
    )
    
    await Promise.all(createFolderPromises)
  } catch (err) {
    console.error('Error al crear carpetas por defecto:', err)
    throw new Error('Error al crear las carpetas por defecto')
  }
}

// Función para actualizar proyectos existentes
async function updateExistingProjects() {
  try {
    const projectsRef = collection(db, 'projects')
    const querySnapshot = await getDocs(projectsRef)
    
    const updatePromises = querySnapshot.docs.map(async (doc) => {
      const projectId = doc.id
      const foldersRef = collection(db, `projects/${projectId}/folders`)
      const foldersSnapshot = await getDocs(foldersRef)
      
      // Si el proyecto no tiene carpetas, crear las carpetas por defecto
      if (foldersSnapshot.empty) {
        await createDefaultFolders(projectId)
      }
    })
    
    await Promise.all(updatePromises)
    console.log('Proyectos existentes actualizados con carpetas por defecto')
  } catch (err) {
    console.error('Error al actualizar proyectos existentes:', err)
    error.value = 'Error al actualizar proyectos existentes'
  }
}

// Modificar onMounted para incluir la actualización de proyectos existentes
onMounted(async () => {
  await loadProjects()
  await updateExistingProjects()
})

// Modificar la función deleteProject para verificar permisos
async function deleteProject(project) {
  console.log('Intentando eliminar proyecto:', { project, canEdit: canEditProjects.value })
  
  if (!canEditProjects.value) {
    error.value = 'Solo los supervisores y administradores pueden eliminar proyectos'
    return
  }

  if (!confirm(`¿Estás seguro de que deseas eliminar el proyecto "${project.nombre}"?`)) return
  
  try {
    const projectRef = doc(db, 'projects', project.id)
    await deleteDoc(projectRef)
    
    // Actualizar la lista local
    projects.value = projects.value.filter(p => p.id !== project.id)
    
    // Registrar actividad
    await addActivity({
      projectId: project.id,
      projectName: project.nombre,
      action: 'delete'
    })
  } catch (err) {
    console.error('Error al eliminar proyecto:', err)
    error.value = 'Error al eliminar el proyecto'
  }
}

async function handleProjectSubmit(projectData) {
  try {
    // Guardar el proyecto en Firestore
    const projectsRef = collection(db, 'projects')
    await addDoc(projectsRef, {
      ...projectData,
      fechaCreacion: serverTimestamp(),
      estado: 'activo'
    })
    // Cierra el modal y recarga la lista
    showNewProjectModal.value = false
    await loadProjects()
  } catch (err) {
    console.error('Error al guardar el proyecto:', err)
    error.value = 'Error al guardar el proyecto'
  }
}

const filteredProjects = computed(() => {
  return (projects.value || []).filter(project => {
    const nombre = project.nombre || ''
    const cliente = project.cliente || ''
    const matchesStatus = !filterStatus.value || project.estado === filterStatus.value
    const matchesSearch =
      nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      cliente.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

function isProjectExpired(project) {
  if (!project.fechaFin && !project.fechaVencimiento) return false;
  const fin = project.fechaFin || project.fechaVencimiento;
  const finDate = fin?.toDate ? fin.toDate() : new Date(fin);
  const today = new Date();
  finDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  return finDate <= today;
}

const statusOptions = [
  {
    value: 'activo',
    label: 'Activo',
    icon: 'play_circle',
    iconClass: 'text-green-500',
    activeClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
    inactiveClass: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 hover:bg-green-50 dark:hover:bg-green-900/20',
  },
  {
    value: 'completado',
    label: 'Completado',
    icon: 'check_circle',
    iconClass: 'text-blue-500',
    activeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    inactiveClass: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  },
  {
    value: 'cancelado',
    label: 'Cancelado',
    icon: 'cancel',
    iconClass: 'text-red-500',
    activeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
    inactiveClass: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-900/20',
  },
]

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
  showToast('URL copiada al portapapeles', 'success')
}

function openUrl(url) {
  window.open(url, '_blank')
}

async function addUrlToFolder() {
  if (!selectedProject.value || !selectedFolder.value) return
  
  isAddingUrl.value = true
  try {
    // Primero obtenemos el ID de la carpeta
    const foldersRef = collection(db, `projects/${selectedProject.value.id}/folders`)
    const foldersSnapshot = await getDocs(foldersRef)
    const folderDoc = foldersSnapshot.docs.find(doc => doc.data().nombre === selectedFolder.value)
    
    if (!folderDoc) {
      throw new Error('Carpeta no encontrada')
    }

    // Actualizamos el documento de la carpeta con el nuevo objeto url+nombreDocumento en el array
    const folderRef = doc(db, `projects/${selectedProject.value.id}/folders`, folderDoc.id)
    const folderData = folderDoc.data()
    const currentUrls = folderData.url || []
    
    await updateDoc(folderRef, {
      url: [
        ...currentUrls,
        {
          url: newUrl.value.url,
          nombreDocumento: newUrl.value.name // Aquí se guarda el nombre original
        }
      ]
    })
    
    // Recargamos los URLs
    await openFolder(selectedFolder.value)
    
    // Limpiamos el formulario y cerramos el modal
    newUrl.value = { name: '', url: '' }
    showAddUrlModal.value = false
    
    showToast('URL agregado correctamente', 'success')
  } catch (err) {
    console.error('Error al agregar URL:', err)
    error.value = 'Error al agregar el URL'
    showToast('Error al agregar el URL', 'error')
  } finally {
    isAddingUrl.value = false
  }
}

async function createNewFolder() {
  if (!selectedProject.value || !newFolderName.value) return
  
  isCreatingFolder.value = true
  try {
    const foldersRef = collection(db, `projects/${selectedProject.value.id}/folders`)
    await addDoc(foldersRef, {
      nombre: newFolderName.value,
      fechaCreacion: serverTimestamp(),
      url: [] // Campo url como array vacío
    })
    
    await loadProjectFolders()
    showNewFolderModal.value = false
    newFolderName.value = ''
  } catch (err) {
    console.error('Error al crear carpeta:', err)
    error.value = 'Error al crear la carpeta'
  } finally {
    isCreatingFolder.value = false
  }
}

function viewDocument(doc) {
  if (doc.url && typeof doc.url === 'string' && doc.url.startsWith('http')) {
    window.open(doc.url, '_blank');
  } else {
    showToast('El documento no tiene un enlace válido para visualizar.', 'error');
  }
}

function downloadDocument(doc) {
  const link = document.createElement('a')
  link.href = doc.url
  link.download = doc.nombre
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function validateDocument(doc) {
  try {
    await validateDoc(doc.id)
    showToast('Documento validado correctamente', 'success')
  } catch (error) {
    console.error('Error al validar documento:', error)
    showToast('Error al validar el documento', 'error')
  }
}

async function rejectDocument(doc) {
  try {
    await rejectDoc(doc.id)
    showToast('Documento rechazado correctamente', 'success')
  } catch (error) {
    console.error('Error al rechazar documento:', error)
    showToast('Error al rechazar el documento', 'error')
  }
}
</script> 

<style scoped>
.expired-project {
  border: 3px solid #ef4444 !important;
  animation: blink-red 1s infinite;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3);
}
@keyframes blink-red {
  0%, 100% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 10px 8px rgba(239, 68, 68, 0.7); }
}
</style> 