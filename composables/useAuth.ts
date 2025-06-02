import { ref, computed, onServerPrefetch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import type { User } from '~/types/user'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore'
import { auth, db } from '~/utils/firebase'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  
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
          
          // Primero intentamos buscar por UID (estándar)
          try {
            let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            
            // Si no existe, buscar por cualquier documento que tenga el mismo email
            if (!userDoc.exists()) {
              console.log('Buscando usuario por email en lugar de UID...');
              const usersRef = collection(db, 'users');
              const q = query(usersRef);
              const querySnapshot = await getDocs(q);
              
              let foundUserDoc = null;
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.email === firebaseUser.email) {
                  console.log('¡Usuario encontrado por email! ID:', doc.id);
                  foundUserDoc = { id: doc.id, ...data };
                }
              });
              
              if (foundUserDoc) {
                console.log('Usando documento encontrado por email:', foundUserDoc);
                // Establecer usuario usando el documento encontrado
                authStore.setUser({
                  id: foundUserDoc.id,
                  email: foundUserDoc.email,
                  nombre: foundUserDoc.nombre || 'Usuario',
                  role: foundUserDoc.role,
                  fechaCreacion: foundUserDoc.fechaCreacion
                });
              } else {
                console.warn('No se encontró el usuario ni por UID ni por email');
                authStore.clearUser();
              }
            } else {
              // Usuario existe en Firestore por UID, obtener datos completos
              const userData = userDoc.data();
              console.log('Datos del usuario encontrados por UID:', userData);
              
              authStore.setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                nombre: userData.nombre || firebaseUser.displayName || 'Usuario',
                role: userData.role || 'tecnico',
                fechaCreacion: userData.fechaCreacion || new Date()
              });
            }
          } catch (err) {
            console.error('Error al obtener datos de usuario de Firestore:', err);
            authStore.clearUser();
          }
        } else {
          // No hay usuario autenticado
          console.log('No hay usuario autenticado en Firebase');
          authStore.clearUser();
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
   * Crea un nuevo usuario por el administrador
   */
  const createUser = async (userData: {nombre: string; email: string; role: string; password: string}) => {
    if (!isAdmin.value) {
      error.value = 'Solo los administradores pueden crear usuarios';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Guardar el usuario actual antes de crear uno nuevo
      const currentUser = auth.currentUser;
      
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const newUser = userCredential.user;
      
      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        nombre: userData.nombre,
        email: userData.email,
        role: userData.role,
        fechaCreacion: new Date(),
        createdBy: authStore.user?.id || 'sistema',
        activo: true
      });
      
      console.log('Usuario creado exitosamente:', newUser.uid);
      
      // Importante: volver a iniciar sesión con el usuario administrador
      // para evitar quedarse con la sesión del usuario recién creado
      if (currentUser) {
        // Esto requiere conocer la contraseña del admin, así que en lugar de eso,
        // simplemente cerramos sesión y dejamos que el admin vuelva a iniciar sesión
        await signOut(auth);
        
        // Forzar recarga para asegurar que se cierre la sesión correctamente
        if (process.client) {
          window.location.reload();
        }
      }
      
      return true;
    } catch (err: any) {
      console.error('Error al crear usuario:', err);
      
      // Manejar errores específicos de Firebase
      if (err.code === 'auth/email-already-in-use') {
        error.value = 'El correo electrónico ya está en uso';
      } else if (err.code === 'auth/invalid-email') {
        error.value = 'Correo electrónico inválido';
      } else if (err.code === 'auth/weak-password') {
        error.value = 'La contraseña es demasiado débil';
      } else {
        error.value = 'Error al crear usuario';
      }
      
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Obtiene todos los usuarios desde Firestore
   */
  const getAllUsers = async () => {
    if (!isAdmin.value) {
      error.value = 'Solo los administradores pueden listar usuarios';
      return [];
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          email: userData.email,
          nombre: userData.nombre,
          role: userData.role,
          fechaCreacion: userData.fechaCreacion?.toDate() || new Date()
        });
      });
      
      return users;
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      error.value = 'Error al obtener la lista de usuarios';
      return [];
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
   * Eliminar usuario
   */
  const deleteUser = async (userId: string) => {
    if (!isAdmin.value) {
      error.value = 'Solo los administradores pueden eliminar usuarios';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // 1. Primero eliminar el documento de usuario en Firestore
      await deleteDoc(doc(db, 'users', userId));
      console.log('Documento de usuario eliminado:', userId);
      
      // 2. También podríamos desactivar el usuario marcándolo como inactivo
      // esto es útil si quieres mantener un registro pero impedir el acceso
      /*
      await updateDoc(doc(db, 'users', userId), {
        activo: false,
        fechaEliminacion: new Date(),
        eliminadoPor: authStore.user?.id || 'sistema'
      });
      console.log('Usuario marcado como inactivo:', userId);
      */
      
      // Nota: Eliminar un usuario de Authentication requiere Firebase Admin SDK 
      // o Cloud Functions. No es posible hacerlo directamente desde el cliente.
      console.warn('La eliminación de la cuenta de autenticación requiere Firebase Admin SDK.');
      
      return true;
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      error.value = 'Error al eliminar usuario';
      return false;
    } finally {
      isLoading.value = false;
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
    createUser,
    getAllUsers,
    logout,
    changePassword,
    deleteUser
  }
} 