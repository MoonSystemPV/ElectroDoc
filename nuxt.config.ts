// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // Disable server-side rendering for Firebase authentication
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: true,
    viewer: true
  },
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },
  app: {
    head: {
      title: 'ElectroDoc - Gestión Documental para Proyectos Eléctricos',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plataforma de gestión documental para ElectroSur Ltda.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      firebaseConfig: {
        // Firebase config will be set via environment variables
        apiKey: process.env.FIREBASE_API_KEY || 'demo-api-key',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
        appId: process.env.FIREBASE_APP_ID || '1:123456789:web:abcdef'
      }
    }
  }
})
