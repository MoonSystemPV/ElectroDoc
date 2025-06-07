<template>
  <MainLayout>
    <div class="max-w-6xl mx-auto py-10 px-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div class="flex flex-1 gap-2">
          <input v-model="search" type="text" placeholder="Buscar tareas..." class="input w-full md:w-72" />
          <select v-model="filterEstado" class="input w-full md:w-56">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="completada">Completada</option>
            <option value="atrasada">Atrasada</option>
          </select>
        </div>
        <button class="btn btn-primary flex items-center h-12" @click="addTask">
          <span class="material-icons text-base mr-1">add_task</span>
          Nueva Tarea
        </button>
      </div>

      <div v-if="isLoadingTasks" class="py-20 text-center text-gray-500">
        <div class="animate-spin mx-auto h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p class="mt-3">Cargando tareas...</p>
      </div>

      <div v-else-if="filteredTasks.length === 0" class="text-center py-20 text-gray-500">
        <span class="material-icons mb-2 text-5xl">task_alt</span>
        <p class="text-lg">No hay tareas registradas</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(task, idx) in filteredTasks" :key="task.id" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-7 flex flex-col group hover:shadow-2xl transition relative">
          <div class="flex items-center mb-2">
            <span class="material-icons text-blue-400 mr-3 text-3xl">task</span>
            <template v-if="editIndex === idx">
              <input v-model="editForm.nombre" class="input input-xs font-semibold flex-1 mr-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white" />
            </template>
            <template v-else>
              <h2 class="text-lg font-bold text-zinc-900 dark:text-white flex-1 truncate">{{ task.nombre }}</h2>
            </template>
          </div>
          <div class="mb-2 text-zinc-600 dark:text-zinc-400 text-sm">
            <template v-if="editIndex === idx">
              <textarea v-model="editForm.descripcion" class="input input-xs w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white" rows="2" />
            </template>
            <template v-else>
              <p class="truncate">{{ task.descripcion || 'Sin descripción' }}</p>
            </template>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <template v-if="editIndex === idx">
              <select v-model="editForm.estado" class="input input-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white">
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
                <option value="atrasada">Atrasada</option>
              </select>
              <input v-model="editForm.responsable" class="input input-xs ml-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white" placeholder="Responsable" />
            </template>
            <template v-else>
              <span class="badge-sm"
                :class="{
                  'bg-yellow-100 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-100': task.estado === 'pendiente',
                  'bg-green-100 dark:bg-green-600 text-green-800 dark:text-green-100': task.estado === 'completada',
                  'bg-red-100 dark:bg-red-600 text-red-800 dark:text-red-100': task.estado === 'atrasada'
                }"
              >
                {{ task.estado.charAt(0).toUpperCase() + task.estado.slice(1) }}
              </span>
              <span v-if="task.responsable" class="ml-2 text-xs text-zinc-500 dark:text-zinc-300">{{ task.responsable }}</span>
            </template>
          </div>
          <div class="flex items-center justify-between mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <div class="flex gap-2">
              <button v-if="editIndex !== idx" class="btn btn-xs btn-outline" @click="startEdit(idx)">
                <span class="material-icons text-base">edit</span>
              </button>
              <button v-if="editIndex === idx" class="btn btn-xs btn-primary" @click="saveEdit(idx)">
                <span class="material-icons text-base">check</span>
              </button>
              <button v-if="editIndex === idx" class="btn btn-xs btn-outline" @click="cancelEdit">
                <span class="material-icons text-base">close</span>
              </button>
              <button class="btn btn-xs btn-outline" @click="deleteTask(idx)">
                <span class="material-icons text-base">delete</span>
              </button>
            </div>
            <span class="text-xs text-zinc-500">ID: {{ task.id }}</span>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import MainLayout from '~/components/layout/MainLayout.vue'

const isLoadingTasks = ref(false)
const tasks = ref([
  { id: 1, nombre: 'Tarea 1', descripcion: 'Revisión de planos', estado: 'pendiente', responsable: 'Juan Pérez' },
  { id: 2, nombre: 'Tarea 2', descripcion: 'Instalación de cableado', estado: 'completada', responsable: 'Ana Gómez' },
  { id: 3, nombre: 'Tarea 3', descripcion: 'Inspección final', estado: 'atrasada', responsable: 'Carlos Ruiz' },
])

const search = ref('')
const filterEstado = ref('')

const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesSearch = task.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      (task.descripcion && task.descripcion.toLowerCase().includes(search.value.toLowerCase()))
    const matchesEstado = !filterEstado.value || task.estado === filterEstado.value
    return matchesSearch && matchesEstado
  })
})

const editIndex = ref(null)
const editForm = ref({ nombre: '', descripcion: '', estado: 'pendiente', responsable: '' })

function startEdit(idx) {
  editIndex.value = idx
  editForm.value = { ...filteredTasks.value[idx] }
}

function saveEdit(idx) {
  // Buscar el índice real en tasks (por si hay filtro/búsqueda)
  const realIdx = tasks.value.findIndex(t => t.id === filteredTasks.value[idx].id)
  tasks.value[realIdx] = { ...tasks.value[realIdx], ...editForm.value }
  cancelEdit()
}

function cancelEdit() {
  editIndex.value = null
  editForm.value = { nombre: '', descripcion: '', estado: 'pendiente', responsable: '' }
}

function addTask() {
  const newTask = {
    id: Date.now(),
    nombre: 'Nueva tarea',
    descripcion: '',
    estado: 'pendiente',
    responsable: ''
  }
  tasks.value.unshift(newTask)
  // Si hay filtro/búsqueda, puede que no se vea, así que lo mostramos igual
  search.value = ''
  filterEstado.value = ''
  startEdit(0)
}

function deleteTask(idx) {
  // Buscar el índice real en tasks (por si hay filtro/búsqueda)
  const realIdx = tasks.value.findIndex(t => t.id === filteredTasks.value[idx].id)
  tasks.value.splice(realIdx, 1)
  cancelEdit()
}
</script>

<style scoped>
.input {
  @apply border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition;
}
.input-xs {
  @apply text-sm px-2 py-1;
}
.btn {
  @apply px-4 py-2 rounded font-semibold transition-colors;
}
.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}
.btn-outline {
  @apply border border-blue-600 text-blue-600 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/20;
}
.btn-xs {
  @apply px-2 py-1 text-xs;
}
.badge-sm {
  @apply px-2 py-1 rounded text-xs font-semibold;
}
</style>