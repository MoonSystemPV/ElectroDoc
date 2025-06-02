import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import type { User } from '~/types/user'

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
  const isAdmin = computed(() => authStore.user?.role === 'admin')
  const isSupervisor = computed(() => authStore.user?.role === 'supervisor')
  const isTechnician = computed(() => authStore.user?.role === 'tecnico')
  
  /**
   * Inicializa el estado de autenticación
   */
  const initAuth = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Verificar si hay usuario en localStorage para persistencia
      const savedUser = localStorage.getItem('user')
      
      if (savedUser) {
        console.log('Restaurando usuario desde localStorage');
        authStore.setUser(JSON.parse(savedUser));
      } else if (!authStore.user) {
        // Si no hay usuario en localStorage, crear usuario demo admin por defecto
        console.log('Creando usuario administrador por defecto');
        const adminUser = {
          id: 'admin-user',
          email: 'admin@example.com',
          nombre: 'Administrador',
          role: 'admin',
          fechaCreacion: new Date()
        };
        authStore.setUser(adminUser);
        // Guardar en localStorage para persistencia
        localStorage.setItem('user', JSON.stringify(adminUser));
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      error.value = 'Error inicializando autenticación';
      
      // Crear usuario admin si hay error
      const adminUser = {
        id: 'admin-user',
        email: 'admin@example.com',
        nombre: 'Administrador',
        role: 'admin',
        fechaCreacion: new Date()
      };
      authStore.setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Para fines de demostración, simular inicio de sesión según el email
      let userRole = 'supervisor'; // Rol por defecto
      let userName = 'Usuario Demo';
      
      // Determinar el rol basado en el email
      if (email.includes('admin')) {
        userRole = 'admin';
        userName = 'Administrador Sistema';
      } else if (email.includes('tecnico')) {
        userRole = 'tecnico';
        userName = 'Técnico';
      } else if (email.includes('supervisor')) {
        userRole = 'supervisor';
        userName = 'Supervisor';
      }
      
      const user = {
        id: `user-${Date.now()}`,
        email: email,
        nombre: userName,
        role: userRole,
        fechaCreacion: new Date()
      };
      
      authStore.setUser(user);
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Login exitoso:', user);
      return true
    } catch (err) {
      console.error('Login error:', err)
      error.value = 'Error al iniciar sesión'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Register a new user
   */
  const register = async (nombre: string, email: string, password: string, role: string = 'supervisor') => {
    isLoading.value = true
    error.value = null

    try {
      // Para fines de demostración, simular registro
      const user = {
        id: `user-${Date.now()}`,
        email: email,
        nombre: nombre,
        role: role,
        fechaCreacion: new Date()
      };
      
      authStore.setUser(user);
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Registro exitoso:', user);
      return true
    } catch (err) {
      console.error('Registration error:', err)
      error.value = 'Error al registrar usuario'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Crea un nuevo usuario por el administrador
   */
  const createUser = async (userData: {nombre: string; email: string; role: string}) => {
    if (!isAdmin.value) {
      error.value = 'Solo los administradores pueden crear usuarios'
      return false
    }
    
    try {
      // Simular creación de usuario
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        nombre: userData.nombre,
        role: userData.role,
        fechaCreacion: new Date()
      };
      
      // Aquí se guardaría en una base de datos real
      console.log('Usuario creado:', newUser);
      
      return true
    } catch (err) {
      console.error('Error al crear usuario:', err)
      error.value = 'Error al crear usuario'
      return false
    }
  }
  
  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      // Simular cierre de sesión
      authStore.clearUser()
      
      // Eliminar usuario de localStorage
      localStorage.removeItem('user')
      
      console.log('Sesión cerrada correctamente');
      
      // Redireccionar a login
      router.push('/login')
      
      return true
    } catch (err) {
      console.error('Logout error:', err)
      error.value = 'Error al cerrar sesión'
      return false
    }
  }
  
  /**
   * Send password reset email
   */
  const resetPassword = async (email: string) => {
    isLoading.value = true
    error.value = null

    try {
      // Simulación
      console.log('Enviando email de recuperación a:', email)
      return true
    } catch (err) {
      console.error('Password reset error:', err)
      error.value = 'Error al enviar correo de recuperación'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Change user password
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulación de cambio de contraseña
      console.log('Cambiando contraseña (simulación)')
      return true
    } catch (err) {
      console.error('Error al cambiar contraseña:', err)
      error.value = 'Error al cambiar la contraseña.'
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
    register,
    createUser,
    logout,
    resetPassword,
    changePassword
  }
} 