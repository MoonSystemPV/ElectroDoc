import { format } from 'date-fns'
import { ref, computed } from 'vue'
import { useDocumentStore } from '~/stores/documents'
import { useAuthStore } from '~/stores/auth'

export type DocumentType = 'TE1' | 'TE2' | 'plano' | 'informe' | 'foto' | 'certificado'
export type DocumentStatus = 'pendiente' | 'validado' | 'rechazado'

export interface Document {
  id: string
  projectId: string // For API
  proyectoId: string // For Firestore
  tipo: DocumentType
  nombre: string
  url: string
  estado: DocumentStatus
  version: number
  uploadedBy: string
  validatedBy?: string
  validadoPor?: string
  fechaSubida: Date
  fechaValidacion?: Date
  comentarios?: string
  storagePath?: string
}

export function useDocuments() {
  const documentStore = useDocumentStore()
  const authStore = useAuthStore()
  
  // Local state for loading and error handling
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Expose documents store data
  const documents = computed(() => documentStore.documents)
  
  /**
   * Get all documents for a project
   */
  const getProjectDocuments = async (projectId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('Cargando documentos de demostración para:', projectId);
      // Cargar documentos de demostración
      await loadDemoDocuments(projectId);
      return documentStore.currentProjectDocuments;
    } catch (err) {
      console.error('Error fetching project documents:', err)
      error.value = 'Error al cargar los documentos del proyecto'
      
      // Si hay error, cargar documentos de demostración
      await loadDemoDocuments(projectId);
      return documentStore.currentProjectDocuments;
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Carga documentos de demostración cuando no se pueden obtener de Firestore
   */
  const loadDemoDocuments = async (projectId: string) => {
    console.log('Cargando documentos de demostración para proyecto:', projectId);
    
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const demoDocuments: Document[] = [
      // Documentos para proyecto 1
      ...(projectId === 'proj-1' ? [
        {
          id: 'doc-1-1',
          projectId: 'proj-1',
          proyectoId: 'proj-1',
          tipo: 'TE1',
          nombre: 'TE1 - Declaración instalación eléctrica',
          url: 'https://via.placeholder.com/600x800?text=TE1+Documento',
          estado: 'validado',
          version: 1,
          uploadedBy: authStore.user?.id || 'user-1',
          validatedBy: 'supervisor-1',
          validadoPor: 'supervisor-1',
          fechaSubida: lastMonth,
          fechaValidacion: lastWeek,
          comentarios: 'Documento completo y correcto',
          storagePath: '/demo/document1.pdf'
        },
        {
          id: 'doc-1-2',
          projectId: 'proj-1',
          proyectoId: 'proj-1',
          tipo: 'plano',
          nombre: 'Plano eléctrico - Planta baja',
          url: 'https://via.placeholder.com/1200x800?text=Plano+Electrico',
          estado: 'pendiente',
          version: 1,
          uploadedBy: authStore.user?.id || 'user-1',
          fechaSubida: now,
          storagePath: '/demo/plano1.pdf'
        },
        {
          id: 'doc-1-3',
          projectId: 'proj-1',
          proyectoId: 'proj-1',
          tipo: 'foto',
          nombre: 'Foto instalación transformador',
          url: 'https://via.placeholder.com/800x600?text=Foto+Transformador',
          estado: 'pendiente',
          version: 1,
          uploadedBy: authStore.user?.id || 'user-1',
          fechaSubida: now,
          storagePath: '/demo/foto1.jpg'
        }
      ] : []),
      
      // Documentos para proyecto 2
      ...(projectId === 'proj-2' ? [
        {
          id: 'doc-2-1',
          projectId: 'proj-2',
          proyectoId: 'proj-2',
          tipo: 'informe',
          nombre: 'Informe mantenimiento línea 220kV',
          url: 'https://via.placeholder.com/600x800?text=Informe+Mantenimiento',
          estado: 'validado',
          version: 2,
          uploadedBy: authStore.user?.id || 'user-1',
          validatedBy: 'supervisor-1',
          validadoPor: 'supervisor-1',
          fechaSubida: lastMonth,
          fechaValidacion: lastWeek,
          comentarios: 'Documento revisado y aprobado',
          storagePath: '/demo/informe1.pdf'
        },
        {
          id: 'doc-2-2',
          projectId: 'proj-2',
          proyectoId: 'proj-2',
          tipo: 'foto',
          nombre: 'Fotos inspección torre 15',
          url: 'https://via.placeholder.com/800x600?text=Fotos+Torre',
          estado: 'rechazado',
          version: 1,
          uploadedBy: authStore.user?.id || 'user-1',
          validatedBy: 'supervisor-1',
          validadoPor: 'supervisor-1',
          fechaSubida: lastMonth,
          fechaValidacion: lastWeek,
          comentarios: 'Fotos con baja resolución, favor volver a tomar',
          storagePath: '/demo/fotos2.zip'
        }
      ] : []),
      
      // Documentos para proyecto 3
      ...(projectId === 'proj-3' ? [
        {
          id: 'doc-3-1',
          projectId: 'proj-3',
          proyectoId: 'proj-3',
          tipo: 'TE2',
          nombre: 'TE2 - Declaración instalación solar',
          url: 'https://via.placeholder.com/600x800?text=TE2+Solar',
          estado: 'validado',
          version: 1,
          uploadedBy: authStore.user?.id || 'user-1',
          validatedBy: 'supervisor-1',
          validadoPor: 'supervisor-1',
          fechaSubida: lastMonth,
          fechaValidacion: lastWeek,
          comentarios: 'Aprobado',
          storagePath: '/demo/te2-solar.pdf'
        },
        {
          id: 'doc-3-2',
          projectId: 'proj-3',
          proyectoId: 'proj-3',
          tipo: 'plano',
          nombre: 'Plano distribución paneles',
          url: 'https://via.placeholder.com/1200x800?text=Plano+Paneles',
          estado: 'validado',
          version: 3,
          uploadedBy: authStore.user?.id || 'user-1',
          validatedBy: 'supervisor-1',
          validadoPor: 'supervisor-1',
          fechaSubida: lastMonth,
          fechaValidacion: lastWeek,
          comentarios: 'Aprobado después de correcciones',
          storagePath: '/demo/plano-paneles.pdf'
        },
        {
          id: 'doc-3-3',
          projectId: 'proj-3',
          proyectoId: 'proj-3',
          tipo: 'certificado',
          nombre: 'Certificado SEC paneles solares',
          url: 'https://via.placeholder.com/600x800?text=Certificado+SEC',
          estado: 'validado',
          version: 1,
          uploadedBy: authStore.user?.id || 'user-1',
          validatedBy: 'supervisor-1',
          validadoPor: 'supervisor-1',
          fechaSubida: lastMonth,
          fechaValidacion: lastWeek,
          comentarios: 'Certificado verificado',
          storagePath: '/demo/certificado-sec.pdf'
        }
      ] : []),
      
      // Documentos para proyecto 4
      ...(projectId === 'proj-4' ? [
        {
          id: 'doc-4-1',
          projectId: 'proj-4',
          proyectoId: 'proj-4',
          tipo: 'plano',
          nombre: 'Plano modernización planta',
          url: 'https://via.placeholder.com/1200x800?text=Plano+Modernizacion',
          estado: 'pendiente',
          version: 1,
          uploadedBy: authStore.user?.id || 'user-1',
          fechaSubida: lastMonth,
          storagePath: '/demo/plano-modernizacion.pdf'
        }
      ] : [])
    ];
    
    // Actualizar store con documentos demo
    documentStore.setDocuments(demoDocuments);
    documentStore.setCurrentProjectDocuments(projectId);
    
    return demoDocuments;
  }
  
  /**
   * Get a document by ID
   */
  const getDocument = async (documentId: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Buscar en los documentos cargados actualmente
      let document = documentStore.documents.find(d => d.id === documentId);
      
      if (!document) {
        // Si no lo encontramos, cargar todos los documentos de demostración para cada proyecto
        await Promise.all(['proj-1', 'proj-2', 'proj-3', 'proj-4'].map(
          projectId => loadDemoDocuments(projectId)
        ));
        
        // Buscar de nuevo
        document = documentStore.documents.find(d => d.id === documentId);
      }
      
      if (document) {
        return document;
      } else {
        error.value = 'Documento no encontrado';
        return null;
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      error.value = 'Error al cargar el documento';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Upload a document to a project
   */
  const uploadDocument = async (
    projectId: string,
    tipo: DocumentType,
    file: File,
    customName?: string
  ) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log('Simulando subida de documento:', {
        projectId, 
        tipo, 
        fileName: file.name,
        customName
      });
      
      // Cargar documentos existentes del proyecto
      await loadDemoDocuments(projectId);
      
      // Crear un nuevo ID único
      const newId = `doc-${projectId}-${Date.now()}`;
      
      // Determinar el nombre del documento
      const docName = customName || file.name;
      
      // Generar una URL aleatoria de placeholder según el tipo
      let placeholderUrl;
      switch (tipo) {
        case 'plano':
          placeholderUrl = 'https://via.placeholder.com/1200x800?text=Plano+Nuevo';
          break;
        case 'foto':
          placeholderUrl = 'https://via.placeholder.com/800x600?text=Foto+Nueva';
          break;
        case 'TE1':
        case 'TE2':
          placeholderUrl = `https://via.placeholder.com/600x800?text=${tipo}+Nuevo`;
          break;
        default:
          placeholderUrl = `https://via.placeholder.com/600x800?text=${tipo}+Nuevo`;
      }
      
      // Crear el nuevo documento
      const newDocument: Document = {
        id: newId,
        projectId: projectId,
        proyectoId: projectId,
        tipo: tipo,
        nombre: docName,
        url: placeholderUrl,
        estado: 'pendiente',
        version: 1,
        uploadedBy: authStore.user?.id || 'user-demo',
        fechaSubida: new Date(),
        storagePath: `/demo/${newId}.${file.name.split('.').pop()}`
      };
      
      // Añadir el nuevo documento a los existentes
      const updatedDocuments = [...documentStore.documents, newDocument];
      documentStore.setDocuments(updatedDocuments);
      documentStore.setCurrentProjectDocuments(projectId);
      
      return newDocument;
    } catch (err) {
      console.error('Error uploading document:', err);
      error.value = 'Error al subir el documento';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Validate a document
   */
  const validateDocument = async (documentId: string, comments?: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Obtener el documento
      const document = await getDocument(documentId);
      
      if (!document) {
        error.value = 'Documento no encontrado';
        return false;
      }
      
      // Actualizar el documento localmente
      const updatedDocument = {
        ...document,
        estado: 'validado' as DocumentStatus,
        validatedBy: authStore.user?.id,
        validadoPor: authStore.user?.id,
        fechaValidacion: new Date(),
        comentarios: comments || 'Documento validado'
      };
      
      // Actualizar en el store
      const docIndex = documentStore.documents.findIndex(d => d.id === documentId);
      if (docIndex !== -1) {
        const updatedDocuments = [...documentStore.documents];
        updatedDocuments[docIndex] = updatedDocument;
        documentStore.setDocuments(updatedDocuments);
        documentStore.setCurrentProjectDocuments(document.projectId);
      }
      
      return true;
    } catch (err) {
      console.error('Error validating document:', err);
      error.value = 'Error al validar el documento';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Reject a document
   */
  const rejectDocument = async (documentId: string, comments?: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Obtener el documento
      const document = await getDocument(documentId);
      
      if (!document) {
        error.value = 'Documento no encontrado';
        return false;
      }
      
      // Actualizar el documento localmente
      const updatedDocument = {
        ...document,
        estado: 'rechazado' as DocumentStatus,
        validatedBy: authStore.user?.id,
        validadoPor: authStore.user?.id,
        fechaValidacion: new Date(),
        comentarios: comments || 'Documento rechazado'
      };
      
      // Actualizar en el store
      const docIndex = documentStore.documents.findIndex(d => d.id === documentId);
      if (docIndex !== -1) {
        const updatedDocuments = [...documentStore.documents];
        updatedDocuments[docIndex] = updatedDocument;
        documentStore.setDocuments(updatedDocuments);
        documentStore.setCurrentProjectDocuments(document.projectId);
      }
      
      return true;
    } catch (err) {
      console.error('Error rejecting document:', err);
      error.value = 'Error al rechazar el documento';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Delete a document
   */
  const deleteDocument = async (documentId: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Obtener el documento
      const document = await getDocument(documentId);
      
      if (!document) {
        error.value = 'Documento no encontrado';
        return false;
      }
      
      // Eliminar del store
      const updatedDocuments = documentStore.documents.filter(d => d.id !== documentId);
      documentStore.setDocuments(updatedDocuments);
      documentStore.setCurrentProjectDocuments(document.projectId);
      
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      error.value = 'Error al eliminar el documento';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Get documents uploaded by a specific user
   */
  const getDocumentsByUser = async (userId: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Cargar todos los documentos de demostración para cada proyecto
      await Promise.all(['proj-1', 'proj-2', 'proj-3', 'proj-4'].map(
        projectId => loadDemoDocuments(projectId)
      ));
      
      // Filtrar documentos por usuario
      const userDocuments = documentStore.documents.filter(
        doc => doc.uploadedBy === userId
      );
      
      return userDocuments;
    } catch (err) {
      console.error('Error fetching user documents:', err);
      error.value = 'Error al cargar los documentos del usuario';
      return [];
    } finally {
      isLoading.value = false;
    }
  }
  
  return {
    documents,
    isLoading,
    error,
    getProjectDocuments,
    loadDemoDocuments,
    getDocument,
    uploadDocument,
    validateDocument,
    rejectDocument,
    deleteDocument,
    getDocumentsByUser
  }
} 