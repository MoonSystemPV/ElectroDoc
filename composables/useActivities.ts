import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { useNuxtApp } from '#app'
import { useAuth } from '~/composables/useAuth'
import { ref } from 'vue'

export type ActivityAction = 
  | 'create_project'
  | 'update_project'
  | 'delete_project'
  | 'assign_technician'
  | 'remove_technician'
  | 'upload'
  | 'status_update'
  | 'version_update'

export interface Activity {
  id: string
  projectId: string
  userId: string
  userName?: string
  action: ActivityAction
  details?: string
  timestamp: Date
  targetId?: string
  targetType?: string
}

export const useActivities = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()
  
  // Access Firebase services with proper typing
  const db = $firebase.firestore as Firestore
  
  const activities = ref<Activity[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Log an activity
  const logActivity = async (
    userId: string,
    action: ActivityAction,
    documentId?: string,
    details?: string,
    projectId?: string
  ) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Add activity to Firestore
      const docRef = await addDoc(collection(db, 'activities'), {
        userId,
        action,
        documentId,
        projectId,
        details,
        timestamp: serverTimestamp()
      })
      
      return docRef.id
    } catch (err) {
      console.error('Error logging activity:', err)
      error.value = 'Error al registrar actividad'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // Get activities for a document
  const getDocumentActivities = async (documentId: string, limitCount = 10) => {
    isLoading.value = true
    error.value = null
    
    try {
      const q = query(
        collection(db, 'activities'),
        where('documentId', '==', documentId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      
      activities.value = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate() 
            : new Date(data.timestamp)
        } as Activity
      })
      
      return activities.value
    } catch (err) {
      console.error('Error fetching document activities:', err)
      error.value = 'Error al cargar actividades del documento'
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Get activities for a project
  const getProjectActivities = async (projectId: string, limitCount = 20) => {
    isLoading.value = true
    error.value = null
    
    try {
      const activitiesRef = collection(db, 'activities')
      const q = query(
        activitiesRef,
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const activities = querySnapshot.docs.map(doc => {
        const data = doc.data()
        
        // Convert Firestore Timestamp to Date
        if (data.timestamp && data.timestamp instanceof Timestamp) {
          data.timestamp = data.timestamp.toDate()
        }
        
        return {
          id: doc.id,
          ...data
        }
      })
      
      return activities
    } catch (err) {
      console.error('Error fetching activities:', err)
      error.value = 'Error al cargar las actividades'
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Get activities for a user
  const getUserActivities = async (userId: string, limitCount = 20) => {
    isLoading.value = true
    error.value = null
    
    try {
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      
      const activities = querySnapshot.docs.map(doc => {
        const data = doc.data()
        
        // Convert Firestore Timestamp to Date
        if (data.timestamp && data.timestamp instanceof Timestamp) {
          data.timestamp = data.timestamp.toDate()
        }
        
        return {
          id: doc.id,
          ...data
        }
      })
      
      return activities
    } catch (err) {
      console.error('Error fetching user activities:', err)
      error.value = 'Error al cargar actividades del usuario'
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Get recent activities (for dashboard)
  const getRecentActivities = async (limitCount = 20) => {
    isLoading.value = true
    error.value = null
    
    try {
      const activitiesRef = collection(db, 'activities')
      const q = query(
        activitiesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      
      activities.value = querySnapshot.docs.map(doc => {
        const data = doc.data()
        
        // Convert Firestore Timestamp to Date
        if (data.timestamp && data.timestamp instanceof Timestamp) {
          data.timestamp = data.timestamp.toDate()
        }
        
        return {
          id: doc.id,
          ...data
        } as Activity
      })
      
      return activities.value
    } catch (err) {
      console.error('Error fetching recent activities:', err)
      error.value = 'Error al cargar actividades recientes'
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Add activity record for actions
  const addActivity = async (activityData: {
    projectId: string;
    action: ActivityAction;
    details?: string;
    targetId?: string;
    targetType?: string;
  }) => {
    isLoading.value = true
    error.value = null
    
    if (!user.value?.id) {
      error.value = 'Usuario no autenticado'
      return null
    }
    
    try {
      const activitiesRef = collection(db, 'activities')
      
      await addDoc(activitiesRef, {
        userId: user.value.id,
        projectId: activityData.projectId,
        action: activityData.action,
        details: activityData.details || null,
        targetId: activityData.targetId || null,
        targetType: activityData.targetType || null,
        timestamp: serverTimestamp()
      })
      
      return true
    } catch (err) {
      console.error('Error adding activity:', err)
      error.value = 'Error al registrar actividad'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    logActivity,
    getDocumentActivities,
    getProjectActivities,
    getUserActivities,
    getRecentActivities,
    addActivity,
    activities,
    isLoading,
    error
  }
} 