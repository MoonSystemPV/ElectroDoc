import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useProjectStore } from '~/stores/projects'
import { useTasks } from '~/composables/useTasks'
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, limit, FieldValue } from 'firebase/firestore'
import { useNuxtApp } from '#app'

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
  createdAt: Date | FieldValue
  updatedAt: Date | FieldValue
}

export const useProjects = () => {
  const { user } = useAuth()
  const projectStore = useProjectStore()
  const { $firebase } = useNuxtApp()

  const projects = ref<Project[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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
      const projectsRef = collection($firebase.firestore, 'projects')
      let q = query(projectsRef)

      if (options?.filterByStatus) {
        q = query(q, where('estado', '==', options.filterByStatus))
      }

      if (options?.filterByTechnician) {
        q = query(q, where('tecnicosAsignados', 'array-contains', options.filterByTechnician))
      }

      if (options?.limit) {
        q = query(q, limit(options.limit))
      }

      const querySnapshot = await getDocs(q)
      const projectsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[]

      projectStore.setProjects(projectsList)
      projects.value = projectsList

      return projectsList
    } catch (err) {
      console.error('Error fetching projects:', err)
      error.value = 'Error al cargar los proyectos'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a project by ID
   */
  const getProjectById = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const projectDoc = await getDoc(doc($firebase.firestore, 'projects', id))

      if (projectDoc.exists()) {
        const project = {
          id: projectDoc.id,
          ...projectDoc.data()
        } as Project

        return project
      } else {
        error.value = 'Proyecto no encontrado'
        return null
      }
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

    try {
      const projectsRef = collection($firebase.firestore, 'projects')

      // Data to be stored in Firestore
      const dataToStore = {
        nombre: projectData.nombre || 'Nuevo Proyecto',
        cliente: projectData.cliente || 'Cliente',
        descripcion: projectData.descripcion || '',
        fechaInicio: projectData.fechaInicio || new Date(),
        fechaVencimiento: projectData.fechaVencimiento || null,
        ubicacion: projectData.ubicacion || '',
        estado: projectData.estado || 'activo',
        tecnicosAsignados: projectData.tecnicosAsignados || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(projectsRef, dataToStore)

      // Create the Project object for the store, including the new id
      const createdProject: Project = {
        id: docRef.id,
        ...dataToStore,
      } as Project

      projectStore.addProject(createdProject)

      return docRef.id
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
      const projectRef = doc($firebase.firestore, 'projects', id)

      const updateData = {
        ...projectData,
        updatedAt: serverTimestamp()
      }

      await updateDoc(projectRef, updateData)

      // Actualizar el store
      const updatedProject = {
        id,
        ...projectData
      } as Project

      projectStore.updateProject(updatedProject)

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
      await deleteDoc(doc($firebase.firestore, 'projects', id))

      // Actualizar el store
      projectStore.removeProject(id)

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
   * Carga proyectos de demostración cuando no se pueden obtener de Firestore
   */
  const loadDemoProjects = async () => {
    console.log('Cargando proyectos de demostración');

    const demoProjects: Project[] = [
      {
        id: 'proj-1',
        nombre: 'Subestación Centro Comercial',
        cliente: 'Grupo Inmobiliario XYZ',
        descripcion: 'Instalación y configuración de subestación eléctrica para nuevo centro comercial',
        fechaInicio: new Date(2023, 5, 15),
        fechaVencimiento: new Date(2023, 11, 30),
        ubicacion: 'Av. Principal 123, Ciudad',
        estado: 'activo',
        tecnicosAsignados: [user.value?.id || 'tech-1'],
        createdAt: new Date(2023, 5, 10),
        updatedAt: new Date(2023, 5, 10)
      },
      {
        id: 'proj-2',
        nombre: 'Mantenimiento Línea 220kV',
        cliente: 'Distribuidora Eléctrica Nacional',
        descripcion: 'Mantenimiento preventivo de línea de transmisión de 220kV',
        fechaInicio: new Date(2023, 3, 5),
        fechaVencimiento: new Date(2023, 8, 15),
        ubicacion: 'Sector Norte, Tramo 5-8',
        estado: 'activo',
        tecnicosAsignados: [user.value?.id || 'tech-1'],
        createdAt: new Date(2023, 3, 1),
        updatedAt: new Date(2023, 3, 1)
      },
      {
        id: 'proj-3',
        nombre: 'Instalación Paneles Solares',
        cliente: 'EcoEnergía SA',
        descripcion: 'Instalación de sistema de paneles solares para planta industrial',
        fechaInicio: new Date(2023, 2, 10),
        fechaVencimiento: new Date(2023, 7, 20),
        ubicacion: 'Zona Industrial Este',
        estado: 'completado',
        tecnicosAsignados: [user.value?.id || 'tech-1'],
        createdAt: new Date(2023, 2, 5),
        updatedAt: new Date(2023, 7, 20)
      },
      {
        id: 'proj-4',
        nombre: 'Modernización Planta Energética',
        cliente: 'Industrias Manufacturas',
        descripcion: 'Actualización y modernización de sistemas eléctricos en planta de producción',
        fechaInicio: new Date(2023, 1, 15),
        fechaVencimiento: null,
        ubicacion: 'Polígono Industrial Sur',
        estado: 'cancelado',
        tecnicosAsignados: [],
        createdAt: new Date(2023, 1, 10),
        updatedAt: new Date(2023, 4, 5)
      }
    ];

    // Guardar proyectos en el store
    projectStore.setProjects(demoProjects);
    projects.value = demoProjects;

    return demoProjects;
  }

  /**
   * Get projects for the current user (technician role)
   */
  const getUserProjects = async () => {
    if (!user.value?.id) {
      error.value = 'Usuario no autenticado'
      return []
    }

    // Llamamos directamente a loadDemoProjects
    const allProjects = await loadDemoProjects();

    // Filtramos por el id del usuario actual
    const userProjects = allProjects.filter(project =>
      project.tecnicosAsignados.includes(user.value?.id || '')
    );

    return userProjects;
  }

  /**
   * Assign a technician to a project
   */
  const assignTechnician = async (projectId: string, technicianId: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      // Cargar proyectos existentes
      await loadDemoProjects();

      // Buscar el proyecto
      const projectIndex = projectStore.projects.findIndex(p => p.id === projectId);

      if (projectIndex === -1) {
        error.value = 'Proyecto no encontrado';
        return false;
      }

      // Verificar si el técnico ya está asignado
      if (projectStore.projects[projectIndex].tecnicosAsignados.includes(technicianId)) {
        return true; // Ya está asignado, no hacemos nada
      }

      // Añadir el técnico al proyecto
      const updatedProject = {
        ...projectStore.projects[projectIndex],
        tecnicosAsignados: [...projectStore.projects[projectIndex].tecnicosAsignados, technicianId],
        updatedAt: new Date()
      };

      // Actualizar la lista de proyectos
      const updatedProjects = [...projectStore.projects];
      updatedProjects[projectIndex] = updatedProject;
      projectStore.setProjects(updatedProjects);

      return true;
    } catch (err) {
      console.error('Error assigning technician:', err);
      error.value = 'Error al asignar técnico';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Remove a technician from a project
   */
  const removeTechnician = async (projectId: string, technicianId: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      // Cargar proyectos existentes
      await loadDemoProjects();

      // Buscar el proyecto
      const projectIndex = projectStore.projects.findIndex(p => p.id === projectId);

      if (projectIndex === -1) {
        error.value = 'Proyecto no encontrado';
        return false;
      }

      // Eliminar el técnico del proyecto
      const updatedProject = {
        ...projectStore.projects[projectIndex],
        tecnicosAsignados: projectStore.projects[projectIndex].tecnicosAsignados.filter(id => id !== technicianId),
        updatedAt: new Date()
      };

      // Actualizar la lista de proyectos
      const updatedProjects = [...projectStore.projects];
      updatedProjects[projectIndex] = updatedProject;
      projectStore.setProjects(updatedProjects);

      return true;
    } catch (err) {
      console.error('Error removing technician:', err);
      error.value = 'Error al eliminar técnico';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    projects,
    isLoading,
    error,
    getProjects,
    loadDemoProjects,
    getUserProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    assignTechnician,
    removeTechnician
  }
} 