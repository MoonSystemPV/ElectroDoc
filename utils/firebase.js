import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuración correcta de Firebase proporcionada por el usuario
const firebaseConfig = {
  apiKey: "AIzaSyDq60RU9a1IQw3trAbtNBpRimbzdDekUm0",
  authDomain: "electrodoc-70bd3.firebaseapp.com",
  projectId: "electrodoc-70bd3",
  storageBucket: "electrodoc-70bd3.firebasestorage.app",
  messagingSenderId: "750310764291",
  appId: "1:750310764291:web:66dd9a5850ac56ec0fc336",
  measurementId: "G-FH7Q8MYLTP"
};

// Inicializar Firebase con configuración segura
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase inicializado correctamente con proyecto:", firebaseConfig.projectId);
} catch (error) {
  console.error("Error al inicializar Firebase:", error);
  // Si hay un error de API key, mostrar un mensaje específico
  if (error.code === 'auth/invalid-api-key') {
    console.error("API key de Firebase inválida. Verifica tu configuración.");
  }
}

// Obtener servicios
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Exportar instancias para uso en la aplicación
export { auth, db, storage } 