<template>
  <MainLayout>
    <div class="max-w-6xl mx-auto py-10 px-4">
      <!-- Header y filtros -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 animate-fade-in-down">
        <div>
          <h1 class="text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight mb-1 flex items-center gap-2">
            <span class="material-icons text-4xl animate-pop">task_alt</span>
            Tareas
          </h1>
          <p class="text-zinc-500 dark:text-zinc-300 text-base">Gestiona y visualiza todas tus tareas de manera eficiente.</p>
        </div>
        <div class="flex flex-col md:flex-row gap-3 items-center">
          <input v-model="search" type="text" placeholder="Buscar tareas..." class="input-modern w-full md:w-72" />
          <select v-model="filterEstado" class="input-modern w-full md:w-56">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="atrasada">Atrasada</option>
        </select>
          <button
            v-if="currentUser && currentUser.role === 'admin'"
            class="btn-modern flex items-center h-12 animate-bounce-in"
            @click="openCreateModal"
          >
            <span class="material-icons text-base mr-1">add_task</span>
            Nueva Tarea
          </button>
      </div>
      </div>
      <!-- Loader -->
      <div v-if="isLoading" class="py-20 text-center text-gray-500">
        <div class="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p class="mt-3">Cargando tareas...</p>
      </div>
      <!-- Sin tareas -->
      <div v-else-if="filteredTareas.length === 0" class="text-center py-20 text-zinc-400">
        <span class="material-icons mb-2 text-6xl animate-pop">task_alt</span>
        <p class="text-lg font-semibold">No hay tareas registradas</p>
      </div>
      <!-- Tarjetas de tareas -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="tarea in filteredTareas" :key="tarea.id" class="tarea-card group relative">
          <div class="flex items-center mb-2">
            <span class="material-icons text-blue-400 mr-3 text-3xl animate-pop">task</span>
            <h2 class="text-lg font-bold text-zinc-900 dark:text-white flex-1 truncate group-hover:text-blue-600 transition-colors">{{ tarea.nombre }}</h2>
            <button
              v-if="currentUser && (currentUser.role === 'admin' || (currentUser.role === 'tecnico' && tarea.tecnicosAsignados && tarea.tecnicosAsignados.includes(currentUser.uid)))"
              class="ml-2 btn-icon"
              @click="openEditModal(tarea)"
            >
              <span class="material-icons">edit</span>
            </button>
            <button
              v-if="currentUser && currentUser.role === 'admin'"
              class="ml-2 btn-icon"
              @click="deleteTarea(tarea)"
            >
              <span class="material-icons">delete</span>
            </button>
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
            <span class="font-semibold">Proyecto:</span>
            {{ getProjectName(tarea.proyectoId) }}
          </div>
          <div class="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span class="font-semibold">Técnicos asignados:</span>
            <span v-if="tarea.tecnicosAsignados && tarea.tecnicosAsignados.length">
              <span v-for="uid in tarea.tecnicosAsignados" :key="uid" class="inline-block mr-1 animate-fade-in">
                <span class="user-pill">{{ getUserName(uid) }}</span>
              </span>
            </span>
            <span v-else>Ninguno</span>
          </div>
        </div>
      </div>
      <!-- Modal Crear/Editar Tarea -->
      <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-modal-in">
            <h2 class="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-300 flex items-center gap-2">
              <span class="material-icons">{{ isEdit ? 'edit' : 'add_task' }}</span>
              {{ isEdit ? 'Editar Tarea' : 'Nueva Tarea' }}
            </h2>
          <form @submit.prevent="isEdit ? saveEditTarea() : saveNewTarea()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombre</label>
                  <input v-model="form.nombre" type="text" required class="input-modern w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Descripción</label>
                  <textarea v-model="form.descripcion" class="input-modern w-full" rows="2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
                  <select v-model="form.estado" class="input-modern w-full">
                  <option value="pendiente">Pendiente</option>
                  <option value="completada">Completada</option>
                  <option value="atrasada">Atrasada</option>
                </select>
              </div>
                <div v-if="currentUser && currentUser.role === 'admin'">
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Proyecto</label>
                  <select v-model="form.proyectoId" class="input-modern w-full">
                  <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
                </div>
                <div v-if="currentUser && currentUser.role === 'admin'">
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Técnicos asignados</label>
                  <select v-model="form.tecnicosAsignados" class="input-modern w-full" multiple>
                    <option v-for="u in users.filter(u => u.role === 'tecnico')" :key="u.uid" :value="u.uid">
                      {{ u.nombre }}
                    </option>
                </select>
              </div>
            </div>
              <div class="mt-8 flex justify-end space-x-3">
                <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
                <button type="submit" class="btn-save">
                  <span class="material-icons align-middle mr-1">save</span>Guardar
                </button>
            </div>
          </form>
        </div>
      </div>
      </transition>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from '~/utils/firebase'
import MainLayout from '~/components/layout/MainLayout.vue'
import { useAuth } from '~/composables/useAuth'

const { user: currentUser } = useAuth()

const isLoading = ref(true)
const tareas = ref([])
const users = ref([])
const projects = ref([])
const search = ref('')
const filterEstado = ref('')

const showModal = ref(false)
const isEdit = ref(false)
const form = ref({ nombre: '', descripcion: '', estado: 'pendiente', proyectoId: '', tecnicosAsignados: [] })
let editId = null

onMounted(() => {
  onSnapshot(collection(db, 'tareas'), (querySnapshot) => {
    tareas.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    isLoading.value = false
  })
  onSnapshot(collection(db, 'users'), (querySnapshot) => {
    users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
  onSnapshot(collection(db, 'projects'), (querySnapshot) => {
    projects.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const filteredTareas = computed(() => {
  let filtered = tareas.value
  if (currentUser && currentUser.role === 'tecnico') {
    filtered = filtered.filter(t => Array.isArray(t.tecnicosAsignados) && t.tecnicosAsignados.includes(currentUser.id))
  }
  if (filterEstado.value) {
    filtered = filtered.filter(t => t.estado === filterEstado.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    filtered = filtered.filter(t =>
      (t.nombre || '').toLowerCase().includes(q) ||
      (t.descripcion || '').toLowerCase().includes(q)
    )
  }
  return filtered
})

function getUserName(uid) {
  const user = users.value.find(u => u.uid === uid)
  return user ? user.nombre : uid
}
function getProjectName(id) {
  const project = projects.value.find(p => p.id === id)
  return project ? project.nombre : id
}

function openCreateModal() {
  isEdit.value = false
  showModal.value = true
  form.value = { nombre: '', descripcion: '', estado: 'pendiente', proyectoId: projects.value[0]?.id || '', tecnicosAsignados: [] }
}

function openEditModal(tarea) {
  isEdit.value = true
  showModal.value = true
  form.value = { ...tarea }
  editId = tarea.id
}

function closeModal() {
  showModal.value = false
  isEdit.value = false
  editId = null
}

async function saveNewTarea() {
  if (!form.value.nombre || !form.value.proyectoId) return
  await addDoc(collection(db, 'tareas'), {
    nombre: form.value.nombre,
    descripcion: form.value.descripcion,
    estado: form.value.estado,
    proyectoId: form.value.proyectoId,
    tecnicosAsignados: form.value.tecnicosAsignados
  })
  closeModal()
}

async function saveEditTarea() {
  if (!editId || !currentUser) return
  const refDoc = doc(db, 'tareas', editId)
  if (
    currentUser.role === 'admin' ||
    (currentUser.role === 'tecnico' && form.value.tecnicosAsignados.includes(currentUser.uid))
  ) {
    await updateDoc(refDoc, {
      nombre: form.value.nombre,
      descripcion: form.value.descripcion,
      estado: form.value.estado,
      proyectoId: form.value.proyectoId,
      tecnicosAsignados: form.value.tecnicosAsignados
    })
  }
  closeModal()
}

async function deleteTarea(tarea) {
  if (confirm('¿Eliminar tarea?')) {
    await deleteDoc(doc(db, 'tareas', tarea.id))
  }
}
</script>

<style scoped>
.input-modern {
  @apply border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm;
}
.btn-modern {
  @apply px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200;
}
.tarea-card {
  @apply bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-xl p-7 flex flex-col relative overflow-hidden cursor-pointer transition-all duration-300;
  transition-property: box-shadow, transform, border-color;
}
.tarea-card:hover {
  @apply shadow-2xl border-blue-400 dark:border-blue-500 scale-[1.025];
}
.btn-icon {
  @apply p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 transition-all duration-150 shadow-sm;
}
.badge-modern {
  @apply px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all duration-200;
}
.badge-pendiente {
  @apply bg-yellow-100 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-100;
}
.badge-completada {
  @apply bg-green-100 dark:bg-green-600 text-green-800 dark:text-green-100;
}
.badge-atrasada {
  @apply bg-red-100 dark:bg-red-600 text-red-800 dark:text-red-100;
}
.user-pill {
  @apply bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm;
  animation: fade-in 0.5s;
}
.btn-cancel {
  @apply px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition;
}
.btn-save {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition flex items-center gap-1 font-bold shadow-md;
}
/* Animaciones */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.5s;
}
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fade-in-down 0.7s cubic-bezier(0.4,0,0.2,1);
}
@keyframes pop {
  0% { transform: scale(0.7); opacity: 0; }
  80% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}
.animate-pop {
  animation: pop 0.5s;
}
@keyframes bounce-in {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
.animate-bounce-in {
  animation: bounce-in 0.6s;
}
/* Modal animación */
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-modal-in {
  animation: modal-in 0.3s;
}
/* Transiciones Vue */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.list-enter-active, .list-leave-active {
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
