import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  // Initialize Firebase with the configuration from runtime config
  const firebaseConfig = config.public.firebaseConfig
  
  // Check if Firebase configuration is properly set
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase configuration is missing or incomplete. Using demo values for development.')
  }
  
  // Initialize Firebase app and services
  const firebaseApp = initializeApp(firebaseConfig)
  const auth = getAuth(firebaseApp)
  const firestore = getFirestore(firebaseApp)
  const storage = getStorage(firebaseApp)
  
  // Return Firebase services
  return {
    provide: {
      firebaseApp,
      auth,
      firestore,
      storage
    }
  }
}) 