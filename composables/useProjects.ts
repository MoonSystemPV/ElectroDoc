import { ref } from 'vue'
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
  Timestamp,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  limit
} from 'firebase/firestore'
import type { Firestore, DocumentData } from 'firebase/firestore'
import { useNuxtApp } from '#app'
import { useAuth } from '~/composables/useAuth'

export interface Project {
  id: string
  nombre: string
  cliente: string
  descripcion?: string
  fechaInicio: Date
  fechaVencimiento?: Date | null
  ubicacion?: string
  estado: 'activo' | 'completado' | 'cancelado'
  tecnicosAsignados: string[]
  createdAt: Date
  updatedAt: Date
}

// Interface representing the Firestore document data structure
interface ProjectFirestoreData {
  nombre: string
  cliente: string
  descripcion?: string
  fechaInicio: Timestamp | Date
  fechaVencimiento?: Timestamp | Date | null
  ubicacion?: string
  estado: 'activo' | 'completado' | 'cancelado'
  tecnicosAsignados: string[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  createdBy?: string
}

export const useProjects = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()
  
  // Access Firebase services with proper typing
  const db = $firebase.firestore as Firestore
  
  const projects = ref<Project[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  /**
   * Helper function to convert Firestore data to Project
   */
  const convertToProject = (docId: string, data: ProjectFirestoreData): Project => {
    return {
      id: docId,
      nombre: data.nombre,
      cliente: data.cliente,
      descripcion: data.descripcion,
      fechaInicio: data.fechaInicio instanceof Timestamp 
        ? data.fechaInicio.toDate() 
        : new Date(data.fechaInicio),
      fechaVencimiento: data.fechaVencimiento 
        ? data.fechaVencimiento instanceof Timestamp 
          ? data.fechaVencimiento.toDate() 
          : new Date(data.fechaVencimiento)
        : null,
      ubicacion: data.ubicacion,
      estado: data.estado,
      tecnicosAsignados: data.tecnicosAsignados || [],
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate() 
        : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate() 
        : new Date(data.updatedAt)
    }
  }
  
  /**
   * Get all projects with optional filtering
   */
  const getProjects = async (options?: {
    filterByStatus?: string
    filterByTechnician?: string
    limit?: number
  }) => {
    isLoading.value = true
    error.value = null
    
    try {
      const projectsRef = collection(db, 'projects')
      let projectQuery: any = projectsRef
      
      // Build query with filters
      if (options) {
        const constraints = []
        
        if (options.filterByStatus) {
          constraints.push(where('estado', '==', options.filterByStatus))
        }
        
        if (options.filterByTechnician) {
          constraints.push(where('tecnicosAsignados', 'array-contains', options.filterByTechnician))
        }
        
        constraints.push(orderBy('createdAt', 'desc'))
        
        if (options.limit) {
          constraints.push(limit(options.limit))
        }
        
        projectQuery = query(projectsRef, ...constraints)
      } else {
        projectQuery = query(projectsRef, orderBy('createdAt', 'desc'))
      }
      
      const querySnapshot = await getDocs(projectQuery)
      
      projects.value = querySnapshot.docs.map(doc => {
        const data = doc.data() as ProjectFirestoreData
        return convertToProject(doc.id, data)
      })
      
      return projects.value
    } catch (err) {
      console.error('Error fetching projects:', err)
      error.value = 'Error al cargar los proyectos'
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Get projects for the current user (technician role)
   */
  const getUserProjects = async () => {
    if (!user.value?.id) {
      error.value = 'Usuario no autenticado'
      return []
    }
    
    return getProjects({
      filterByTechnician: user.value.id
    })
  }
  
  /**
   * Get a project by ID
   */
  const getProjectById = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'projects', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data() as ProjectFirestoreData
        return convertToProject(docSnap.id, data)
      }
      
      return null
    } catch (err) {
      console.error('Error fetching project:', err)
      error.value = 'Error al cargar el proyecto'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Create a new project
   */
  const createProject = async (projectData: Partial<Project>) => {
    isLoading.value = true
    error.value = null
    
    if (!user.value?.id) {
      error.value = 'Usuario no autenticado'
      return null
    }
    
    try {
      const projectsRef = collection(db, 'projects')
      
      // Add timestamps
      const now = serverTimestamp()
      const newProject = {
        ...projectData,
        createdBy: user.value.id,
        createdAt: now,
        updatedAt: now,
        tecnicosAsignados: projectData.tecnicosAsignados || []
      }
      
      // Add document to Firestore
      const docRef = await addDoc(projectsRef, newProject)
      
      // Get the created project with its ID
      const project = await getProjectById(docRef.id)
      
      // Update local projects list
      if (project) {
        projects.value.unshift(project)
      }
      
      return project
    } catch (err) {
      console.error('Error creating project:', err)
      error.value = 'Error al crear el proyecto'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Update a project
   */
  const updateProject = async (id: string, projectData: Partial<Project>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'projects', id)
      
      // Ensure we're not overwriting the timestamps
      const updateData = {
        ...projectData,
        updatedAt: serverTimestamp()
      }
      
      delete updateData.id
      delete updateData.createdAt
      
      // Update document in Firestore
      await updateDoc(docRef, updateData)
      
      // Update local projects list
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = {
          ...projects.value[index],
          ...projectData,
          updatedAt: new Date()
        }
      }
      
      return true
    } catch (err) {
      console.error('Error updating project:', err)
      error.value = 'Error al actualizar el proyecto'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Delete a project
   */
  const deleteProject = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'projects', id)
      
      // Delete document from Firestore
      await deleteDoc(docRef)
      
      // Remove from local projects list
      projects.value = projects.value.filter(p => p.id !== id)
      
      return true
    } catch (err) {
      console.error('Error deleting project:', err)
      error.value = 'Error al eliminar el proyecto'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Assign a technician to a project
   */
  const assignTechnician = async (projectId: string, technicianId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'projects', projectId)
      
      // Add technician to the project's tecnicosAsignados array
      await updateDoc(docRef, {
        tecnicosAsignados: arrayUnion(technicianId),
        updatedAt: serverTimestamp()
      })
      
      // Update local projects list
      const project = projects.value.find(p => p.id === projectId)
      if (project && !project.tecnicosAsignados.includes(technicianId)) {
        project.tecnicosAsignados.push(technicianId)
        project.updatedAt = new Date()
      }
      
      return true
    } catch (err) {
      console.error('Error assigning technician:', err)
      error.value = 'Error al asignar técnico al proyecto'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Remove a technician from a project
   */
  const removeTechnician = async (projectId: string, technicianId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'projects', projectId)
      
      // Remove technician from the project's tecnicosAsignados array
      await updateDoc(docRef, {
        tecnicosAsignados: arrayRemove(technicianId),
        updatedAt: serverTimestamp()
      })
      
      // Update local projects list
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        project.tecnicosAsignados = project.tecnicosAsignados.filter(id => id !== technicianId)
        project.updatedAt = new Date()
      }
      
      return true
    } catch (err) {
      console.error('Error removing technician:', err)
      error.value = 'Error al eliminar técnico del proyecto'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    projects,
    isLoading,
    error,
    getProjects,
    getUserProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    assignTechnician,
    removeTechnician
  }
} 