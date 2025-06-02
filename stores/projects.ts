import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '~/composables/useProjects'

export const useProjectStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const activeProjects = computed(() => {
    return projects.value.filter(project => project.estado === 'activo')
  })
  
  const completedProjects = computed(() => {
    return projects.value.filter(project => project.estado === 'completado')
  })
  
  const canceledProjects = computed(() => {
    return projects.value.filter(project => project.estado === 'cancelado')
  })
  
  // Actions
  function setProjects(projectList: Project[]) {
    projects.value = projectList
  }
  
  function setCurrentProject(project: Project | null) {
    currentProject.value = project
  }
  
  function addProject(project: Project) {
    projects.value.push(project)
  }
  
  function updateProject(id: string, data: Partial<Project>) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...data }
      
      // Update current project if it's the same
      if (currentProject.value && currentProject.value.id === id) {
        currentProject.value = { ...currentProject.value, ...data }
      }
    }
  }
  
  function removeProject(id: string) {
    projects.value = projects.value.filter(p => p.id !== id)
    
    // Reset current project if it's the same
    if (currentProject.value && currentProject.value.id === id) {
      currentProject.value = null
    }
  }
  
  function setLoading(status: boolean) {
    isLoading.value = status
  }
  
  function setError(message: string | null) {
    error.value = message
  }
  
  function resetState() {
    projects.value = []
    currentProject.value = null
    isLoading.value = false
    error.value = null
  }
  
  return {
    // State
    projects,
    currentProject,
    isLoading,
    error,
    
    // Getters
    activeProjects,
    completedProjects,
    canceledProjects,
    
    // Actions
    setProjects,
    setCurrentProject,
    addProject,
    updateProject,
    removeProject,
    setLoading,
    setError,
    resetState
  }
}) 