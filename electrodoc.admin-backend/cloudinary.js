const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Configura Cloudinary con variables de entorno
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/delete', async (req, res) => {
    const { public_id } = req.body;
    if (!public_id) {
        return res.status(400).json({ error: 'public_id is required' });
    }

    try {
        const result = await cloudinary.uploader.destroy(public_id);
        if (result.result === 'ok' || result.result === 'not found') {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ error: 'Cloudinary deletion failed', result });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router; 