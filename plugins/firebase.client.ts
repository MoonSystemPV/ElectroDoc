import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(nuxtApp => {
  console.log('Modo de demostración: Firebase no está en uso')
  
  // Crear objetos mock para simular Firebase
  const mockFirebase = {
    firestore: {},
    auth: {},
    storage: {}
  }
  
  // Proporcionar el objeto mock a la aplicación
  nuxtApp.provide('firebase', mockFirebase)
}) 