import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useProjectStore } from '~/stores/projects'

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

export const useProjects = () => {
  const { user } = useAuth()
  const projectStore = useProjectStore()
  
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
      console.log('Usando datos de demostración directamente')
      // Cargar proyectos de demostración en lugar de intentar usar Firestore
      await loadDemoProjects();
      return projectStore.projects;
    } catch (err) {
      console.error('Error fetching projects:', err)
      error.value = 'Error al cargar los proyectos'
      
      // Si hay error, cargar proyectos de demostración
      await loadDemoProjects();
      return projectStore.projects;
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
   * Get a project by ID
   */
  const getProjectById = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Cargar todos los proyectos demo
      await loadDemoProjects();
      
      // Buscar el proyecto por ID
      const project = projectStore.projects.find(p => p.id === id);
      
      if (project) {
        return project;
      } else {
        error.value = 'Proyecto no encontrado';
        return null;
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      error.value = 'Error al cargar el proyecto';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Create a new project
   */
  const createProject = async (projectData: Partial<Project>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Generar un ID único para el nuevo proyecto
      const newId = 'proj-' + Date.now();
      
      // Crear el objeto del nuevo proyecto
      const newProject: Project = {
        id: newId,
        nombre: projectData.nombre || 'Nuevo Proyecto',
        cliente: projectData.cliente || 'Cliente',
        descripcion: projectData.descripcion || '',
        fechaInicio: projectData.fechaInicio || new Date(),
        fechaVencimiento: projectData.fechaVencimiento || null,
        ubicacion: projectData.ubicacion || '',
        estado: projectData.estado || 'activo',
        tecnicosAsignados: projectData.tecnicosAsignados || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Cargar proyectos existentes
      await loadDemoProjects();
      
      // Añadir el nuevo proyecto
      const updatedProjects = [...projectStore.projects, newProject];
      projectStore.setProjects(updatedProjects);
      
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      error.value = 'Error al crear el proyecto';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Update an existing project
   */
  const updateProject = async (id: string, projectData: Partial<Project>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Cargar proyectos existentes
      await loadDemoProjects();
      
      // Buscar el proyecto a actualizar
      const projectIndex = projectStore.projects.findIndex(p => p.id === id);
      
      if (projectIndex === -1) {
        error.value = 'Proyecto no encontrado';
        return null;
      }
      
      // Actualizar el proyecto
      const updatedProject = {
        ...projectStore.projects[projectIndex],
        ...projectData,
        updatedAt: new Date()
      };
      
      // Actualizar la lista de proyectos
      const updatedProjects = [...projectStore.projects];
      updatedProjects[projectIndex] = updatedProject;
      projectStore.setProjects(updatedProjects);
      
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      error.value = 'Error al actualizar el proyecto';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Delete a project
   */
  const deleteProject = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Cargar proyectos existentes
      await loadDemoProjects();
      
      // Filtrar el proyecto a eliminar
      const updatedProjects = projectStore.projects.filter(p => p.id !== id);
      
      // Actualizar el store
      projectStore.setProjects(updatedProjects);
      
      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      error.value = 'Error al eliminar el proyecto';
      return false;
    } finally {
      isLoading.value = false;
    }
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