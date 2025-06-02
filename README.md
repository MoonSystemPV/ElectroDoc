# ElectroDoc 📑⚡

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-42b883.svg)](https://vuejs.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.x-00DC82.svg)](https://nuxtjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38b2ac.svg)](https://tailwindcss.com/)
[![Estado](https://img.shields.io/badge/Estado-Desarrollo-yellow.svg)]()

<div align="center">
  <img src="https://raw.githubusercontent.com/nuxt/nuxt/main/.github/logo.svg" alt="ElectroDoc Logo" width="200"/>
  <h3>Sistema de Gestión Documental para Proyectos Eléctricos</h3>
</div>

## 📋 Índice
- [Vista General](#vista-general)
- [Funcionalidades](#funcionalidades)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Acceso a Cuentas Demo](#acceso-a-cuentas-demo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Capturas de Pantalla](#capturas-de-pantalla)

## 🔍 Vista General

ElectroDoc es una aplicación web moderna para la gestión documental de proyectos eléctricos. Permite a las empresas y profesionales del sector eléctrico almacenar, organizar y validar documentación técnica de manera eficiente, siguiendo normativas específicas del sector.

El sistema incluye gestión de usuarios con diferentes roles (administrador, supervisor, técnico), gestión de proyectos y documentos, y visualización en tiempo real del estado de cada documento.

## ✨ Funcionalidades

- **Autenticación y autorización por roles**
  - Roles de administrador, supervisor y técnico
  - Control de acceso basado en permisos

- **Gestión de Proyectos**
  - Creación y seguimiento de proyectos eléctricos
  - Asignación de técnicos a proyectos
  - Filtrado y búsqueda avanzada

- **Gestión Documental**
  - Subida y almacenamiento de documentos (TE1, TE2, planos, etc.)
  - Versionado de documentos
  - Proceso de validación/rechazo
  - Descarga de documentos

- **Interfaz Moderna y Responsiva**
  - Diseño adaptable a dispositivos móviles y escritorio
  - Interfaz intuitiva con Tailwind CSS

## 🛠️ Requisitos Previos

- [Node.js](https://nodejs.org/) (v16.x o superior)
- [npm](https://www.npmjs.com/) (v8.x o superior)
- [Git](https://git-scm.com/)

## 🚀 Instalación

Sigue estos pasos para instalar y ejecutar ElectroDoc localmente:

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/ElectroDoc.git
cd ElectroDoc

# 2. Instalar dependencias
npm install

# 3. Ejecutar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000) (o el puerto que configure Nuxt).

## 🔑 Acceso a Cuentas Demo

El sistema incluye un usuario administrador predefinido:

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| Administrador | admin@electrosur.com | admin123 | Acceso completo al sistema, incluida la gestión de usuarios |

El administrador puede crear cuentas para:

- **Supervisores**: Pueden gestionar proyectos y validar documentos
- **Técnicos**: Acceso limitado para subir documentos y gestionar sus proyectos asignados

Todas las cuentas creadas por el administrador tendrán una contraseña por defecto: `password123`

## 📁 Estructura del Proyecto

```
ElectroDoc/
├── assets/            # Recursos estáticos (CSS, imágenes)
├── components/        # Componentes Vue reutilizables
│   ├── layout/        # Componentes de layout principal
│   └── ui/            # Componentes de interfaz (botones, tarjetas, etc.)
├── composables/       # Funciones de composición Vue
├── middleware/        # Middleware de Nuxt para autenticación y permisos
├── pages/             # Páginas de la aplicación
├── plugins/           # Plugins de Nuxt
├── public/            # Archivos públicos
├── stores/            # Almacenes Pinia para gestión de estado
└── types/             # Definiciones de tipos TypeScript
```

## 💻 Tecnologías Utilizadas

- **Frontend**:
  - [Vue.js 3](https://vuejs.org/) - Framework progresivo de JavaScript
  - [Nuxt 3](https://nuxtjs.org/) - Framework Vue basado en componentes
  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitario
  - [Pinia](https://pinia.vuejs.org/) - Gestión de estado para Vue
  - [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript

- **Prácticas**:
  - Arquitectura basada en componentes
  - Diseño responsivo
  - Control de acceso basado en roles
  - Gestión de estado centralizada

## 📸 Capturas de Pantalla

### Página de Login
![Página de Login](https://via.placeholder.com/800x450?text=Pantalla+de+Login)

### Dashboard
![Dashboard](https://via.placeholder.com/800x450?text=Dashboard)

### Gestión de Proyectos
![Proyectos](https://via.placeholder.com/800x450?text=Proyectos)

### Gestión Documental
![Documentos](https://via.placeholder.com/800x450?text=Documentos)

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios
4. Haz commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
5. Haz push a la rama (`git push origin feature/amazing-feature`)
6. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

---

Desarrollado con ❤️ para ElectroSur Ltda.
