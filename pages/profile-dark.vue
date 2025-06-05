<template>
  <div class="min-h-screen w-full bg-zinc-900 flex flex-col md:flex-row gap-6 p-2 md:p-0">
    <!-- Sidebar de tabs -->
    <div class="w-full md:w-1/4 bg-zinc-800 rounded-2xl shadow-xl p-4 flex flex-col gap-2 h-fit">
      <button :class="tabClass('profile')" @click="activeTab = 'profile'">
        <span class="material-icons mr-2">person</span> <span class="hidden md:inline">Perfil</span>
      </button>
      <button :class="tabClass('security')" @click="activeTab = 'security'">
        <span class="material-icons mr-2">security</span> <span class="hidden md:inline">Seguridad</span>
      </button>
      <button :class="tabClass('notifications')" @click="activeTab = 'notifications'">
        <span class="material-icons mr-2">notifications</span> <span class="hidden md:inline">Notificaciones</span>
      </button>
      <button :class="tabClass('appearance')" @click="activeTab = 'appearance'">
        <span class="material-icons mr-2">palette</span> <span class="hidden md:inline">Apariencia</span>
      </button>
    </div>

    <!-- Panel principal -->
    <div class="w-full md:w-3/4 bg-zinc-800 rounded-2xl shadow-xl p-8 transition-colors">
      <!-- PERFIL -->
      <div v-if="activeTab === 'profile'">
        <h2 class="text-2xl font-bold mb-8 text-zinc-100">Perfil de Usuario</h2>
        <div class="flex flex-col sm:flex-row items-center gap-8 mb-10">
          <div class="relative group">
            <div class="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-pink-400 shadow-2xl flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-zinc-900 transition-transform duration-300 group-hover:scale-105">
              <img v-if="profile.fotoUrl" :src="profile.fotoUrl" alt="Avatar" class="object-cover w-full h-full" />
              <span v-else>{{ getInitials(profile.nombre) }}</span>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
            <button @click="triggerFileInput" class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-4 py-1 rounded-full bg-zinc-900 text-pink-400 font-semibold text-xs shadow hover:bg-pink-900 border border-pink-700 transition">Cambiar foto</button>
          </div>
        </div>
        <form @submit.prevent="updateProfile" class="space-y-6 max-w-xl mx-auto">
          <div>
            <label class="block text-sm font-semibold text-zinc-300 mb-1">Nombre</label>
            <input v-model="profile.nombre" type="text" class="w-full px-4 py-2 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-zinc-300 mb-1">Email</label>
            <input v-model="profile.email" type="email" class="w-full px-4 py-2 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-zinc-300 mb-1">Cargo</label>
            <input v-model="profile.cargo" type="text" class="w-full px-4 py-2 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition" placeholder="Ej: Supervisor de Proyectos" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-zinc-300 mb-1">Teléfono</label>
            <input v-model="profile.telefono" type="text" class="w-full px-4 py-2 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition" placeholder="+56 9 1234 5678" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-zinc-300 mb-1">Rol</label>
            <div class="text-zinc-100 font-semibold">{{ getRoleName(profile.rol) }}</div>
          </div>
          <div class="flex justify-end">
            <button type="submit" class="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-400 hover:to-blue-400 text-white font-semibold px-8 py-2 rounded-xl shadow-lg transition-all duration-200 focus:ring-2 focus:ring-pink-400 focus:outline-none">
              <span v-if="isLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
              Guardar Cambios
            </button>
          </div>
          <div v-if="error" class="bg-red-900/50 border-l-4 border-red-400 p-4 mt-4 rounded-xl">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="material-icons text-red-400">error</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-400">{{ error }}</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- SEGURIDAD -->
      <div v-else-if="activeTab === 'security'">
        <h2 class="text-2xl font-bold mb-8 text-zinc-100">Seguridad</h2>
        <div class="max-w-md mx-auto">
          <form @submit.prevent="handlePasswordChange" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-zinc-300 mb-1">Contraseña Actual</label>
              <div class="relative">
                <input :type="showCurrent ? 'text' : 'password'" v-model="passwordForm.current" required minlength="6"
                  class="w-full px-4 py-2 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition pr-10" placeholder="Contraseña actual" />
                <button type="button" @click="showCurrent = !showCurrent" class="absolute right-2 top-2 text-zinc-400 hover:text-pink-400">
                  <span class="material-icons">{{ showCurrent ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-zinc-300 mb-1">Nueva Contraseña</label>
              <div class="relative">
                <input :type="showNew ? 'text' : 'password'" v-model="passwordForm.new" required minlength="6"
                  class="w-full px-4 py-2 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 outline-none transition pr-10" placeholder="Nueva contraseña" />
                <button type="button" @click="showNew = !showNew" class="absolute right-2 top-2 text-zinc-400 hover:text-pink-400">
                  <span class="material-icons">{{ showNew ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <p class="text-xs text-zinc-400 mt-1">Mínimo 6 caracteres</p>
            </div>
            <div class="flex justify-end">
              <button type="submit" class="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-400 hover:to-blue-400 text-white font-semibold px-8 py-2 rounded-xl shadow-lg transition-all duration-200 focus:ring-2 focus:ring-pink-400 focus:outline-none" :disabled="passwordLoading">
                <span v-if="passwordLoading" class="material-icons animate-spin mr-1 text-sm">autorenew</span>
                Cambiar Contraseña
              </button>
            </div>
            <div v-if="passwordError" class="bg-red-900/50 border-l-4 border-red-400 p-4 mt-4 rounded-xl">
              <div class="flex">
                <div class="flex-shrink-0">
                  <span class="material-icons text-red-400">error</span>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-400">{{ passwordError }}</p>
                </div>
              </div>
            </div>
            <div v-if="passwordSuccess" class="mt-4 bg-green-900/50 border-l-4 border-green-400 p-4 rounded-xl">
              <div class="flex items-center">
                <span class="material-icons text-green-400">check_circle</span>
                <span class="ml-2 text-green-300 text-sm">Contraseña cambiada correctamente</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- NOTIFICACIONES -->
      <div v-else-if="activeTab === 'notifications'">
        <h2 class="text-2xl font-bold mb-8 text-zinc-100">Notificaciones</h2>
        <div class="text-zinc-400">Próximamente podrás configurar tus notificaciones aquí.</div>
      </div>

      <!-- APARIENCIA -->
      <div v-else-if="activeTab === 'appearance'">
        <h2 class="text-2xl font-bold mb-8 text-zinc-100">Apariencia</h2>
        <div class="text-zinc-400">Próximamente podrás personalizar la apariencia de la aplicación.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isLoading = ref(false)
const error = ref(null)
const activeTab = ref('profile')
const fileInput = ref(null)

const profile = ref({
  nombre: 'Lucas',
  email: 'alexanderviveros9@gmail.com',
  cargo: 'Supervisor de Proyectos',
  telefono: '+56 9 1234 5678',
  rol: 'admin',
  fotoUrl: ''
})

// Password state
const passwordForm = ref({ current: '', new: '' })
const showCurrent = ref(false)
const showNew = ref(false)
const passwordLoading = ref(false)
const passwordError = ref(null)
const passwordSuccess = ref(false)

function tabClass(tab) {
  return [
    'flex items-center px-4 py-2 rounded-lg font-medium transition',
    activeTab.value === tab
      ? 'bg-pink-900 text-pink-300 shadow'
      : 'text-zinc-200 hover:bg-zinc-900 hover:text-pink-400'
  ]
}

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return parts[0][0].toUpperCase()
}

function getRoleName(role) {
  switch (role) {
    case 'admin':
    case 'administrador':
      return 'Administrador'
    case 'supervisor':
      return 'Supervisor'
    case 'tecnico':
      return 'Técnico'
    default:
      return role
  }
}

function triggerFileInput() {
  fileInput.value && fileInput.value.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  // Solo preview local
  const reader = new FileReader()
  reader.onload = (ev) => {
    profile.value.fotoUrl = ev.target.result
  }
  reader.readAsDataURL(file)
}

function updateProfile() {
  isLoading.value = true
  error.value = null
  setTimeout(() => {
    isLoading.value = false
  }, 800)
}

function handlePasswordChange() {
  passwordLoading.value = true
  passwordError.value = null
  passwordSuccess.value = false
  setTimeout(() => {
    if (!passwordForm.value.current || !passwordForm.value.new) {
      passwordError.value = 'Debes completar ambos campos.'
      passwordLoading.value = false
      return
    }
    passwordSuccess.value = true
    passwordLoading.value = false
    setTimeout(() => {
      passwordForm.value = { current: '', new: '' }
      passwordSuccess.value = false
    }, 1200)
  }, 900)
}
</script> 