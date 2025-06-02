import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document, DocumentStatus, DocumentType } from '~/composables/useDocuments'

export const useDocumentStore = defineStore('documents', () => {
  // State
  const documents = ref<Document[]>([])
  const currentProjectDocuments = ref<Document[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const pendingDocuments = computed(() => {
    return currentProjectDocuments.value.filter(doc => doc.estado === 'pendiente')
  })
  
  const validatedDocuments = computed(() => {
    return currentProjectDocuments.value.filter(doc => doc.estado === 'validado')
  })
  
  const rejectedDocuments = computed(() => {
    return currentProjectDocuments.value.filter(doc => doc.estado === 'rechazado')
  })
  
  const documentsByType = computed(() => {
    const result: Record<string, Document[]> = {}
    
    currentProjectDocuments.value.forEach(doc => {
      if (!result[doc.tipo]) {
        result[doc.tipo] = []
      }
      
      result[doc.tipo].push(doc)
    })
    
    return result
  })
  
  // Actions
  function setDocuments(documentList: Document[]) {
    documents.value = documentList
  }
  
  function setCurrentProjectDocuments(projectId: string) {
    currentProjectDocuments.value = documents.value.filter(doc => doc.proyectoId === projectId || doc.projectId === projectId)
  }
  
  function addDocument(document: Document) {
    documents.value.push(document)
    
    if (currentProjectDocuments.value.length > 0 && 
        (document.proyectoId === currentProjectDocuments.value[0]?.proyectoId || 
         document.projectId === currentProjectDocuments.value[0]?.projectId)) {
      currentProjectDocuments.value.push(document)
    }
  }
  
  function updateDocument(id: string, data: Partial<Document>) {
    // Update in main documents list
    const index = documents.value.findIndex(d => d.id === id)
    if (index !== -1) {
      documents.value[index] = { ...documents.value[index], ...data }
    }
    
    // Update in current project documents if it exists there
    const currentIndex = currentProjectDocuments.value.findIndex(d => d.id === id)
    if (currentIndex !== -1) {
      currentProjectDocuments.value[currentIndex] = { ...currentProjectDocuments.value[currentIndex], ...data }
    }
  }
  
  function removeDocument(id: string) {
    documents.value = documents.value.filter(d => d.id !== id)
    currentProjectDocuments.value = currentProjectDocuments.value.filter(d => d.id !== id)
  }
  
  function validateDocument(id: string, validatorId: string, comments?: string) {
    const doc = documents.value.find(d => d.id === id)
    if (doc) {
      updateDocument(id, {
        estado: 'validado',
        validadoPor: validatorId,
        validatedBy: validatorId,
        fechaValidacion: new Date(),
        comentarios: comments
      })
    }
  }
  
  function rejectDocument(id: string, validatorId: string, comments?: string) {
    const doc = documents.value.find(d => d.id === id)
    if (doc) {
      updateDocument(id, {
        estado: 'rechazado',
        validadoPor: validatorId,
        validatedBy: validatorId,
        fechaValidacion: new Date(),
        comentarios: comments
      })
    }
  }
  
  function setLoading(status: boolean) {
    isLoading.value = status
  }
  
  function setError(message: string | null) {
    error.value = message
  }
  
  function resetState() {
    documents.value = []
    currentProjectDocuments.value = []
    isLoading.value = false
    error.value = null
  }
  
  return {
    // State
    documents,
    currentProjectDocuments,
    isLoading,
    error,
    
    // Getters
    pendingDocuments,
    validatedDocuments,
    rejectedDocuments,
    documentsByType,
    
    // Actions
    setDocuments,
    setCurrentProjectDocuments,
    addDocument,
    updateDocument,
    removeDocument,
    validateDocument,
    rejectDocument,
    setLoading,
    setError,
    resetState
  }
}) 