# Pozo de Minerva - Sitio Web Informativo

Sitio web informativo sobre el proyecto del Pozo de Minerva en la zona 4 de Mixco, Guatemala. Plataforma de participación ciudadana con información oficial, documentos, sistema de comentarios y asistente virtual con IA.

## 🎯 Características Principales

- **Video Banner Autoplay**: Hero section con video en loop
- **Reproductor de Podcast**: Player MP3 sticky con controles completos
- **Sistema de Comentarios**: Con likes y dropdown de colonias de zona 4 Mixco
- **Chat con IA (OpenAI)**: Asistente virtual con límite de 5 mensajes por usuario
- **Documentos Oficiales**: Visualización y descarga de 5 PDFs del proyecto
- **Diseño Responsivo**: Adaptado de plantilla Koppee con Bootstrap
- **Base de Datos MySQL**: Para comentarios y sesiones de chat

## 🏗️ Arquitectura

```
pozominerva/
├── client/           # Frontend React
├── server/           # Backend Node.js/Express
└── database/         # Esquema MySQL
```

## 📋 Prerrequisitos

- **Node.js**: v16 o superior
- **MySQL**: v8 o superior
- **npm** o **yarn**

## 🚀 Instalación

### 1. Clonar el repositorio (si aplica)

```bash
git clone <repository-url>
cd pozominerva
```

### 2. Configurar la base de datos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el esquema
source database/schema.sql
```

O importar manualmente el archivo `database/schema.sql` desde phpMyAdmin u otro cliente MySQL.

### 3. Configurar el Backend

```bash
cd server

# Instalar dependencias
npm install

# El archivo .env ya está configurado con:
# - Puerto: 5000
# - Base de datos: pozominerva_db
# - OpenAI API Key (proporcionada)
# - Límite de chat: 5 mensajes

# IMPORTANTE: Ajustar credenciales de MySQL si es necesario
# Editar server/.env:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=pozominerva_db
```

### 4. Configurar el Frontend

```bash
cd client

# Instalar dependencias
npm install
```

### 5. Agregar archivos multimedia

#### Video Banner (obligatorio)
Coloca tu video MP4 en:
```
client/public/videos/banner-video.mp4
```

#### Podcast MP3 (obligatorio)
Coloca tu archivo de audio en:
```
client/public/audio/podcast.mp3
```

#### PDFs (5 archivos)
Coloca los 5 PDFs oficiales en:
```
client/public/pdfs/
├── resolucion-ambiental-marn.pdf
├── estudio-hidrogeologico.pdf
├── estudio-factibilidad.pdf
├── especificaciones-tecnicas.pdf
├── dictamen-juridico-supervisor.pdf
└── contexto-chat.pdf  (opcional - para el chat de IA)
```

**Nota**: El archivo `contexto-chat.pdf` es opcional. Si no existe, el chat usará un contexto por defecto hardcodeado en el código.

## ▶️ Ejecución

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Servidor corriendo en http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
# Aplicación corriendo en http://localhost:3000
```

### Modo Producción

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
# Los archivos estáticos se generan en client/build/
```

## 🗄️ Base de Datos

### Tablas

**comments**
- `id`: INT AUTO_INCREMENT PRIMARY KEY
- `nombre`: VARCHAR(100)
- `colonia`: VARCHAR(150)
- `comentario`: TEXT
- `likes`: INT DEFAULT 0
- `created_at`: TIMESTAMP

**chat_sessions**
- `id`: INT AUTO_INCREMENT PRIMARY KEY
- `session_id`: VARCHAR(255) UNIQUE
- `message_count`: INT DEFAULT 0
- `created_at`: TIMESTAMP
- `expires_at`: TIMESTAMP

### Insertar datos de ejemplo (opcional)

```sql
USE pozominerva_db;

INSERT INTO comments (nombre, colonia, comentario, likes) VALUES
('Juan Pérez', 'Bosques de San Nicolás', 'Estoy muy preocupado por el impacto ambiental de este proyecto en nuestra colonia.', 15),
('María López', 'Condado San Nicolás II', 'Necesitamos más información y transparencia sobre los estudios ambientales.', 23);
```

## 🔑 API Endpoints

### Comentarios
- `GET /api/comments` - Listar comentarios
- `POST /api/comments` - Crear comentario
- `PUT /api/comments/:id/like` - Dar like

### Chat OpenAI
- `POST /api/chat` - Enviar mensaje
- `GET /api/chat/status/:sessionId` - Estado de sesión

### PDFs
- `GET /api/pdfs` - Listar metadatos de PDFs
- `GET /api/pdfs/:id` - Obtener un PDF específico

### Health Check
- `GET /api/health` - Verificar estado del servidor

## 🎨 Paleta de Colores

- **Primario**: #1E88E5 (Azul agua)
- **Secundario**: #43A047 (Verde naturaleza)
- **Acento**: #FDD835 (Amarillo alerta)
- **Neutros**: #212121, #FAFAFA, #FFFFFF

## 📱 Componentes Principales

### Frontend
- **Navbar**: Navegación sticky responsive
- **Hero**: Video banner autoplay con overlay
- **PodcastPlayer**: Reproductor MP3 sticky con controles completos
- **Comments**: Sistema de comentarios con likes y formulario
- **ChatBot**: Asistente IA flotante (límite 5 mensajes)
- **DocumentSection**: Visualizador y descargador de PDFs
- **Footer**: Información de contacto y enlaces

### Backend
- **server.js**: Servidor Express principal
- **routes/**: Rutas de API (comments, chat, pdfs)
- **models/**: Modelos de datos (Comment, ChatSession)
- **config/**: Configuración (db, openai)

## 🔒 Seguridad

- Variables de entorno en `.env`
- Validación de formularios
- Rate limiting en chat (5 mensajes/día)
- Sanitización de inputs
- CORS configurado

## 📦 Dependencias Principales

### Frontend
- react, react-dom, react-router-dom
- bootstrap, react-bootstrap
- axios
- react-icons
- uuid

### Backend
- express
- mysql2
- openai
- cors
- dotenv
- pdf-parse
- cookie-parser

## 🛠️ Solución de Problemas

### Error de conexión a MySQL
```bash
# Verificar que MySQL está corriendo
mysql -u root -p

# Verificar credenciales en server/.env
```

### El chat no funciona
```bash
# Verificar API key de OpenAI en server/.env
# Verificar que el modelo está disponible (gpt-4-turbo)
```

### Los PDFs no se muestran
```bash
# Verificar que los archivos existen en client/public/pdfs/
# Verificar permisos de lectura
```

### El video/audio no se reproduce
```bash
# Verificar que los archivos existen:
# client/public/videos/banner-video.mp4
# client/public/audio/podcast.mp3
# Verificar formatos compatibles (MP4/H.264 para video, MP3 para audio)
```

## 📄 Próximas Páginas a Implementar

Las siguientes páginas están pendientes (puedes seguir el mismo patrón de HomePage):

1. **Página "¿Qué se construye?"** (`WhatIsProjectPage.jsx`)
2. **Página "Cinco Razones"** (`FiveReasonsPage.jsx`)
3. **Página "Participa"** (`ParticipatePage.jsx`)
4. **Página "FAQ"** (`FAQPage.jsx`)
5. **Página "Noticias"** (`NewsPage.jsx`)
6. **Página "Contacto"** (`ContactPage.jsx`)

## 📝 Contenido Oficial

Todo el contenido oficial del proyecto (5 razones, documentos, FAQ, etc.) está documentado en los comentarios del código y listo para ser poblado en las páginas correspondientes.

## 🤝 Contribuir

Para agregar nuevas páginas:

1. Crear componente en `client/src/pages/NombrePage.jsx`
2. Importar en `client/src/App.jsx`
3. Agregar ruta en el `<Routes>` de App.jsx
4. Agregar enlace en el Navbar

## 📞 Soporte

Para preguntas o problemas:
- Email: info@pozominerva.org
- Tel: +502 1234-5678

---

**Desarrollado con ❤️ para la comunidad de la Zona 4 de Mixco**

*"No estamos contra el agua; estamos a favor del agua responsable y del cumplimiento estricto de la ley"*
