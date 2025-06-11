import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document, DocumentStatus, DocumentType } from '~/composables/useDocuments'

export const useDocumentStore = defineStore('documents', {
  state: () => ({
    documents: [] as Document[],
    currentProjectId: null as string | null,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    currentProjectDocuments(): Document[] {
      if (!this.currentProjectId) return []
      return this.documents.filter(doc => doc.projectId === this.currentProjectId)
    },

    pendingDocuments(): Document[] {
      return this.documents.filter(doc => doc.estado === 'pendiente')
    },

    validatedDocuments(): Document[] {
      return this.documents.filter(doc => doc.estado === 'validado')
    },

    rejectedDocuments(): Document[] {
      return this.documents.filter(doc => doc.estado === 'rechazado')
    },

    documentsByType() {
      const result: Record<string, Document[]> = {}

      this.documents.forEach(doc => {
        if (!result[doc.tipo]) {
          result[doc.tipo] = []
        }

        result[doc.tipo].push(doc)
      })

      return result
    }
  },

  actions: {
    setDocuments(documents: Document[]) {
      this.documents = documents
      console.log('Documentos actualizados en el store:', documents.length)
    },

    addDocument(document: Document) {
      this.documents.push(document)
    },

    updateDocument(updatedDocument: Document) {
      const index = this.documents.findIndex(d => d.id === updatedDocument.id)
      if (index !== -1) {
        this.documents[index] = updatedDocument
      }
    },

    removeDocument(id: string) {
      this.documents = this.documents.filter(d => d.id !== id)
    },

    setCurrentProjectDocuments(projectId: string) {
      this.currentProjectId = projectId
      console.log('Proyecto actual establecido en el store:', projectId)
    },

    resetState() {
      this.documents = []
      this.currentProjectId = null
      this.isLoading = false
      this.error = null
    },

    validateDocument(id: string, validatorId: string, comments?: string, estado?: DocumentStatus) {
      const doc = this.documents.find(d => d.id === id)
      if (doc) {
        this.updateDocument({
          ...doc,
          estado: estado || 'validado',
          validadoPor: validatorId,
          validatedBy: validatorId,
          fechaValidacion: new Date(),
          comentarios: comments
        })
      }
    },

    rejectDocument(id: string, validatorId: string, comments?: string) {
      const doc = this.documents.find(d => d.id === id)
      if (doc) {
        this.updateDocument({
          ...doc,
          estado: 'rechazado',
          validadoPor: validatorId,
          validatedBy: validatorId,
          fechaValidacion: new Date(),
          comentarios: comments
        })
      }
    },

    setLoading(status: boolean) {
      this.isLoading = status
    },

    setError(message: string | null) {
      this.error = message
    }
  }
}) 