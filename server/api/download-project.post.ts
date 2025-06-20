import { defineEventHandler, readBody, createError, setHeader } from 'h3'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import JSZip from 'jszip'

// Configuración correcta de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDq60RU9a1IQw3trAbtNBpRimbzdDekUm0",
    authDomain: "electrodoc-70bd3.firebaseapp.com",
    projectId: "electrodoc-70bd3",
    storageBucket: "electrodoc-70bd3.firebasestorage.app",
    messagingSenderId: "750310764291",
    appId: "1:750310764291:web:66dd9a5850ac56ec0fc336",
    measurementId: "G-FH7Q8MYLTP"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default defineEventHandler(async (event) => {
    try {
        const { projectId } = await readBody(event)

        if (!projectId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID del proyecto es requerido'
            })
        }

        // Obtener información del proyecto
        const projectRef = doc(db, 'projects', projectId)
        const projectSnap = await getDoc(projectRef)

        if (!projectSnap.exists()) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Proyecto no encontrado'
            })
        }

        const projectData = projectSnap.data()

        // Crear archivo ZIP
        const zip = new JSZip()

        // Agregar información del proyecto como archivo de texto
        const projectInfo = `Información del Proyecto
=====================
Nombre: ${projectData.nombre}
Cliente: ${projectData.cliente}
Descripción: ${projectData.descripcion || 'Sin descripción'}
Estado: ${projectData.estado}
Fecha de Inicio: ${projectData.fechaInicio?.toDate?.() || projectData.fechaInicio}
Fecha de Fin: ${projectData.fechaVencimiento?.toDate?.() || projectData.fechaVencimiento}
Ubicación: ${projectData.ubicacion || 'No especificada'}
Fecha de Creación: ${projectData.createdAt?.toDate?.() || projectData.createdAt}

Documentos del Proyecto
=======================
`

        zip.file('00-INFO_PROYECTO.txt', projectInfo)

        // Obtener carpetas del proyecto
        const foldersRef = collection(db, 'projects', projectId, 'folders')
        const foldersSnapshot = await getDocs(foldersRef)

        let totalDocuments = 0

        // Procesar cada carpeta
        for (const folderDoc of foldersSnapshot.docs) {
            const folderData = folderDoc.data()
            const folderName = folderData.nombre

            // Crear carpeta en el ZIP
            const folder = zip.folder(folderName)

            if (folder && folderData.url && Array.isArray(folderData.url)) {
                // Procesar documentos en la carpeta
                for (let i = 0; i < folderData.url.length; i++) {
                    const docItem = folderData.url[i]

                    if (typeof docItem === 'object' && docItem.url) {
                        try {
                            // Descargar el archivo desde la URL
                            const response = await fetch(docItem.url)
                            if (response.ok) {
                                const buffer = await response.arrayBuffer()
                                const fileName = docItem.nombre || `documento_${i + 1}`
                                const fileExtension = getFileExtension(docItem.url)
                                const fullFileName = `${fileName}${fileExtension}`

                                folder.file(fullFileName, buffer)
                                totalDocuments++
                            }
                        } catch (error) {
                            console.error(`Error descargando documento: ${docItem.url}`, error)
                            // Crear un archivo de texto con información del documento fallido
                            const errorInfo = `Error al descargar: ${docItem.nombre || 'Documento sin nombre'}
URL: ${docItem.url}
Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
                            folder.file(`ERROR_${docItem.nombre || `documento_${i + 1}`}.txt`, errorInfo)
                        }
                    } else if (typeof docItem === 'string') {
                        try {
                            // Descargar el archivo desde la URL string
                            const response = await fetch(docItem)
                            if (response.ok) {
                                const buffer = await response.arrayBuffer()
                                const fileName = `documento_${i + 1}`
                                const fileExtension = getFileExtension(docItem)
                                const fullFileName = `${fileName}${fileExtension}`

                                folder.file(fullFileName, buffer)
                                totalDocuments++
                            }
                        } catch (error) {
                            console.error(`Error descargando documento: ${docItem}`, error)
                            const errorInfo = `Error al descargar documento
URL: ${docItem}
Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
                            folder.file(`ERROR_documento_${i + 1}.txt`, errorInfo)
                        }
                    }
                }
            }
        }

        // Generar el archivo ZIP
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

        // Configurar headers para descarga
        setHeader(event, 'Content-Type', 'application/zip')
        setHeader(event, 'Content-Disposition', `attachment; filename="${projectData.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.zip"`)
        setHeader(event, 'Content-Length', zipBuffer.length)

        return zipBuffer

    } catch (error) {
        console.error('Error en download-project:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error al generar el archivo ZIP del proyecto'
        })
    }
})

// Función auxiliar para obtener la extensión del archivo
function getFileExtension(url: string): string {
    try {
        const urlObj = new URL(url)
        const pathname = urlObj.pathname
        const lastDotIndex = pathname.lastIndexOf('.')

        if (lastDotIndex !== -1) {
            return pathname.substring(lastDotIndex)
        }

        // Si no hay extensión en la URL, intentar inferir por el tipo de contenido
        if (url.includes('pdf')) return '.pdf'
        if (url.includes('jpg') || url.includes('jpeg')) return '.jpg'
        if (url.includes('png')) return '.png'
        if (url.includes('doc') || url.includes('docx')) return '.docx'
        if (url.includes('xls') || url.includes('xlsx')) return '.xlsx'

        return '.bin'
    } catch {
        return '.bin'
    }
} 