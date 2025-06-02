import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import type { User } from '~/types/user'

// Firebase imports for functions
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'

// Firebase type imports
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

// Firestore imports for functions
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const { $firebase } = useNuxtApp()
  
  // Access Firebase services with proper typing
  const auth = $firebase.auth as Auth
  const db = $firebase.firestore as Firestore
  
  // Local state for loading and error handling
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Get the current authenticated user from the store
  const user = computed(() => authStore.user)
  
  // Add isAuthenticated computed property for middleware
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  
  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User
        
        // Check if user is active
        if (!userData.activo) {
          error.value = 'Su cuenta está desactivada. Contacte al administrador.'
          await firebaseSignOut(auth)
          isLoading.value = false
          return false
        }
        
        // Update last login
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          lastLogin: new Date()
        })
        
        // Store user in Pinia with correct spread order
        authStore.setUser({
          ...userData,
          id: userCredential.user.uid,
          lastLogin: new Date()
        })
        
        return true
      } else {
        error.value = 'No se encontró información de usuario.'
        await firebaseSignOut(auth)
        return false
      }
    } catch (err: any) {
      console.error('Error de autenticación:', err)
      
      // Handle common Firebase auth errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        error.value = 'Correo electrónico o contraseña incorrectos.'
      } else if (err.code === 'auth/too-many-requests') {
        error.value = 'Demasiados intentos fallidos. Intente de nuevo más tarde.'
      } else {
        error.value = 'Error al iniciar sesión. Inténtelo de nuevo.'
      }
      
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Logout the current user
   */
  const logout = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await firebaseSignOut(auth)
      authStore.resetState()
      router.push('/login')
      return true
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      error.value = 'Error al cerrar sesión'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Send password reset email
   */
  const requestPasswordReset = async (email: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (err: any) {
      console.error('Error al enviar correo de restablecimiento:', err)
      
      if (err.code === 'auth/user-not-found') {
        error.value = 'No se encontró ninguna cuenta con este correo electrónico.'
      } else {
        error.value = 'Error al enviar el correo de restablecimiento.'
      }
      
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Change user password
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser) {
      error.value = 'No hay un usuario autenticado.'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      )
      
      await reauthenticateWithCredential(auth.currentUser, credential)
      
      // Change password
      await updatePassword(auth.currentUser, newPassword)
      return true
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err)
      
      if (err.code === 'auth/wrong-password') {
        error.value = 'La contraseña actual es incorrecta.'
      } else {
        error.value = 'Error al cambiar la contraseña.'
      }
      
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    requestPasswordReset,
    changePassword
  }
} 