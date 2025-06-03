const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// Cambia el nombre si tu archivo de credenciales tiene otro nombre
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://electrodoc-70bd3.firebaseio.com"
});

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para crear usuario
app.post('/create-user', async (req, res) => {
  const { email, password, nombre, role } = req.body;
  if (!email || !password || !nombre || !role) {
    return res.status(400).json({ success: false, error: 'Faltan datos' });
  }
  try {
    // 1. Crear usuario en Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false
    });

    // 2. Crear documento en Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      nombre,
      role,
      fechaCreacion: new Date(),
      activo: true
    });

    res.status(200).json({ success: true, uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Endpoint para eliminar usuario completamente
app.post('/delete-user', async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ success: false, error: 'Falta el UID' });
  }
  try {
    // 1. Eliminar de Authentication
    await admin.auth().deleteUser(uid);

    // 2. Eliminar de Firestore
    await admin.firestore().collection('users').doc(uid).delete();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
});