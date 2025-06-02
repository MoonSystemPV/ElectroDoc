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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import type { FirebaseStorage } from 'firebase/storage'
import { format } from 'date-fns'
import { ref, computed } from 'vue'
import { useDocumentStore } from '~/stores/documents'
import { useAuthStore } from '~/stores/auth'
import { useNuxtApp } from '#app'

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
  const { $firebase } = useNuxtApp()
  
  // Access Firebase services with proper typing
  const db = $firebase.firestore as Firestore
  const storage = $firebase.storage as FirebaseStorage
  
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
      // Query documents for the project
      const q = query(
        collection(db, 'documentos'),
        where('proyectoId', '==', projectId)
      )
      
      const querySnapshot = await getDocs(q)
      const documentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          projectId: data.proyectoId, // Map proyectoId to projectId for API consistency
          fechaSubida: data.fechaSubida?.toDate() || new Date(),
          fechaValidacion: data.fechaValidacion?.toDate(),
          tipo: data.tipo as DocumentType,
          estado: data.estado as DocumentStatus,
          version: data.version || 1
        } as Document;
      });
      
      // Update store
      documentStore.setDocuments(documentsData);
      documentStore.setCurrentProjectDocuments(projectId);
      
      return documentsData;
    } catch (err) {
      console.error('Error fetching project documents:', err)
      error.value = 'Error al cargar los documentos del proyecto'
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Get a single document by ID
   */
  const getDocument = async (documentId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'documentos', documentId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const document = {
          id: docSnap.id,
          ...data,
          projectId: data.proyectoId, // Map proyectoId to projectId for API consistency
          fechaSubida: data.fechaSubida?.toDate() || new Date(),
          fechaValidacion: data.fechaValidacion?.toDate(),
          tipo: data.tipo as DocumentType,
          estado: data.estado as DocumentStatus,
          version: data.version || 1
        } as Document;
        
        return document;
      } else {
        error.value = 'Documento no encontrado'
        return null
      }
    } catch (err) {
      console.error('Error fetching document:', err)
      error.value = 'Error al cargar el documento'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Upload a new document
   */
  const uploadDocument = async (
    projectId: string,
    tipo: DocumentType,
    file: File,
    customName?: string
  ) => {
    if (!authStore.user) {
      error.value = 'Usuario no autenticado'
      return null
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Create a reference to the file in Firebase Storage
      const fileName = customName || file.name
      const filePath = `projects/${projectId}/${Date.now()}_${file.name}`
      const fileRef = storageRef(storage, filePath)
      
      // Upload the file
      await uploadBytesResumable(fileRef, file)
      
      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef)
      
      // Create the document in Firestore
      const docData = {
        nombre: fileName,
        tipo,
        estado: 'pendiente' as DocumentStatus,
        proyectoId: projectId,
        url: downloadURL,
        storagePath: filePath,
        fechaSubida: serverTimestamp(),
        uploadedBy: authStore.user.id,
        version: 1
      }
      
      const docRef = await addDoc(collection(db, 'documentos'), docData)
      
      // Get the document with the ID
      const newDocument: Document = {
        id: docRef.id,
        ...docData,
        projectId, // Add projectId for API consistency
        fechaSubida: new Date()
      }
      
      // Update store
      documentStore.addDocument(newDocument)
      
      // Add to activity log
      await addDoc(collection(db, 'actividades'), {
        userId: authStore.user.id,
        proyectoId: projectId,
        timestamp: serverTimestamp(),
        action: 'upload',
        details: `Subió documento: ${fileName}`,
        targetId: docRef.id,
        targetType: 'documento'
      })
      
      return newDocument
    } catch (err) {
      console.error('Error uploading document:', err)
      error.value = 'Error al subir el documento'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Validate a document
   */
  const validateDocument = async (documentId: string, comments?: string) => {
    if (!authStore.user) {
      error.value = 'Usuario no autenticado'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'documentos', documentId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        error.value = 'Documento no encontrado'
        return false
      }
      
      const document = docSnap.data()
      
      // Update document
      await updateDoc(docRef, {
        estado: 'validado',
        validadoPor: authStore.user.id,
        fechaValidacion: serverTimestamp(),
        comentarios: comments || null
      })
      
      // Update store
      documentStore.validateDocument(documentId, authStore.user.id, comments)
      
      // Add to activity log
      await addDoc(collection(db, 'actividades'), {
        userId: authStore.user.id,
        proyectoId: document.proyectoId,
        timestamp: serverTimestamp(),
        action: 'validate_document',
        details: `Validó documento: ${document.nombre}`,
        targetId: documentId,
        targetType: 'documento'
      })
      
      return true
    } catch (err) {
      console.error('Error validating document:', err)
      error.value = 'Error al validar el documento'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Reject a document
   */
  const rejectDocument = async (documentId: string, comments?: string) => {
    if (!authStore.user) {
      error.value = 'Usuario no autenticado'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'documentos', documentId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        error.value = 'Documento no encontrado'
        return false
      }
      
      const document = docSnap.data()
      
      // Update document
      await updateDoc(docRef, {
        estado: 'rechazado',
        validadoPor: authStore.user.id,
        fechaValidacion: serverTimestamp(),
        comentarios: comments || null
      })
      
      // Update store
      documentStore.rejectDocument(documentId, authStore.user.id, comments)
      
      // Add to activity log
      await addDoc(collection(db, 'actividades'), {
        userId: authStore.user.id,
        proyectoId: document.proyectoId,
        timestamp: serverTimestamp(),
        action: 'reject_document',
        details: `Rechazó documento: ${document.nombre}`,
        targetId: documentId,
        targetType: 'documento'
      })
      
      return true
    } catch (err) {
      console.error('Error rejecting document:', err)
      error.value = 'Error al rechazar el documento'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Delete a document
   */
  const deleteDocument = async (documentId: string) => {
    if (!authStore.user) {
      error.value = 'Usuario no autenticado'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const docRef = doc(db, 'documentos', documentId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        error.value = 'Documento no encontrado'
        return false
      }
      
      const document = docSnap.data()
      
      // Delete from Storage
      if (document.storagePath) {
        const fileRef = storageRef(storage, document.storagePath)
        await deleteObject(fileRef)
      }
      
      // Delete from Firestore
      await deleteDoc(docRef)
      
      // Update store
      documentStore.removeDocument(documentId)
      
      // Add to activity log
      await addDoc(collection(db, 'actividades'), {
        userId: authStore.user.id,
        proyectoId: document.proyectoId,
        timestamp: serverTimestamp(),
        action: 'delete_document',
        details: `Eliminó documento: ${document.nombre}`,
        targetId: documentId,
        targetType: 'documento'
      })
      
      return true
    } catch (err) {
      console.error('Error deleting document:', err)
      error.value = 'Error al eliminar el documento'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Method to get documents by user (needed for the documents index page)
  const getDocumentsByUser = async (userId: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // First get all projects where the user is assigned
      const q = query(
        collection(db, 'projects'),
        where('tecnicosAsignados', 'array-contains', userId)
      );
      
      const projectsSnapshot = await getDocs(q);
      const projectIds = projectsSnapshot.docs.map(doc => doc.id);
      
      // Clear previous documents
      documentStore.resetState();
      
      // Get documents for each project
      for (const projectId of projectIds) {
        await getProjectDocuments(projectId);
      }
      
      return documentStore.documents;
    } catch (err) {
      console.error('Error fetching user documents:', err);
      error.value = 'Error al cargar los documentos del usuario';
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    isLoading,
    error,
    documents,
    getProjectDocuments,
    getDocument,
    uploadDocument,
    validateDocument,
    rejectDocument,
    deleteDocument,
    getDocumentsByUser
  }
} 