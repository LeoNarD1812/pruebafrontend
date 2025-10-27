# SysAsistencia Frontend

Frontend de la aplicación SysAsistencia desarrollado con React + Vite.

## 🚀 Tecnologías

- **React 19.1.1**
- **React Router DOM**
- **Axios**
- **Vite**
- **Context API** para manejo de estado

## 📁 Estructura del Proyecto

```
appAESF/
├─ src/
│  ├─ api/
│  │  └─ axiosConfig.js         # Configuración de Axios
│  │
│  ├─ components/
│  │  ├─ Navbar.jsx             # Barra de navegación
│  │  └─ Sidebar.jsx            # Menú lateral
│  │
│  ├─ context/
│  │  └─ AuthContext.jsx        # Contexto de autenticación
│  │
│  ├─ hooks/
│  │  └─ useAuth.js             # Hook personalizado de autenticación
│  │
│  ├─ layouts/
│  │  └─ MainLayout.jsx         # Layout principal
│  │
│  ├─ pages/
│  │  ├─ SuperAdmin/            # Páginas de Super Admin
│  │  ├─ Admin/                 # Páginas de Admin
│  │  ├─ LoginPage.jsx          # Página de login
│  │  └─ RegisterPage.jsx       # Página de registro
│  │
│  ├─ router/
│  │  └─ AppRouter.jsx          # Configuración de rutas
│  │
│  ├─ services/
│  │  └─ authService.js         # Servicios de autenticación
│  │
│  ├─ styles/
│  │  └─ global.css             # Estilos globales
│  │
│  ├─ utils/
│  │  └─ helpers.js             # Funciones auxiliares
│  │
│  ├─ App.jsx
│  └─ main.jsx
│
├─ .env                         # Variables de entorno
└─ package.json
```

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno en `.env`:
```
VITE_API_URL=http://localhost:8080
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

## 📝 Funcionalidades

- ✅ Autenticación con JWT
- ✅ Login y Registro
- ✅ Rutas protegidas
- ✅ Navbar con información del usuario
- ✅ Sidebar con navegación por roles
- ✅ Dashboard básico
- ✅ Responsive design

## 🔐 Autenticación

La aplicación usa JWT para la autenticación. El token se almacena en localStorage y se envía automáticamente en todas las peticiones al backend.

## 🎨 Estilos

Los estilos están en `src/styles/global.css` y usan CSS vanilla con flexbox y grid.

## 📡 API

El frontend consume las siguientes APIs del backend:

- `POST /users/login` - Login
- `POST /users/register` - Registro
- Otros endpoints según el rol del usuario

## 🚢 Build para producción

```bash
npm run build
```

Los archivos compilados se generan en la carpeta `dist/`.

## 👤 Usuarios de prueba

La aplicación se conecta con el backend Spring Boot en `http://localhost:8080`.

## 📄 Licencia

MIT
