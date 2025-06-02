import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  isRead: boolean
  createdAt: Date
  relatedDocumentId?: string
  relatedProjectId?: string
}

export const useNotifications = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()
  
  const notifications = ref<Notification[]>([])
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.isRead).length
  )
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Get notifications for current user
  const getNotifications = async (limit = 20) => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return []
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const q = query(
        collection($firebase.firestore, 'notifications'),
        where('userId', '==', user.value.id),
        orderBy('createdAt', 'desc'),
        limit(limit)
      )
      
      const querySnapshot = await getDocs(q)
      
      notifications.value = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt)
        } as Notification
      })
      
      return notifications.value
    } catch (err) {
      console.error('Error fetching notifications:', err)
      error.value = 'Error al cargar notificaciones'
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc($firebase.firestore, 'notifications', notificationId)
      
      // Update notification
      await updateDoc(docRef, {
        isRead: true
      })
      
      // Update local state
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index].isRead = true
      }
      
      return true
    } catch (err) {
      console.error('Error marking notification as read:', err)
      error.value = 'Error al marcar notificación como leída'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return false
    }
    
    if (notifications.value.length === 0) {
      return true
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const unreadNotifications = notifications.value.filter(n => !n.isRead)
      
      if (unreadNotifications.length === 0) {
        return true
      }
      
      // Update all unread notifications
      const promises = unreadNotifications.map(notification => 
        updateDoc(
          doc($firebase.firestore, 'notifications', notification.id),
          { isRead: true }
        )
      )
      
      await Promise.all(promises)
      
      // Update local state
      notifications.value = notifications.value.map(notification => ({
        ...notification,
        isRead: true
      }))
      
      return true
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      error.value = 'Error al marcar todas las notificaciones como leídas'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Create a notification
  const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'error' = 'info',
    relatedDocumentId?: string,
    relatedProjectId?: string
  ) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Add notification to Firestore
      const docRef = await addDoc(collection($firebase.firestore, 'notifications'), {
        userId,
        title,
        message,
        type,
        isRead: false,
        createdAt: serverTimestamp(),
        relatedDocumentId,
        relatedProjectId
      })
      
      return docRef.id
    } catch (err) {
      console.error('Error creating notification:', err)
      error.value = 'Error al crear notificación'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc($firebase.firestore, 'notifications', notificationId)
      
      // Get notification to check if it belongs to current user
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        error.value = 'Notificación no encontrada'
        return false
      }
      
      const notificationData = docSnap.data()
      
      if (notificationData.userId !== user.value.id) {
        error.value = 'No tienes permiso para eliminar esta notificación'
        return false
      }
      
      // Delete notification
      await deleteDoc(docRef)
      
      // Update local state
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
      
      return true
    } catch (err) {
      console.error('Error deleting notification:', err)
      error.value = 'Error al eliminar notificación'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Create a document notification for relevant users
  const notifyDocumentChange = async (
    documentId: string,
    projectId: string,
    action: 'uploaded' | 'updated' | 'validated' | 'rejected',
    documentName: string
  ) => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Get project to find all assigned technicians
      const { getProjectById } = useProjects()
      const project = await getProjectById(projectId)
      
      if (!project) {
        error.value = 'Proyecto no encontrado'
        return false
      }
      
      // Create message based on action
      let title = ''
      let message = ''
      let type: 'info' | 'warning' | 'success' | 'error' = 'info'
      
      switch (action) {
        case 'uploaded':
          title = 'Nuevo documento'
          message = `Se ha subido un nuevo documento: ${documentName}`
          type = 'info'
          break
        case 'updated':
          title = 'Documento actualizado'
          message = `Se ha actualizado el documento: ${documentName}`
          type = 'info'
          break
        case 'validated':
          title = 'Documento validado'
          message = `El documento ${documentName} ha sido validado`
          type = 'success'
          break
        case 'rejected':
          title = 'Documento rechazado'
          message = `El documento ${documentName} ha sido rechazado`
          type = 'error'
          break
      }
      
      // Create notifications for all technicians assigned to this project
      const promises = project.tecnicosAsignados.map(technicianId => {
        // Don't notify the user who performed the action
        if (technicianId !== user.value?.id) {
          return createNotification(
            technicianId,
            title,
            message,
            type,
            documentId,
            projectId
          )
        }
        return Promise.resolve(null)
      })
      
      await Promise.all(promises)
      
      return true
    } catch (err) {
      console.error('Error creating document notifications:', err)
      error.value = 'Error al crear notificaciones'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Create a project notification for relevant users
  const notifyProjectChange = async (
    projectId: string,
    action: 'created' | 'updated' | 'completed' | 'assigned',
    projectName: string
  ) => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Get project to find all assigned technicians
      const { getProjectById } = useProjects()
      const project = await getProjectById(projectId)
      
      if (!project) {
        error.value = 'Proyecto no encontrado'
        return false
      }
      
      // Create message based on action
      let title = ''
      let message = ''
      let type: 'info' | 'warning' | 'success' | 'error' = 'info'
      
      switch (action) {
        case 'created':
          title = 'Nuevo proyecto'
          message = `Se ha creado un nuevo proyecto: ${projectName}`
          type = 'info'
          break
        case 'updated':
          title = 'Proyecto actualizado'
          message = `Se ha actualizado el proyecto: ${projectName}`
          type = 'info'
          break
        case 'completed':
          title = 'Proyecto completado'
          message = `El proyecto ${projectName} ha sido marcado como completado`
          type = 'success'
          break
        case 'assigned':
          title = 'Asignación a proyecto'
          message = `Has sido asignado al proyecto: ${projectName}`
          type = 'info'
          break
      }
      
      // Create notifications for all technicians assigned to this project
      const promises = project.tecnicosAsignados.map(technicianId => {
        // Don't notify the user who performed the action (except for assignment)
        if (technicianId !== user.value?.id || action === 'assigned') {
          return createNotification(
            technicianId,
            title,
            message,
            type,
            undefined,
            projectId
          )
        }
        return Promise.resolve(null)
      })
      
      await Promise.all(promises)
      
      return true
    } catch (err) {
      console.error('Error creating project notifications:', err)
      error.value = 'Error al crear notificaciones'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    notifyDocumentChange,
    notifyProjectChange
  }
} 