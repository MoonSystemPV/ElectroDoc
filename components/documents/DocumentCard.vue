<template>
  <div class="document-card w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col p-2">
    <div class="flex items-center gap-3">
      <div 
        class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-2"
        :class="{
          'bg-blue-100 text-blue-600': ['TE1', 'TE2'].includes(document.tipo),
          'bg-green-100 text-green-600': document.tipo === 'plano',
          'bg-yellow-100 text-yellow-600': document.tipo === 'informe',
          'bg-purple-100 text-purple-600': document.tipo === 'certificado',
          'bg-gray-100 text-gray-600': document.tipo === 'foto'
        }"
      >
        <span class="material-icons text-base">
          {{ getDocumentIcon(document.tipo) }}
        </span>
      </div>
      <div class="flex-grow min-w-0">
        <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate" :title="document.nombre">
          {{ document.nombre }}
        </h3>
        <div class="flex flex-wrap items-center mt-0.5 text-xs text-zinc-500 dark:text-zinc-300">
          <span class="mr-2">{{ getDocumentTypeName(document.tipo) }}</span>
          <span 
            class="badge"
            :class="{
              'bg-yellow-100 text-yellow-800': document.estado === 'pendiente',
              'bg-green-100 text-green-800': document.estado === 'validado',
              'bg-red-100 text-red-800': document.estado === 'rechazado',
              'bg-orange-100 text-orange-800': document.estado === 'comentado por supervisor'
            }"
          >
            {{ document.estado }}
          </span>
        </div>
        <div class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-400">
          Subido {{ formatDate(document.fechaSubida) }}
        </div>
        <div v-if="document.comentarios" class="mt-1 text-xs italic text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-zinc-700 rounded px-2 py-1 w-fit max-w-full truncate">
          "{{ document.comentarios }}"
        </div>
      </div>
      <!-- Botones de acción para supervisores y administradores -->
      <div v-if="canManageDocument" class="flex gap-1 ml-2">
        <button 
          @click="showStatusModal = true"
          class="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
        >
          Estado
        </button>
        <button 
          @click="confirmDelete"
          class="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
        >
          Eliminar
        </button>
      </div>
    </div>
    <div class="border-t border-zinc-200 dark:border-zinc-700 px-2 py-1 bg-gray-50 dark:bg-zinc-900 flex justify-end space-x-1 mt-2">
      <button
        @click="$emit('view', document)"
        class="text-blue-600 hover:text-blue-900 p-1"
        title="Ver documento"
      >
        <span class="material-icons text-sm">visibility</span>
      </button>
      <button
        @click="openEditNameModal"
        class="text-zinc-600 hover:text-zinc-900 p-1"
        title="Editar nombre"
      >
        <span class="material-icons text-sm">edit</span>
      </button>
      <button
        @click="$emit('download', document)"
        class="text-blue-600 hover:text-blue-900 p-1"
        title="Descargar documento"
      >
        <span class="material-icons text-sm">download</span>
      </button>
      <button
        v-if="canValidate && document.estado === 'pendiente'"
        @click="$emit('validate', document)"
        class="text-green-600 hover:text-green-900 p-1"
        title="Validar documento"
      >
        <span class="material-icons text-sm">check_circle</span>
      </button>
      <button
        v-if="canValidate && document.estado === 'pendiente'"
        @click="$emit('reject', document)"
        class="text-red-600 hover:text-red-900 p-1"
        title="Rechazar documento"
      >
        <span class="material-icons text-sm">cancel</span>
      </button>
    </div>
  </div>

  <!-- MODALES FUERA DEL CONTENEDOR PRINCIPAL -->
  <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold mb-4">Cambiar Estado del Documento</h3>
      <div class="space-y-4">
        <select 
          v-model="newStatus" 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pendiente">Pendiente</option>
          <option value="validado">Validado</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <textarea 
          v-model="statusComment"
          placeholder="Comentarios (opcional)"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        ></textarea>
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <button 
          @click="showStatusModal = false"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button 
          @click="updateStatus"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
      <p class="text-gray-600 mb-6">¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.</p>
      <div class="flex justify-end gap-2">
        <button 
          @click="showDeleteModal = false"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button 
          @click="deleteDocument"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
  <div v-if="showEditNameModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold mb-4">Editar Nombre del Documento</h3>
      <div class="space-y-4">
        <input 
          v-model="newName" 
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nuevo nombre del documento"
        />
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <button 
          @click="showEditNameModal = false"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button 
          @click="updateDocumentName"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '~/composables/useAuth'
import { useDocuments } from '~/composables/useDocuments'
import { useToast } from '~/composables/useToast'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase'

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  canValidate: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view', 'download', 'validate', 'reject'])

const { user, isAdmin, isSupervisor } = useAuth()
const { validateDocument, rejectDocument, deleteDocument: deleteDoc } = useDocuments()
const { showToast } = useToast()

// Estado local
const showStatusModal = ref(false)
const showDeleteModal = ref(false)
const showEditNameModal = ref(false)
const newStatus = ref(props.document.estado)
const statusComment = ref('')
const newName = ref(props.document.nombre)

// Computed properties
const canManageDocument = computed(() => {
  return isAdmin.value || isSupervisor.value
})

// Helper functions
const formatDate = (date: Date) => {
  return format(date, 'dd MMM yyyy', { locale: es })
}

const getDocumentTypeName = (type: string) => {
  switch (type) {
    case 'TE1': return 'Formulario TE1'
    case 'TE2': return 'Formulario TE2'
    case 'plano': return 'Plano Eléctrico'
    case 'informe': return 'Informe'
    case 'certificado': return 'Certificado'
    case 'foto': return 'Fotografía'
    default: return type
  }
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'TE1':
    case 'TE2':
      return 'description'
    case 'plano':
      return 'architecture'
    case 'informe':
      return 'article'
    case 'certificado':
      return 'verified'
    case 'foto':
      return 'image'
    default:
      return 'insert_drive_file'
  }
}

async function updateStatus() {
  try {
    // Si el usuario es admin o supervisor y hay comentario, cambiar estado y guardar comentario
    if ((isAdmin.value || isSupervisor.value) && statusComment.value.trim() !== '') {
      await validateDocument(props.document.id, statusComment.value, 'comentado por supervisor')
      showToast('Comentario agregado y estado actualizado a "comentado por supervisor"', 'success')
    } else if (newStatus.value === 'validado') {
      await validateDocument(props.document.id, statusComment.value)
      showToast('Estado actualizado correctamente', 'success')
    } else if (newStatus.value === 'rechazado') {
      await rejectDocument(props.document.id, statusComment.value)
      showToast('Estado actualizado correctamente', 'success')
    }
    showStatusModal.value = false
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    showToast('Error al actualizar el estado', 'error')
  }
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function deleteDocument() {
  try {
    await deleteDoc(props.document.id)
    showDeleteModal.value = false
    showToast('Documento eliminado correctamente', 'success')
  } catch (error) {
    console.error('Error al eliminar documento:', error)
    showToast('Error al eliminar el documento', 'error')
  }
}

async function updateDocumentName() {
  try {
    const docRef = doc(db, 'documents', props.document.id)
    await updateDoc(docRef, { nombre: newName.value })
    showEditNameModal.value = false
    showToast('Nombre del documento actualizado correctamente', 'success')
    // Emitir evento para actualizar la lista
    emit('update')
  } catch (error) {
    console.error('Error al actualizar nombre del documento:', error)
    showToast('Error al actualizar el nombre del documento', 'error')
  }
}

// Abrir modal de edición de nombre
function openEditNameModal() {
  newName.value = props.document.nombre
  showEditNameModal.value = true
}

// Escuchar el evento editName
watch(() => emit('editName', props.document), () => {
  openEditNameModal()
})
</script>

<style scoped>
.document-card {
  transition: all 0.2s ease-in-out;
}

.document-card:hover {
  transform: translateY(-1px);
}

.badge {
  @apply px-2 py-0.5 rounded-full text-xs font-medium;
}
</style> 