import { format } from 'date-fns'
import { ref, computed } from 'vue'
import { useDocumentStore } from '~/stores/documents'
import { useAuthStore } from '~/stores/auth'
import { collection, addDoc, getDocs, deleteDoc, doc as firestoreDoc, serverTimestamp, getFirestore, updateDoc, getDoc } from 'firebase/firestore'
import { cloudinaryConfig, getCloudinarySignature } from '~/utils/cloudinary'

export type DocumentType = 'TE1' | 'TE2' | 'plano' | 'informe' | 'certificado' | 'foto'
export type DocumentStatus = 'pendiente' | 'validado' | 'rechazado' | 'comentado por supervisor'

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
  const db = getFirestore()

  // Local state for loading and error handling
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Expose documents store data
  const documents = computed(() => documentStore.documents)

  /**
   * Normaliza texto para comparación flexible (sin tildes, minúsculas, guiones, etc.)
   * (No elimina la 's' al final de cada palabra)
   */
  function normalizeText(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[_\-]/g, ' ')           // guion bajo y guion a espacio
      .replace(/[^a-z0-9 ]/g, '')        // quitar otros caracteres especiales
      .replace(/\s+/g, ' ')             // espacios múltiples a uno solo
      .trim();
  }

  /**
   * Normaliza texto y elimina la 's' al final de cada palabra (para folders)
   */
  function normalizeTextSingular(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[_\-]/g, ' ')           // guion bajo y guion a espacio
      .replace(/[^a-z0-9 ]/g, '')        // quitar otros caracteres especiales
      .replace(/\s+/g, ' ')             // espacios múltiples a uno solo
      .replace(/\b([a-z0-9]+)s\b/g, '$1') // eliminar 's' al final de cada palabra
      .trim();
  }

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
   * Sube un archivo a Cloudinary y retorna la respuesta
   */
  async function uploadToCloudinary(file: File) {
    const cloudName = 'drrmfctuo'; // Tu cloud name
    const uploadPreset = 'Archivos-de-proyectos'; // Cambiado a preset firmado

    // Detecta el tipo de archivo
    const isImage = file.type.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Error al subir a Cloudinary');
    return await response.json();
  }

  /**
   * Busca coincidencias de nombres de proyectos ignorando mayúsculas, minúsculas y tildes
   */
  const findMatchingProject = async (fileName: string) => {
    const db = getFirestore();
    const projectsRef = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);

    const normalizedFileName = normalizeText(fileName);

    for (const doc of projectsSnapshot.docs) {
      const projectData = doc.data();
      const normalizedProjectName = normalizeText(projectData.nombre);

      if (normalizedFileName.includes(normalizedProjectName) ||
        normalizedProjectName.includes(normalizedFileName)) {
        return { id: doc.id, nombre: projectData.nombre };
      }
    }

    return null;
  }

  /**
   * Busca coincidencia de folder en la subcolección 'folders' de un proyecto
   * Retorna { folder: {id, nombre}, folders: [{id, nombre}] }
   */
  const findMatchingFolder = async (projectId: string, fileName: string) => {
    const db = getFirestore();
    const foldersRef = collection(db, 'projects', projectId, 'folders');
    const foldersSnapshot = await getDocs(foldersRef);
    const normalizedFileName = normalizeTextSingular(fileName);
    let matchingFolder = null;
    const folders = [];
    for (const doc of foldersSnapshot.docs) {
      const folderData = doc.data();
      folders.push({ id: doc.id, nombre: folderData.nombre });
      const normalizedFolderName = normalizeTextSingular(folderData.nombre);
      if (
        normalizedFileName.includes(normalizedFolderName) ||
        normalizedFolderName.includes(normalizedFileName)
      ) {
        matchingFolder = { id: doc.id, nombre: folderData.nombre };
      }
    }
    return { folder: matchingFolder, folders };
  };

  /**
   * Guarda la URL en el folder indicado (por id) en la subcolección 'folders' del proyecto
   */
  const addUrlToFolder = async (projectId: string, folderId: string, documentObj: any) => {
    const db = getFirestore();
    const folderRef = firestoreDoc(db, 'projects', projectId, 'folders', folderId);
    const folderSnap = await getDoc(folderRef);
    if (folderSnap.exists()) {
      const folderData = folderSnap.data();
      const urls = Array.isArray(folderData.url) ? folderData.url : [];
      urls.push(documentObj);
      await updateDoc(folderRef, { url: urls });
    }
  };

  /**
   * Sube un documento a un proyecto (ahora usando Cloudinary)
   */
  const uploadDocument = async (
    projectId: string,
    tipo: DocumentType,
    file: File,
    customName?: string,
    selectedFolderId?: string // Nuevo parámetro opcional
  ) => {
    isLoading.value = true;
    error.value = null;

    try {
      // 1. Buscar coincidencia de proyecto basada en el nombre del archivo
      const matchingProject = await findMatchingProject(file.name);
      if (matchingProject) {
        projectId = matchingProject.id;
      }

      // 2. Buscar coincidencia de folder
      let folderId = selectedFolderId;
      let foldersList = [];
      if (!folderId) {
        const { folder, folders } = await findMatchingFolder(projectId, file.name);
        foldersList = folders;
        if (folder) {
          folderId = folder.id;
        }
      }

      // 3. Si no hay folderId, retornar la lista de folders para el frontend (NO subir aún)
      if (!folderId) {
        return { needFolderSelection: true, folders: foldersList, file };
      }

      // 4. Subir el archivo a Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file);
      const fileUrl = cloudinaryResult.secure_url;

      // 5. Crear el objeto completo del documento
      const newDocument = {
        projectId: projectId,
        tipo: tipo as DocumentType,
        nombre: customName || cloudinaryResult.original_filename,
        url: fileUrl,
        estado: 'pendiente',
        version: 1,
        uploadedBy: authStore.user?.id || 'user-demo',
        fechaSubida: new Date(cloudinaryResult.created_at),
        storagePath: cloudinaryResult.public_id,
        createdAt: serverTimestamp(), // Solo para la colección global
        folderId: folderId || null,
        comentarios: ''
      };

      // 6. Guardar el objeto en el array url del folder (sin serverTimestamp)
      const folderDocument = { ...newDocument, createdAt: new Date() };
      await addUrlToFolder(projectId, folderId, folderDocument);

      // 7. Guardar el documento en la colección documents (con serverTimestamp)
      await addDoc(collection(db, 'documents'), newDocument);

      return newDocument;
    } catch (err) {
      error.value = 'Error al subir el documento';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Función para obtener documentos desde Firestore
  async function fetchDocumentsFromFirestore() {
    isLoading.value = true;
    console.log('Iniciando carga de documentos desde Firestore...');
    try {
      // Intentar cargar desde Firestore
      const querySnapshot = await getDocs(collection(db, 'documents'));
      console.log('QuerySnapshot obtenido:', querySnapshot);

      const docs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Documento obtenido:', data);
        return {
          id: doc.id,
          projectId: data.projectId || '',
          proyectoId: data.proyectoId || '',
          tipo: data.tipo as DocumentType,
          nombre: data.nombre || '',
          url: data.url || '',
          estado: data.estado as DocumentStatus,
          version: data.version || 1,
          uploadedBy: data.uploadedBy || '',
          validatedBy: data.validatedBy,
          validadoPor: data.validadoPor,
          fechaSubida: data.fechaSubida?.toDate() || new Date(),
          fechaValidacion: data.fechaValidacion?.toDate(),
          comentarios: data.comentarios,
          storagePath: data.storagePath
        } as Document;
      });

      console.log('Documentos procesados:', docs);

      if (docs.length > 0) {
        console.log('Documentos obtenidos de Firestore:', docs);
        documentStore.setDocuments(docs);
        return docs;
      } else {
        documentStore.setDocuments([]); // Vacía el store si no hay docs reales
        return [];
      }
    } catch (err) {
      console.error('Error fetching documents from Firestore:', err);
      error.value = 'Error al cargar documentos desde Firestore';
      documentStore.setDocuments([]); // Vacía el store si hay error
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  // Sincroniza documentos: si la URL de Cloudinary ya no existe, elimina de Firestore
  async function syncCloudinaryDocuments() {
    for (const docu of documentStore.documents) {
      try {
        const res = await fetch(docu.url, { method: 'HEAD' });
        if (!res.ok) {
          // Eliminar de Firestore
          await deleteDoc(firestoreDoc(db, 'documents', docu.id));
        }
      } catch (e) {
        await deleteDoc(firestoreDoc(db, 'documents', docu.id));
      }
    }
    // Refresca la lista después de sincronizar
    await fetchDocumentsFromFirestore();
  }

  /**
   * Validate a document
   */
  const validateDocument = async (documentId: string, comments?: string, customStatus?: DocumentStatus) => {
    isLoading.value = true
    error.value = null

    try {
      // Obtener el documento
      const document = await getDocument(documentId)

      if (!document) {
        error.value = 'Documento no encontrado'
        return false
      }

      // Determinar el estado a usar
      const estado = customStatus || 'validado'

      // Actualizar el documento en Firestore
      await updateDoc(firestoreDoc(db, 'documents', documentId), {
        estado,
        validadoPor: authStore.user?.id,
        validatedBy: authStore.user?.id,
        fechaValidacion: new Date(),
        comentarios: comments || (estado === 'validado' ? 'Documento validado' : comments)
      })

      // Actualizar el store local
      documentStore.validateDocument(documentId, authStore.user?.id || '', comments, estado)

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
    isLoading.value = true
    error.value = null

    try {
      // Obtener el documento
      const document = await getDocument(documentId)

      if (!document) {
        error.value = 'Documento no encontrado'
        return false
      }

      // Actualizar el documento en Firestore
      await updateDoc(firestoreDoc(db, 'documents', documentId), {
        estado: 'rechazado',
        validadoPor: authStore.user?.id,
        validatedBy: authStore.user?.id,
        fechaValidacion: new Date(),
        comentarios: comments || 'Documento rechazado'
      })

      // Actualizar el store local
      documentStore.rejectDocument(documentId, authStore.user?.id || '', comments)

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

  /**
   * Elimina un documento de Cloudinary y Firestore usando el endpoint backend
   */
  const deleteDocument = async (documentId: string) => {
    try {
      // Obtener el documento de Firestore
      const docRef = firestoreDoc(db, 'documents', documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Documento no encontrado');
      }

      const documentData = docSnap.data();
      const publicId = documentData.storagePath;
      if (!publicId) {
        throw new Error('No se encontró el public_id (storagePath) para eliminar en Cloudinary');
      }

      // Llamar al endpoint backend para eliminar de Cloudinary
      const response = await fetch('/api/delete-cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId })
      });
      const result = await response.json();
      console.log('[DEBUG] Respuesta de Cloudinary:', result);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error('Error al eliminar de Cloudinary: ' + (result.result || JSON.stringify(result)));
      }

      // Eliminar del array url del folder correspondiente
      if (documentData.projectId && documentData.folderId) {
        const folderRef = firestoreDoc(db, 'projects', documentData.projectId, 'folders', documentData.folderId);
        const folderSnap = await getDoc(folderRef);
        if (folderSnap.exists()) {
          const folderData = folderSnap.data();
          const urls = Array.isArray(folderData.url) ? folderData.url : [];
          // Filtrar el documento a eliminar por url y nombreDocumento
          const newUrls = urls.filter((item: any) => {
            if (typeof item === 'string') return item !== documentData.url;
            return item.url !== documentData.url;
          });
          await updateDoc(folderRef, { url: newUrls });
        }
      }

      // Eliminar de Firestore
      await deleteDoc(docRef);
      documentStore.removeDocument(documentId);
      return true;
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
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
    getDocumentsByUser,
    fetchDocumentsFromFirestore,
    deleteDocument,
    findMatchingProject,
    findMatchingFolder,
    addUrlToFolder
  }
} 