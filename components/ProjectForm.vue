<template>
  <div>
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Proyecto predeterminado</label>
      <select v-model="selectedTemplate" class="input w-full">
        <option value="">Personalizado</option>
        <option v-for="template in defaultProjectTemplates" :key="template.id" :value="template.id">
          {{ template.nombre }}
        </option>
      </select>
    </div>
    <form @submit.prevent="handleSubmit" class="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
      <div v-if="error" class="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div v-if="!canEdit" class="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded mb-4">
        Solo los supervisores y administradores pueden crear o editar proyectos
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Nombre del Proyecto
          </label>
          <input
            id="name"
            v-model="form.nombre"
            type="text"
            required
            :disabled="isEditing"
            class="input"
            :class="{ 'opacity-50 cursor-not-allowed': isEditing }"
            placeholder="Ej: Instalación Eléctrica Comercial"
          />
        </div>
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Fecha de Inicio
          </label>
          <input
            id="startDate"
            v-model="form.fechaInicio"
            type="date"
            required
            :disabled="isEditing"
            class="input"
            :class="{ 'opacity-50 cursor-not-allowed': isEditing }"
          />
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Fecha de Fin
          </label>
          <input
            id="endDate"
            v-model="form.fechaFin"
            type="date"
            :disabled="!canEdit"
            class="input"
            :class="{ 'opacity-50 cursor-not-allowed': !canEdit }"
          />
        </div>
        <div>
          <label for="client" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Cliente
          </label>
          <input
            id="client"
            v-model="form.cliente"
            type="text"
            :disabled="!canEdit"
            class="input"
            :class="{ 'opacity-50 cursor-not-allowed': !canEdit }"
            placeholder="Ej: Empresa XYZ"
          />
        </div>
        <div class="md:col-span-2">
          <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Descripción</label>
          <textarea id="descripcion" v-model="form.descripcion" rows="3" class="input" placeholder="Breve descripción del proyecto..."></textarea>
        </div>
        <div>
          <label for="supervisor" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Encargado / Supervisor
          </label>
          <div class="relative">
            <input
              id="supervisor"
              v-model="form.supervisor"
              type="text"
              :disabled="!canEdit"
              class="input"
              :class="{ 'opacity-50 cursor-not-allowed': !canEdit }"
              placeholder="Seleccionar supervisor"
              @click="canEdit && (showSupervisorModal = true)"
            />
            <button
              v-if="canEdit"
              type="button"
              @click="showSupervisorModal = true"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <span class="material-icons">search</span>
            </button>
          </div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Carpetas del Proyecto</label>
          <div
            class="space-y-1"
            :style="Object.keys(selectedFolders).length > 9 ? 'max-height: 18rem; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem;' : ''"
          >
            <div v-for="(checked, folder) in selectedFolders" :key="folder" class="flex items-center">
              <input type="checkbox" :id="'folder-' + folder" v-model="selectedFolders[folder]" class="mr-2" />
              <label :for="'folder-' + folder" class="text-gray-700 dark:text-gray-200 flex-1">{{ folder }}</label>
              <button type="button" @click="removeFolder(folder)" class="ml-2 text-red-500 hover:text-red-700" title="Eliminar carpeta">
                <span class="material-icons" style="font-size:18px;">close</span>
              </button>
            </div>
            <div class="flex items-center mt-2">
              <input
                v-model="newFolderName"
                type="text"
                placeholder="Agregar otra carpeta..."
                class="input w-auto flex-1 mr-2"
                @keyup.enter="addNewFolder"
              />
              <button type="button" @click="addNewFolder" class="btn-primary">Agregar</button>
            </div>
            <div v-if="folderError" class="text-red-500 text-xs mt-1">{{ folderError }}</div>
          </div>
        </div>
      </div>
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                 text-gray-700 dark:text-gray-200 
                 hover:bg-gray-50 dark:hover:bg-zinc-800 
                 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400
                 transition-colors"
        >
          Cancelar
        </button>
        <button
          v-if="canEdit"
          type="submit"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors
                 dark:bg-blue-500 dark:hover:bg-blue-400"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEditing ? 'Actualizando...' : 'Creando...' }}
          </span>
          <span v-else>{{ isEditing ? 'Actualizar' : 'Crear' }} Proyecto</span>
        </button>
      </div>
    </form>

    <!-- Modal de Selección de Supervisor -->
    <div v-if="showSupervisorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Seleccionar Supervisor</h3>
          <button @click="showSupervisorModal = false" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div v-if="isLoadingSupervisors" class="text-center py-4">
            <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Cargando supervisores...</p>
          </div>
          
          <div v-else-if="supervisors.length === 0" class="text-center py-4">
            <p class="text-gray-500 dark:text-gray-400">No se encontraron supervisores</p>
          </div>
          
          <button
            v-for="supervisor in supervisors"
            :key="supervisor.id"
            @click="selectSupervisor(supervisor)"
            class="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <div class="flex items-center">
              <span class="material-icons text-blue-500 mr-2">person</span>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ supervisor.nombre }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ supervisor.email }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'

interface Supervisor {
  id: string
  nombre: string
  email: string
  role: string
}

const props = defineProps({
  project: {
    type: Object,
    default: null
  },
  isSupervisor: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  nombre: '',
  cliente: '',
  descripcion: '',
  estado: 'activo',
  fechaInicio: '',
  fechaFin: '',
  supervisor: '',
  supervisorId: ''
})

const error = ref<string>('')
const isSubmitting = ref(false)
const router = useRouter()
const showSupervisorModal = ref(false)
const supervisors = ref<Supervisor[]>([])
const isLoadingSupervisors = ref(false)

const isEditing = computed(() => !!props.project)
const canEdit = computed(() => props.isSupervisor || props.isAdmin)
const canEditRestricted = computed(() => isEditing.value && canEdit.value)

// Exponer para el template
const _canEditRestricted = canEditRestricted

// Carpetas predeterminadas
const defaultFolders = [
  'Formularios_SEC',
  'Planos',
  'Informes_Técnicos',
  'Evidencia_Fotográfica',
  'Certificados_Materiales',
  'Checklists',
  'Actas',
  'Otros',
]
// Estado reactivo para las carpetas seleccionadas
const selectedFolders = ref<Record<string, boolean>>({})
defaultFolders.forEach(folder => {
  selectedFolders.value[folder] = true
})
// Estado para nueva carpeta personalizada
const newFolderName = ref('')
const folderError = ref('')
function addNewFolder() {
  const name = newFolderName.value.trim()
  if (!name) {
    folderError.value = 'El nombre no puede estar vacío.'
    return
  }
  if (selectedFolders.value[name]) {
    folderError.value = 'Esta carpeta ya está en la lista.'
    return
  }
  selectedFolders.value[name] = true
  newFolderName.value = ''
  folderError.value = ''
}

// Permitir eliminar una carpeta de la lista
function removeFolder(folder: string) {
  delete selectedFolders.value[folder]
}

// Cargar supervisores
async function loadSupervisors() {
  isLoadingSupervisors.value = true
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', 'supervisor'))
    const querySnapshot = await getDocs(q)
    
    supervisors.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Supervisor[]
  } catch (err) {
    console.error('Error al cargar supervisores:', err)
    error.value = 'Error al cargar la lista de supervisores'
  } finally {
    isLoadingSupervisors.value = false
  }
}

// Seleccionar supervisor
function selectSupervisor(supervisor: Supervisor) {
  form.value.supervisor = supervisor.nombre
  form.value.supervisorId = supervisor.id
  showSupervisorModal.value = false
}

// Cargar supervisores cuando se abre el modal
watch(showSupervisorModal, (newValue) => {
  if (newValue) {
    loadSupervisors()
  }
})

watch(() => props.project, (val) => {
  if (val) Object.assign(form.value, val)
}, { immediate: true })

// Agregar console.log para depuración
onMounted(() => {
  console.log('ProjectForm - Props:', {
    isSupervisor: props.isSupervisor,
    isAdmin: props.isAdmin,
    canEdit: canEdit.value
  })
})

const defaultProjectTemplates = ref<any[]>([])

// Cargar proyectos predeterminados desde Firestore
async function loadDefaultProjectTemplates() {
  const snapshot = await getDocs(collection(db, 'default-projects'))
  defaultProjectTemplates.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

onMounted(() => {
  loadDefaultProjectTemplates()
})

// Guardar como predeterminado en Firestore
async function saveAsCustomTemplate(projectData: any) {
  const { supervisor, supervisorId, cliente, ...rest } = projectData
  await addDoc(collection(db, 'default-projects'), rest)
  await loadDefaultProjectTemplates()
}

// Verificar permisos antes de enviar el formulario
async function handleSubmit() {
  console.log('Intentando enviar formulario:', {
    isSupervisor: props.isSupervisor,
    isAdmin: props.isAdmin,
    canEdit: canEdit.value
  })

  if (!canEdit.value) {
    error.value = 'Solo los supervisores y administradores pueden crear o editar proyectos'
    return
  }

  try {
    isSubmitting.value = true
    error.value = ''
    
    // Validar fechas
    if (form.value.fechaFin && new Date(form.value.fechaFin) < new Date(form.value.fechaInicio)) {
      error.value = 'La fecha de fin no puede ser anterior a la fecha de inicio'
      return
    }
    
    // Confirmar si guardar como predeterminado
    const guardar = window.confirm('¿Deseas guardar este proyecto como predeterminado?')
    if (guardar) {
      await saveAsCustomTemplate({ ...form.value, carpetas: Object.keys(selectedFolders.value).filter(f => selectedFolders.value[f]) })
    }
    emit('submit', { ...form.value, carpetas: Object.keys(selectedFolders.value).filter(f => selectedFolders.value[f]) })
  } catch (err) {
    console.error('Error al guardar proyecto:', err)
    error.value = 'Error al guardar el proyecto'
  } finally {
    isSubmitting.value = false
  }
}

const selectedTemplate = ref('')

watch(selectedTemplate, (val) => {
  if (val && val !== '') {
    const template = defaultProjectTemplates.value.find(t => t.id === val)
    if (template) {
      form.value.nombre = template.nombre || ''
      form.value.descripcion = template.descripcion || ''
      form.value.fechaInicio = template.fechaInicio || ''
      form.value.fechaFin = template.fechaFin || ''
      // Seleccionar carpetas
      Object.keys(selectedFolders.value).forEach(f => selectedFolders.value[f] = false)
      if (Array.isArray(template.carpetas)) {
        template.carpetas.forEach((f: string) => {
          if (f in selectedFolders.value) selectedFolders.value[f] = true
        })
      }
    }
  }
})
</script>

<style scoped>
.input {
  @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
         bg-white dark:bg-zinc-900 
         text-gray-900 dark:text-gray-100 
         placeholder-gray-500 dark:placeholder-gray-400
         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
         transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors
         dark:bg-blue-500 dark:hover:bg-blue-400;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 
         text-gray-700 dark:text-gray-200 
         hover:bg-gray-50 dark:hover:bg-zinc-800 
         rounded-lg transition-colors;
}
</style> 