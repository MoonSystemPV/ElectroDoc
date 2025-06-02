import { auth, db, storage } from '~/utils/firebase'

export default defineNuxtPlugin(() => {
  // Usar las instancias ya inicializadas en utils/firebase.js
  console.log("Firebase plugin utilizando instancias preexistentes")

  // Proporcionar servicios a la aplicación
  return {
    provide: {
      firebaseAuth: auth,
      firebaseDb: db,
      firebaseStorage: storage
    }
  }
}) 