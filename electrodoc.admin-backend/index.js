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

  // Validación de datos
  if (!email || !password || !nombre || !role) {
    return res.status(400).json({
      success: false,
      error: 'Faltan datos requeridos'
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'El formato del correo electrónico no es válido'
    });
  }

  // Validar longitud de contraseña
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'La contraseña debe tener al menos 6 caracteres'
    });
  }

  try {
    // Verificar si el email ya existe
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      if (userRecord) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un usuario con este correo electrónico'
        });
      }
    } catch (error) {
      // Si el error es que no existe el usuario, continuamos
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

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
      activo: true,
      ultimoAcceso: null
    });

    res.status(200).json({
      success: true,
      uid: userRecord.uid,
      message: 'Usuario creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);

    // Manejar errores específicos de Firebase
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este correo electrónico'
      });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        error: 'El correo electrónico no es válido'
      });
    } else if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        error: 'La contraseña es demasiado débil'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear el usuario: ' + error.message
    });
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