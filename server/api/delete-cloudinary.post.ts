import { H3Event, readBody } from 'h3'
import crypto from 'crypto'

export default defineEventHandler(async (event: H3Event) => {
    const body = await readBody(event)
    const { public_id, resource_type } = body

    // Variables de entorno backend (sin NEXT_PUBLIC)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
        console.error('Faltan variables de entorno de Cloudinary')
        return { result: 'error', error: 'Faltan variables de entorno de Cloudinary' }
    }

    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = crypto
        .createHash('sha1')
        .update(`public_id=${public_id}&timestamp=${timestamp}${apiSecret}`)
        .digest('hex')

    const formData = new URLSearchParams()
    formData.append('public_id', public_id)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)


    // Detectar tipo de recurso (image o raw)
    // Si el public_id tiene extensión de imagen usa image, si no usa raw
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const isImage = imageExtensions.some(ext => public_id.toLowerCase().endsWith(ext));
    const resourceType = isImage ? 'image' : 'raw';

    // LOGS DE DEPURACIÓN
    console.log('Intentando eliminar en Cloudinary:', {
        public_id,
        cloudName,
        apiKey,
        timestamp,
        signature,
        resourceType
    })

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
        method: 'POST',
        body: formData

    })

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
            method: 'POST',
            body: formData
        })
        const data = await response.json()
        console.log('Respuesta de Cloudinary:', data)
        if (data.result === 'ok') {
            return { result: 'ok' }
        } else {
            return { result: 'error', error: data.error || data.result }
        }
    } catch (err) {
        console.error('Error al eliminar en Cloudinary:', err)
        return { result: 'error', error: err.message || err }
    }
}) 