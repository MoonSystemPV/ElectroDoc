import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Variable para verificar si Firebase ya ha sido inicializado
let firebaseApp;
let auth;
let firestore;
let storage;

export default defineNuxtPlugin((nuxtApp) => {
  // Si Firebase ya está inicializado, no lo inicialices de nuevo
  if (firebaseApp) {
    return {
      provide: {
        firebaseApp,
        auth,
        firestore,
        storage
      }
    }
  }
  
  try {
    const config = useRuntimeConfig()
    
    // Initialize Firebase with the configuration from runtime config
    const firebaseConfig = config.public.firebaseConfig
    
    // Check if Firebase configuration is properly set
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Firebase configuration is missing or incomplete.')
      return
    }
    
    // Initialize Firebase app and services
    firebaseApp = initializeApp(firebaseConfig)
    auth = getAuth(firebaseApp)
    firestore = getFirestore(firebaseApp)
    storage = getStorage(firebaseApp)
    
    console.log('Firebase initialized successfully')
    
    // Return Firebase services
    return {
      provide: {
        firebaseApp,
        auth,
        firestore,
        storage
      }
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error)
  }
}) 