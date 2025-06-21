# 🕒 ProjectTime - Gestión de Tiempo y Proyectos

Una aplicación web moderna para gestionar proyectos, registrar tiempo de trabajo y controlar asistencia. Desarrollada con React, Firebase y Tailwind CSS.

![ProjectTime](https://img.shields.io/badge/React-18.0.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.8.0-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-18.2.0-cyan)

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **Sistema de login** con Firebase Authentication
- **Validaciones robustas** de formularios
- **Manejo de errores** específicos para cada tipo de problema
- **Protección de rutas** basada en autenticación

### 📊 Gestión de Proyectos
- **Crear, editar y eliminar** proyectos
- **Estados de proyecto**: Pendiente, En progreso, Completado
- **Validación de nombres** únicos y longitud apropiada
- **Interfaz intuitiva** con confirmaciones de seguridad

### ⏰ Control de Asistencia
- **Fichar entrada y salida** por proyecto
- **Prevención de entradas duplicadas**
- **Cálculo automático** de duración de sesiones
- **Historial completo** de registros

### 📈 Gestión de Horas
- **Registro detallado** de tiempo por proyecto
- **Validación de horas y minutos** (0-999h, 0-59m)
- **Descripciones opcionales** para cada registro
- **Agrupación por proyecto** con totales automáticos
- **Edición y eliminación** de registros individuales

### 📤 Exportación de Datos
- **Exportar a PDF** con formato profesional
- **Exportar a Excel** con hojas de resumen y detalles
- **Validación de datos** antes de exportar
- **Múltiples formatos** de reporte

### 🔔 Sistema de Notificaciones
- **Notificaciones toast** para feedback inmediato
- **Tipos de notificación**: éxito, error, información
- **Auto-desaparición** después de 5 segundos
- **Diseño consistente** con el tema de la aplicación

### 🎨 Interfaz de Usuario
- **Diseño moderno** con gradientes y efectos visuales
- **Tema oscuro** optimizado para trabajo prolongado
- **Responsive design** para móviles y escritorio
- **Animaciones suaves** y transiciones
- **Iconos intuitivos** para mejor UX

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **React Router** - Enrutamiento de la aplicación
- **Tailwind CSS** - Framework de estilos
- **Vite** - Herramienta de construcción rápida

### Backend y Base de Datos
- **Firebase Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Authentication** - Sistema de autenticación
- **Firebase Hosting** - Alojamiento de la aplicación

### Librerías Adicionales
- **jsPDF** - Generación de PDFs
- **XLSX** - Exportación a Excel
- **React Firebase Hooks** - Hooks para Firebase

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Firebase

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/ProjectTime.git
cd ProjectTime
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication con Email/Password
3. Crea una base de datos Firestore
4. Copia las credenciales de configuración

### 4. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
```

### 5. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.jsx      # Barra de navegación
│   └── Notification.jsx # Sistema de notificaciones
├── pages/              # Páginas principales
│   ├── LoginPage.jsx   # Página de autenticación
│   ├── DashboardPage.jsx # Panel principal
│   ├── ProyectosPage.jsx # Gestión de proyectos
│   ├── AsistenciaPage.jsx # Control de asistencia
│   └── HourManagementPage.jsx # Gestión de horas
├── config/             # Configuración
│   └── firebase.js     # Configuración de Firebase
├── context/            # Contextos de React
│   ├── AuthContext.jsx # Contexto de autenticación
│   └── ThemeContext.jsx # Contexto de tema
├── database/           # Servicios de base de datos
│   └── firestoreService.js
├── utils/              # Utilidades
│   ├── cacheService.js # Servicio de caché
│   └── exportService.js # Servicio de exportación
└── assets/             # Recursos estáticos
```

## 🔧 Funcionalidades Detalladas

### Gestión de Proyectos
- **Crear proyecto**: Nombre único, estado inicial
- **Editar proyecto**: Modificar nombre y estado
- **Eliminar proyecto**: Con confirmación de seguridad
- **Estados disponibles**: Pendiente, En progreso, Completado

### Control de Asistencia
- **Fichar entrada**: Seleccionar proyecto y registrar entrada
- **Fichar salida**: Registrar salida automáticamente
- **Validaciones**: Prevenir entradas duplicadas
- **Historial**: Ver todos los registros con duración calculada

### Gestión de Horas
- **Registrar tiempo**: Proyecto, descripción, horas, minutos
- **Validaciones**: Formato correcto, valores válidos
- **Editar registros**: Modificar descripciones
- **Eliminar registros**: Con confirmación
- **Agrupación**: Totales por proyecto

### Exportación
- **PDF**: Reporte estructurado con todos los proyectos
- **Excel**: Hojas de resumen y detalles
- **Formato**: Datos organizados y profesionales

## 🎯 Casos de Uso

### Para Freelancers
- Registrar tiempo por cliente/proyecto
- Generar reportes para facturación
- Mantener historial de trabajo

### Para Empresas
- Control de asistencia de empleados
- Seguimiento de proyectos internos
- Análisis de productividad

### Para Equipos
- Coordinación de proyectos
- Distribución de tareas
- Reportes de progreso

## 🔒 Seguridad

- **Autenticación**: Firebase Auth con email/password
- **Autorización**: Usuarios solo ven sus propios datos
- **Validación**: Verificación en frontend y backend
- **Sanitización**: Limpieza de datos de entrada

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Pantallas grandes con layout completo
- **Tablet**: Adaptación de columnas y espaciado
- **Mobile**: Navegación simplificada y formularios optimizados

## 🚀 Despliegue

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Otros proveedores
La aplicación se puede desplegar en cualquier proveedor que soporte aplicaciones React estáticas.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@Days16](https://github.com/Days16)

## 🙏 Agradecimientos

- Firebase por la infraestructura backend
- Tailwind CSS por el framework de estilos
- React por la biblioteca de interfaz
- La comunidad open source por las librerías utilizadas

---

⭐ Si este proyecto te resulta útil, ¡dale una estrella en GitHub!