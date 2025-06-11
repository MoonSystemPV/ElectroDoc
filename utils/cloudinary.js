export const cloudinaryConfig = {
    cloudName: 'drrmfctuo',
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: 'Archivos-de-proyectos'
}

export function getCloudinarySignature(publicId, timestamp) {
    const { apiSecret } = cloudinaryConfig;
    return createHash('sha1')
        .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
        .digest('hex');
} 