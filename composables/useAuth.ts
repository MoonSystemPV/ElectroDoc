import { ref, computed, onServerPrefetch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import type { User } from '~/types/user'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  deleteDoc,
  updateDoc,
  where
} from 'firebase/firestore'
import { auth, db, googleProvider } from '~/utils/firebase'
import { useApi } from './useApi'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const api = useApi()

  // Local state for loading and error handling
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get the current authenticated user from the store
  const user = computed(() => authStore.user)

  // Add isAuthenticated computed property for middleware
  const isAuthenticated = computed(() => !!authStore.user)
  const isAdmin = computed(() => authStore.user?.role === 'admin' || authStore.user?.role === 'administrativo')
  const isSupervisor = computed(() => authStore.user?.role === 'supervisor')
  const isTechnician = computed(() => authStore.user?.role === 'tecnico')

  /**
   * Inicializa el estado de autenticación monitoreando cambios en Firebase
   */
  const initAuth = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Configurar el listener de autenticación de Firebase
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          console.log('Usuario autenticado en Firebase:', firebaseUser.email, 'UID:', firebaseUser.uid);

          try {
            let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

            if (!userDoc.exists()) {
              // Si no existe, crear el documento automáticamente
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                nombre: firebaseUser.displayName || 'Usuario',
                email: firebaseUser.email,
                role: 'tecnico', // o el rol que quieras por defecto
                fechaCreacion: new Date(),
                activo: true
              });
              userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              console.log('Documento de usuario creado automáticamente en initAuth');
            }

            const userData = userDoc.data() || {};
            authStore.setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              nombre: userData.nombre || firebaseUser.displayName || 'Usuario',
              role: userData.role || 'tecnico',
              fechaCreacion: userData.fechaCreacion || new Date()
            });
            authStore.setInitialized(true);
          } catch (err) {
            console.error('Error al obtener/crear datos de usuario de Firestore:', err);
            authStore.clearUser();
            authStore.setInitialized(true);
          }
        } else {
          // No hay usuario autenticado
          console.log('No hay usuario autenticado en Firebase');
          authStore.clearUser();
          authStore.setInitialized(true);
        }

        isLoading.value = false;
      });

      // Limpiar el listener al desmontar
      if (process.client) {
        // Devolver función para desuscribirse (útil para onUnmounted)
        return unsubscribe;
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      error.value = 'Error inicializando autenticación';
      isLoading.value = false;
    }
  }

  /**
   * Login with email and password using Firebase
   */
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    console.log('Intentando iniciar sesión con:', email);

    try {
      // Iniciar sesión con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // La actualización del store la maneja el listener en initAuth
      console.log('Login exitoso:', userCredential.user.email, 'UID:', userCredential.user.uid);

      // Verificar si el usuario existe en Firestore y si es admin
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        console.log('Datos de usuario en Firestore:', userDoc.data());
      } else {
        console.warn('¡ATENCIÓN! Usuario autenticado pero no existe en Firestore');
        // Crear documento de usuario si no existe
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          nombre: userCredential.user.displayName || 'Usuario',
          email: userCredential.user.email,
          role: 'admin', // Asumimos admin para el primer usuario
          fechaCreacion: new Date(),
          activo: true
        });
        console.log('Documento de usuario creado automáticamente');
      }

      return true;
    } catch (err: any) {
      console.error('Login error con código:', err.code);
      console.error('Mensaje completo del error:', err.message);

      // Manejar errores específicos de Firebase
      if (err.code === 'auth/user-not-found') {
        error.value = 'Usuario no encontrado. Verifica el correo electrónico.';
      } else if (err.code === 'auth/wrong-password') {
        error.value = 'Contraseña incorrecta. Inténtalo de nuevo.';
      } else if (err.code === 'auth/too-many-requests') {
        error.value = 'Demasiados intentos fallidos. Intente más tarde';
      } else if (err.code === 'auth/user-disabled') {
        error.value = 'Esta cuenta ha sido deshabilitada';
      } else if (err.code === 'auth/invalid-credential') {
        error.value = 'Credenciales inválidas. Verifica tu correo y contraseña.';
      } else {
        error.value = `Error al iniciar sesión: ${err.code}`;
      }

      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Solicita un restablecimiento de contraseña
   */
  const requestPasswordReset = async (email: string) => {
    isLoading.value = true
    error.value = null

    try {
      await sendPasswordResetEmail(auth, email)
      console.log('Email de restablecimiento enviado a:', email)
      return true
    } catch (err: any) {
      console.error('Error al solicitar restablecimiento de contraseña:', err)

      if (err.code === 'auth/user-not-found') {
        error.value = 'No existe una cuenta con este correo electrónico'
      } else if (err.code === 'auth/invalid-email') {
        error.value = 'El correo electrónico no es válido'
      } else if (err.code === 'auth/too-many-requests') {
        error.value = 'Demasiadas solicitudes. Intente más tarde'
      } else {
        error.value = `Error al enviar correo de restablecimiento: ${err.message}`
      }

      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crea un nuevo usuario por el administrador usando el backend
   */
  const createUser = async (userData: any) => {
    try {
      isLoading.value = true
      error.value = null
      const result = await api.createUser(userData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene todos los usuarios desde Firestore
   */
  const getAllUsers = async () => {
    if (!isAdmin.value) {
      error.value = 'Solo los administradores pueden listar usuarios';
      return [] as User[];
    }

    isLoading.value = true;
    error.value = null;

    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];

      usersSnapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        users.push({
          id: docSnap.id,
          email: userData.email,
          nombre: userData.nombre,
          role: userData.role,
          fechaCreacion: userData.fechaCreacion?.toDate ? userData.fechaCreacion.toDate() : new Date(userData.fechaCreacion)
        });
      });

      return users;
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      error.value = 'Error al obtener la lista de usuarios';
      return [] as User[];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout the current user
   */
  const logout = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await signOut(auth);

      // La actualización del store la maneja el listener en initAuth
      console.log('Sesión cerrada correctamente');

      // Redireccionar a login
      router.push('/login');

      return true;
    } catch (err) {
      console.error('Logout error:', err);
      error.value = 'Error al cerrar sesión';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Change user password (para implementar)
   */
  const changePassword = async (userId: string, newPassword: string) => {
    isLoading.value = true;
    error.value = null;

    if (!isAdmin.value) {
      error.value = 'Solo los administradores pueden cambiar contraseñas';
      return false;
    }

    try {
      // Esta funcionalidad requiere Firebase Admin SDK o una función de Cloud Functions
      // Por ahora, mostramos un mensaje
      console.warn('Cambio de contraseña no implementado completamente. Requiere Firebase Admin SDK.');
      error.value = 'Funcionalidad no disponible en esta versión';
      return false;
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      error.value = 'Error al cambiar la contraseña.';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Eliminar usuario completamente (Auth + Firestore)
   */
  const deleteUser = async (uid: string) => {
    try {
      isLoading.value = true
      error.value = null
      const result = await api.deleteUser(uid)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with Google
   */
  const loginWithGoogle = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Verificar si el correo está autorizado en la base de datos
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', user.email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // Si el correo no está autorizado, cerrar la sesión
        await signOut(auth)
        error.value = 'Tu correo electrónico no está autorizado para iniciar sesión. Por favor, contacta a un administrador para que te agregue al sistema.'
        return false
      }

      // Si el correo está autorizado, actualizar la información del usuario
      const userDoc = querySnapshot.docs[0]
      const userData = userDoc.data()

      // Verificar si el usuario está activo
      if (!userData.activo) {
        await signOut(auth)
        error.value = 'Tu cuenta ha sido desactivada. Por favor, contacta a un administrador.'
        return false
      }

      // Actualizar la información del usuario con los datos de Google
      await updateDoc(doc(db, 'users', userDoc.id), {
        nombre: user.displayName || userData.nombre,
        photoURL: user.photoURL,
        ultimoAcceso: new Date()
      })

      return true
    } catch (err: any) {
      console.error('Error en login con Google:', err)
      if (err.code === 'auth/popup-closed-by-user') {
        error.value = 'Inicio de sesión cancelado'
      } else if (err.code === 'auth/popup-blocked') {
        error.value = 'El popup de inicio de sesión fue bloqueado'
      } else {
        error.value = `Error al iniciar sesión con Google: ${err.message}`
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    isSupervisor,
    isTechnician,
    isLoading,
    error,
    initAuth,
    login,
    loginWithGoogle,
    logout,
    requestPasswordReset,
    createUser,
    getAllUsers,
    changePassword,
    deleteUser
  }
} 