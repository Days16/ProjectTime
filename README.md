# ProjectTime - Gestión de Tiempo y Proyectos

![ProjectTime Logo](https://img.shields.io/badge/ProjectTime-Time%20Management-blue?style=for-the-badge&logo=clock)

Una aplicación web moderna y completa para la gestión de tiempo, proyectos y asistencia. Desarrollada con React, Firebase y un diseño elegante con tema oscuro.

## ✨ Características Principales

### 🎯 **Dashboard Interactivo**
- **Gráficos en tiempo real**: Barras, pastel, líneas y áreas
- **Estadísticas dinámicas**: Tiempo total, proyectos activos, registros
- **Filtros avanzados**: Por fecha, proyecto, estado y duración
- **Actividad reciente**: Últimas entradas y registros
- **Proyecto más activo**: Análisis automático del proyecto con más tiempo

### 🔍 **Sistema de Búsqueda y Filtros Avanzados**
- **Búsqueda semántica**: En proyectos, descripciones y contenido
- **Filtros por fecha**: Hoy, ayer, esta semana, mes personalizado
- **Filtros por proyecto**: Selección múltiple de proyectos
- **Filtros por estado**: Pendiente, en progreso, completado
- **Filtros por duración**: Corta, media, larga
- **Resumen visual**: Indicadores de filtros activos

### ⏱️ **Gestión de Horas Mejorada**
- **Registro de tiempo**: Horas y minutos con validación
- **Agrupación por proyecto**: Vista organizada y clara
- **Edición en línea**: Modificar descripciones sin recargar
- **Eliminación segura**: Confirmaciones para acciones destructivas
- **Exportación**: PDF y Excel con formato profesional
- **Validaciones robustas**: Campos obligatorios y formatos correctos

### 📁 **Gestión de Proyectos**
- **CRUD completo**: Crear, leer, actualizar, eliminar proyectos
- **Estados y prioridades**: Control del progreso del proyecto
- **Fechas de inicio y fin**: Planificación temporal
- **Descripciones detalladas**: Información completa del proyecto
- **Validaciones**: Nombres únicos y formatos correctos

### 📅 **Control de Asistencia**
- **Registro de entrada/salida**: Control de horarios
- **Tipos de asistencia**: Presencial, remoto, vacaciones, enfermedad
- **Cálculo automático**: Horas trabajadas por día
- **Estadísticas**: Resumen de asistencia y tipos
- **Validaciones**: Horarios lógicos y fechas válidas

### 🔐 **Sistema de Autenticación Mejorado**
- **Login seguro**: Validación de credenciales
- **Redirección automática**: Al dashboard después del login
- **Protección de rutas**: Solo usuarios autenticados
- **Logout seguro**: Limpieza de sesión
- **Manejo de errores**: Mensajes claros y específicos

### 🔔 **Sistema de Notificaciones**
- **Notificaciones en tiempo real**: Éxito, error, información
- **Auto-desaparición**: Después de 5 segundos
- **Posicionamiento fijo**: Esquina inferior derecha
- **IDs únicos**: Sin duplicados ni conflictos
- **Estilos contextuales**: Colores según el tipo

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18**: Biblioteca de interfaz de usuario
- **React Router DOM**: Navegación y enrutamiento
- **Tailwind CSS**: Framework de estilos utilitarios
- **Recharts**: Biblioteca de gráficos interactivos
- **date-fns**: Manipulación de fechas

### Backend y Base de Datos
- **Firebase Firestore**: Base de datos NoSQL en la nube
- **Firebase Authentication**: Sistema de autenticación
- **Firebase Hosting**: Despliegue y hosting

### Utilidades
- **jsPDF**: Generación de reportes PDF
- **XLSX**: Exportación a Excel
- **Vite**: Herramienta de construcción rápida

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Firebase

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/ProjectTime.git
   cd ProjectTime
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita Authentication y Firestore
   - Copia las credenciales a `src/config/firebase.js`

4. **Configurar índices de Firestore**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:indexes
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── DashboardCharts.jsx    # Gráficos del dashboard
│   ├── SearchAndFilters.jsx   # Sistema de filtros
│   ├── Notification.jsx       # Sistema de notificaciones
│   └── Navbar.jsx             # Navegación principal
├── context/              # Contextos de React
│   ├── AuthContext.jsx        # Autenticación
│   └── ThemeContext.jsx       # Tema de la aplicación
├── pages/                # Páginas principales
│   ├── DashboardPage.jsx      # Dashboard principal
│   ├── HourManagementPage.jsx # Gestión de horas
│   ├── ProyectosPage.jsx      # Gestión de proyectos
│   ├── AsistenciaPage.jsx     # Control de asistencia
│   └── LoginPage.jsx          # Página de login
├── utils/                # Utilidades y helpers
│   └── chartDataUtils.js      # Procesamiento de datos para gráficos
├── config/               # Configuraciones
│   └── firebase.js            # Configuración de Firebase
└── routes.jsx            # Configuración de rutas
```

## 🎮 Funcionalidades Detalladas

### Dashboard
- **Gráfico de barras**: Tiempo por proyecto
- **Gráfico de pastel**: Distribución del tiempo
- **Gráfico de líneas**: Tendencia temporal
- **Gráfico de área**: Tiempo acumulado
- **Comparación de proyectos**: Análisis comparativo
- **Widget de actividad reciente**: Últimas acciones
- **Estadísticas generales**: Métricas clave

### Gestión de Horas
- **Registro manual**: Entrada de tiempo con validación
- **Vista agrupada**: Organización por proyecto
- **Edición en línea**: Modificación de descripciones
- **Eliminación segura**: Confirmaciones obligatorias
- **Exportación**: PDF y Excel con formato profesional
- **Filtros avanzados**: Búsqueda y filtrado inteligente

### Proyectos
- **Gestión completa**: CRUD de proyectos
- **Estados**: Pendiente, en progreso, completado
- **Prioridades**: Alta, media, baja
- **Fechas**: Inicio y fin del proyecto
- **Validaciones**: Nombres únicos y formatos
- **Filtros**: Búsqueda y filtrado avanzado

### Asistencia
- **Control de horarios**: Entrada y salida
- **Tipos**: Presencial, remoto, vacaciones, enfermedad
- **Cálculo automático**: Horas trabajadas
- **Estadísticas**: Resumen de asistencia
- **Validaciones**: Horarios lógicos

## 🔧 Configuración de Firebase

### Índices Requeridos
La aplicación requiere los siguientes índices compuestos en Firestore:

1. **timeEntries**: `userId` + `timestamp` (desc)
2. **registros**: `userId` + `fecha` (desc)
3. **proyectos**: `ownerId` + `fechaCreacion` (desc)
4. **timeEntries**: `userId` + `project`
5. **registros**: `userId` + `proyecto`

### Despliegue de Índices
```bash
firebase deploy --only firestore:indexes
```

## 🎨 Diseño y UX

### Tema Oscuro
- **Colores principales**: Negro, gris oscuro, cyan, rosa
- **Gradientes**: Efectos visuales atractivos
- **Sombras**: Profundidad y dimensión
- **Transiciones**: Animaciones suaves

### Responsive Design
- **Mobile-first**: Diseño optimizado para móviles
- **Breakpoints**: Adaptación a diferentes pantallas
- **Navegación móvil**: Menú hamburguesa
- **Touch-friendly**: Interacciones táctiles

### Accesibilidad
- **Contraste**: Texto legible
- **Navegación por teclado**: Accesibilidad completa
- **Etiquetas**: Elementos descriptivos
- **Feedback visual**: Estados claros

## 🔒 Seguridad

### Autenticación
- **Firebase Auth**: Sistema seguro y confiable
- **Protección de rutas**: Solo usuarios autenticados
- **Validación de sesión**: Verificación continua
- **Logout seguro**: Limpieza de datos

### Validaciones
- **Frontend**: Validación en tiempo real
- **Backend**: Reglas de Firestore
- **Sanitización**: Limpieza de datos
- **Confirmaciones**: Acciones destructivas

## 📊 Casos de Uso

### Para Desarrolladores
- **Tracking de tiempo**: Registrar horas de desarrollo
- **Gestión de proyectos**: Organizar tareas y sprints
- **Análisis de productividad**: Métricas de rendimiento
- **Reportes**: Exportación de datos

### Para Empresas
- **Control de asistencia**: Monitoreo de horarios
- **Gestión de proyectos**: Seguimiento de iniciativas
- **Análisis de tiempo**: Optimización de recursos
- **Compliance**: Cumplimiento de horarios

### Para Freelancers
- **Facturación**: Cálculo de horas trabajadas
- **Gestión de clientes**: Organización de proyectos
- **Productividad**: Análisis de eficiencia
- **Reportes**: Documentación para clientes

## 🚀 Despliegue

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Variables de Entorno
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Guías de Contribución
- **Código limpio**: Sigue las mejores prácticas
- **Testing**: Asegura que todo funcione
- **Documentación**: Actualiza la documentación
- **Commits descriptivos**: Mensajes claros

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Firebase**: Por la infraestructura robusta
- **React**: Por el framework increíble
- **Tailwind CSS**: Por los estilos utilitarios
- **Recharts**: Por los gráficos hermosos
- **Comunidad**: Por el apoyo y feedback

---

**ProjectTime** - Gestiona tu tiempo, maximiza tu productividad ⏰✨