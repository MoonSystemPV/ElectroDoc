<template>
  <MainLayout>
    <div class="p-2 md:p-0">
      <h1 class="text-3xl font-extrabold mb-8 text-blue-500 dark:text-white tracking-tight">Proyectos</h1>
      <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 transition-colors">
        <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <input v-model="searchQuery" type="text" placeholder="Buscar proyectos..." class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-72" />
          <select v-model="filterStatus" class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition w-full md:w-60">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="completado">Completado</option>
            <option value="suspendido">Suspendido</option>
          </select>
          <button @click="openNewProjectModal" class="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-xl shadow transition">
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
          <div v-for="project in filteredProjects" :key="project.id" class="bg-zinc-50 dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{{ project.nombre }}</h3>
                  <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{{ project.cliente }}</p>
                  <p class="text-xs text-zinc-400 dark:text-zinc-500 mb-2">{{ project.descripcion }}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-green-100 dark:bg-green-500 text-green-700 dark:text-white': project.estado === 'activo',
                    'bg-blue-100 dark:bg-blue-500 text-blue-700 dark:text-white': project.estado === 'completado',
                    'bg-yellow-100 dark:bg-yellow-500 text-yellow-700 dark:text-white': project.estado === 'suspendido'
                  }">
                  {{ getStatusText(project.estado) }}
                </span>
              </div>
              <div class="space-y-2 mb-4">
                <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                  <span class="material-icons text-blue-500 mr-2">calendar_today</span>
                  <span>Inicio: {{ formatDate(project.fechaInicio) }}</span>
                </div>
                <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                  <span class="material-icons text-blue-500 mr-2">event</span>
                  <span>Fin estimado: {{ formatDate(project.fechaFin) }}</span>
                </div>
                <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
                  <span class="material-icons text-blue-500 mr-2">today</span>
                  <span>Creado: {{ formatDate(project.fechaCreacion) }}</span>
                </div>
                <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-300" v-if="project.tecnicosAsignados && project.tecnicosAsignados.length">
                  <span class="material-icons text-blue-500 mr-2">groups</span>
                  <span>Técnicos asignados: {{ project.tecnicosAsignados.length }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <div class="flex items-center gap-2">
                  <button @click="editProject(project)" class="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800">
                    <span class="material-icons text-zinc-500 dark:text-zinc-400 text-sm">edit</span>
                  </button>
                  <button @click="deleteProject(project)" class="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900">
                    <span class="material-icons text-red-500 text-sm">delete</span>
                  </button>
                </div>
                <button @click="viewProjectDetails(project)" class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium">
                  Ver detalles
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
      <div v-if="showAddProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Nuevo Proyecto</h2>
          <form @submit.prevent="addProject">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombre del Proyecto</label>
                <input v-model="newProject.nombre" type="text" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="Nombre del proyecto" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cliente</label>
                <input v-model="newProject.cliente" type="text" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="Nombre del cliente" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Descripción</label>
                <textarea v-model="newProject.descripcion" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="Descripción del proyecto" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fecha de Inicio</label>
                <input v-model="newProject.fechaInicio" type="date" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fecha de Fin</label>
                <input v-model="newProject.fechaFin" type="date" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
                <select v-model="newProject.estado" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition">
                  <option value="activo">Activo</option>
                  <option value="completado">Completado</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
              <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">{{ error }}</div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" @click="() => { showAddProjectModal.value = false; error.value = null }" class="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">Cancelar</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition" :disabled="isLoading">
                <span v-if="isLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
                Crear Proyecto
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Editar Proyecto -->
      <div v-if="editProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Editar Proyecto</h2>
          <form @submit.prevent="saveEditProject">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombre del Proyecto</label>
                <input v-model="editProjectData.nombre" type="text" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="Nombre del proyecto" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cliente</label>
                <input v-model="editProjectData.cliente" type="text" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="Nombre del cliente" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Descripción</label>
                <textarea v-model="editProjectData.descripcion" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="Descripción del proyecto" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
                <select v-model="editProjectData.estado" class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition">
                  <option value="activo">Activo</option>
                  <option value="completado">Completado</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fecha de Inicio</label>
                <input v-model="editProjectData.fechaInicio" type="date" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fecha de Fin</label>
                <input v-model="editProjectData.fechaFin" type="date" required class="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition" />
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" @click="editProjectModal = false" class="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">Cancelar</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '~/utils/firebase'
import MainLayout from '~/components/layout/MainLayout.vue'

// Aplicar middleware de autenticación
definePageMeta({
  middleware: ['auth']
})

const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const filterStatus = ref('')
const showAddProjectModal = ref(false)
const projects = ref([])
const editProjectModal = ref(false)
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

onMounted(() => {
  isLoading.value = true
  onSnapshot(collection(db, 'projects'), (querySnapshot) => {
    projects.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    isLoading.value = false
  })
})

const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    const nombre = project.nombre || ''
    const cliente = project.cliente || ''
    const matchesStatus = !filterStatus.value || project.estado === filterStatus.value
    const matchesSearch =
      nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      cliente.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

function formatDate(date) {
  if (!date) return 'Sin fecha'
  try {
    // Si es un Timestamp de Firestore
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    // Si es string o Date
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (e) {
    return 'Fecha inválida'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'activo': return 'Activo'
    case 'completado': return 'Completado'
    case 'suspendido': return 'Suspendido'
    default: return status
  }
}

function openNewProjectModal() {
  showAddProjectModal.value = true
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

async function addProject() {
  isLoading.value = true
  error.value = null
  if (!newProject.value.nombre || !newProject.value.cliente || !newProject.value.descripcion || !newProject.value.fechaInicio || !newProject.value.fechaFin) {
    error.value = 'Completa todos los campos.'
    isLoading.value = false
    return
  }
  try {
    const projectData = {
      nombre: newProject.value.nombre.trim(),
      cliente: newProject.value.cliente.trim(),
      descripcion: newProject.value.descripcion.trim(),
      estado: newProject.value.estado,
      fechaCreacion: Timestamp.now(),
      fechaInicio: Timestamp.fromDate(new Date(newProject.value.fechaInicio)),
      fechaFin: Timestamp.fromDate(new Date(newProject.value.fechaFin)),
      tecnicosAsignados: []
    }
    await addDoc(collection(db, 'projects'), projectData)
    showAddProjectModal.value = false
    newProject.value = {
      nombre: '', cliente: '', descripcion: '', estado: 'activo', fechaCreacion: '', fechaInicio: '', fechaFin: '', tecnicosAsignados: []
    }
    error.value = null
  } catch (err) {
    error.value = 'Error al crear proyecto: ' + (err?.message || err)
  } finally {
    isLoading.value = false
  }
}

function editProject(project) {
  editProjectData.value = { ...project }
  editProjectModal.value = true
  error.value = null
}

function showProjectOptions(project) {
  // Implementar opciones de proyecto
  console.log('Opciones de proyecto:', project)
}

function viewProjectDetails(project) {
  // Implementar vista de detalles
  console.log('Ver detalles de proyecto:', project)
}

async function saveEditProject() {
  isLoading.value = true
  try {
    const refDoc = doc(db, 'projects', editProjectData.value.id)
    await updateDoc(refDoc, {
      nombre: editProjectData.value.nombre || '',
      cliente: editProjectData.value.cliente || '',
      descripcion: editProjectData.value.descripcion || '',
      estado: editProjectData.value.estado || 'activo',
      fechaInicio: editProjectData.value.fechaInicio ? Timestamp.fromDate(new Date(editProjectData.value.fechaInicio)) : null,
      fechaFin: editProjectData.value.fechaFin ? Timestamp.fromDate(new Date(editProjectData.value.fechaFin)) : null,
      tecnicosAsignados: editProjectData.value.tecnicosAsignados || []
    })
    editProjectModal.value = false
  } catch (e) {
    error.value = 'Error al editar proyecto'
  } finally {
    isLoading.value = false
  }
}

async function deleteProject(project) {
  if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
    isLoading.value = true
    try {
      await deleteDoc(doc(db, 'projects', project.id))
    } catch (e) {
      error.value = 'Error al eliminar proyecto'
    } finally {
      isLoading.value = false
    }
  }
}
</script> 