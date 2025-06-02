import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '~/composables/useProjects'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    currentProject: null as Project | null,
    isLoading: false,
    error: null as string | null
  }),
  
  getters: {
    getProjectById: (state) => {
      return (id: string) => state.projects.find(project => project.id === id)
    },
    activeProjects() {
      return this.projects.filter(project => project.estado === 'activo')
    },
    completedProjects() {
      return this.projects.filter(project => project.estado === 'completado')
    },
    canceledProjects() {
      return this.projects.filter(project => project.estado === 'cancelado')
    }
  },
  
  actions: {
    setProjects(projects: Project[]) {
      this.projects = projects
      console.log('Proyectos actualizados en el store:', projects.length)
    },
    
    addProject(project: Project) {
      this.projects.push(project)
    },
    
    updateProject(updatedProject: Project) {
      const index = this.projects.findIndex(p => p.id === updatedProject.id)
      if (index !== -1) {
        this.projects[index] = updatedProject
      }
    },
    
    removeProject(id: string) {
      this.projects = this.projects.filter(p => p.id !== id)
    },
    
    setCurrentProject(project: Project | null) {
      this.currentProject = project
    },
    
    setLoading(status: boolean) {
      this.isLoading = status
    },
    
    setError(message: string | null) {
      this.error = message
    },
    
    resetState() {
      this.projects = []
      this.currentProject = null
      this.isLoading = false
      this.error = null
    }
  }
}) 