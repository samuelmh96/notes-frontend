# Notes Frontend

Frontend moderno para aplicación de gestión de notas con tags, construido con Vue 3, Vite y PrimeVue.

## 🚀 Tecnologías

- **Vue 3** - Framework progresivo de JavaScript
- **Vite** - Build tool ultra rápido
- **PrimeVue** - Librería de componentes UI
- **Vue Router** - Enrutamiento oficial de Vue
- **Axios** - Cliente HTTP para API REST

## 📋 Requisitos previos

- Node.js 18+ 
- npm o yarn
- Backend API corriendo en `http://localhost:8000`

## 🔧 Instalación
```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/notes-frontend.git

# Entrar al directorio
cd notes-frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Estructura del proyecto
```
notes-frontend/
├── src/
│   ├── components/     # Componentes Vue
│   │   └── NotesList.vue
│   ├── router/         # Configuración de rutas
│   ├── services/       # Servicios API
│   │   └── api.js
│   ├── views/          # Vistas principales
│   ├── App.vue
│   └── main.js
├── public/
└── package.json
```

## ✨ Características

- ✅ Crear notas con título y contenido
- ✅ Listar todas las notas
- ✅ Diseño moderno con PrimeVue
- ✅ Comunicación con API REST
- ✅ Responsive design

## 🔗 Backend

Este frontend requiere el backend API:
- Repositorio: https://github.com/samuelmh96/notes-backend
- URL API: `http://localhost:8000/api`

## 📦 Scripts disponibles
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🎨 Personalización

El tema de PrimeVue está configurado en `src/main.js`. Puedes cambiar el tema Aura por otros presets disponibles.

## 📝 Próximas características

- [ ] Editar notas existentes
- [ ] Eliminar notas
- [ ] Sistema de tags
- [ ] Filtrado y búsqueda
- [ ] Autenticación de usuarios

## 👨‍💻 Autor

Samuel - https://github.com/samuelmh96/

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.