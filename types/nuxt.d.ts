/// <reference types="nuxt" />
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'
import type { FirebaseApp } from 'firebase/app'

// Extending Vue interface to include Nuxt global functions
declare global {
  function definePageMeta(meta: {
    middleware?: string | string[]
    layout?: string | boolean
    meta?: Record<string, any>
    [key: string]: any
  }): void
}

// Extend NuxtApp interface
declare module '#app' {
  interface NuxtApp {
    $firebase: {
      app: FirebaseApp
      auth: Auth
      firestore: Firestore
      storage: FirebaseStorage
    }
  }
}

export {} 