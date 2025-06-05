import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Inicializar la autenticación cuando la aplicación se carga
  if (process.client) {
    const { initAuth } = useAuth()
    console.log('Inicializando autenticación desde plugin...')
    await initAuth()
    console.log('Autenticación inicializada correctamente desde plugin')
  }
}) 