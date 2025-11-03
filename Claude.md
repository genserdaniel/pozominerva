# Pozo de Minerva - Especificación Completa

## Descripción General

Aplicación web para la comunidad del proyecto "Pozo de Minerva" en Guatemala. Sistema de información comunitario con chat grupal, análisis de IA, y reproducción de contenido multimedia.

**Propósito**: Facilitar la comunicación entre vecinos afectados por el proyecto de construcción del Pozo de Minerva, con un bot de IA que responde preguntas basándose en documentación oficial del proyecto.

---

## Arquitectura

### Stack Tecnológico

**Frontend:**
- React 18.2.0
- React Router DOM 6.20.1
- React Bootstrap 2.9.1
- Axios 1.6.2
- React Icons 4.12.0

**Backend:**
- Node.js + Express
- MySQL (MariaDB)
- Multer (para upload de archivos)
- PDF-Parse (para procesamiento de PDFs)

**Integraciones de IA:**
- OpenAI GPT-4 (análisis de texto y bot conversacional)
- Google Gemini 2.5 Pro (análisis multimodal: imágenes, videos, audios)

---

## Estructura del Proyecto

```
pozominerva/
├── client/                          # Frontend React
│   ├── public/
│   │   ├── audio/
│   │   │   └── podcast.mp3          # Podcast informativo
│   │   ├── documents/               # PDFs del proyecto
│   │   └── images/                  # Imágenes estáticas
│   ├── src/
│   │   ├── components/
│   │   │   ├── GroupChat.jsx        # Chat grupal principal
│   │   │   ├── GroupChat.css
│   │   │   ├── PodcastPlayer.jsx    # Reproductor sticky de podcast
│   │   │   ├── PodcastPlayer.css
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── UserRegistrationModal.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   └── DocumentsPage.jsx
│   │   ├── styles/
│   │   │   └── App.css
│   │   └── App.jsx
│   ├── package.json
│   └── .env
│
├── server/                          # Backend Node.js
│   ├── config/
│   │   ├── db.js                    # Configuración MySQL
│   │   ├── openai.js                # Configuración OpenAI
│   │   └── gemini.js                # Configuración Gemini
│   ├── models/
│   │   ├── Message.js               # Modelo de mensajes
│   │   └── Reaction.js              # Modelo de reacciones
│   ├── routes/
│   │   └── messages.js              # Rutas API de mensajes
│   ├── services/
│   │   ├── botAnalyzer.js           # PozoBot con OpenAI
│   │   ├── geminiAnalyzer.js        # Análisis multimedia con Gemini
│   │   ├── typingTracker.js         # Indicadores de escritura
│   │   └── ensureMultimediaAnalysis.js  # Análisis batch de multimedia
│   ├── utils/
│   │   └── pdfContext.js            # Procesamiento de PDFs
│   ├── uploads/                     # Archivos subidos por usuarios
│   ├── server.js                    # Punto de entrada
│   └── package.json
│
└── Claude.md                        # Este archivo
```

---

## Características Principales

### 1. Chat Grupal Comunitario

**Funcionalidades:**
- Mensajes de texto en tiempo real
- Carga de multimedia (imágenes, videos, audios)
- Sistema de respuestas anidadas (hasta 5 niveles)
- Reacciones a mensajes con emojis
- Indicadores de "escribiendo..." en tiempo real
- Navegación por referencias (click en respuesta para ver mensaje original)
- Agrupación de mensajes por fecha
- Scroll automático con detección de posición
- Highlighting temporal de mensajes

**Polling:**
- Nuevos mensajes: cada 2 segundos
- Typing indicators: cada 2 segundos
- Reacciones: actualizadas en cada poll de mensajes

### 2. PozoBot - Asistente con IA

**Características:**
- Análisis automático de mensajes cada 30 segundos
- Contexto basado en documentación PDF del proyecto
- Responde preguntas sobre el proyecto utilizando GPT-4
- Tono crítico y moderador
- Vincula respuestas a puntos de preocupación
- Procesa multimedia usando análisis de Gemini
- Indicador visual cuando está "escribiendo"

**Criterios de Respuesta:**
- Responde a preguntas sobre el proyecto
- Responde a rumores o información incorrecta
- NO responde a saludos simples
- NO responde a conversaciones personales
- NO responde a comentarios de opinión sin preguntas

**Modelo:** GPT-4 con 125k tokens de contexto
**Sistema Prompt:** Define personalidad crítica y moderadora

### 3. Análisis Multimedia con Gemini

**Tipos de análisis:**
- **Imágenes**: Descripción detallada del contenido visual
- **Videos**: Análisis frame-by-frame y descripción general
- **Audios**: Transcripción completa del contenido

**Características:**
- Análisis automático al subir archivo
- Almacenamiento en BD (campo `media_analysis`)
- Evita re-análisis de archivos ya procesados
- Batch processing al iniciar servidor
- Integración con respuestas del bot

**Modelo:** Gemini 2.5 Pro (multimodal)

### 4. Reproductor de Podcast

**Diseño:**
- Sticky player en la parte inferior
- Minimizable (muestra solo primera fila)
- 2 filas de controles:
  - Fila 1: Info + Play + Progreso
  - Fila 2: Volumen + Reacciones + Comentarios

**Controles:**
- Play/Pause
- Seek bar con timestamps
- Control de volumen
- Mute/Unmute
- Reacciones con emojis
- Comentarios que se publican en el chat

**Funcionalidad Especial:**
- Los comentarios desde el player se publican como respuestas al podcast
- Se minimiza automáticamente después de comentar/reaccionar
- Indicador de typing cuando se escribe comentario
- Muestra contador de respuestas y reacciones

### 5. Sistema de Reacciones

**Emojis disponibles:**
👍 ❤️ 😂 😮 😢 🙏 👏 🔥

**Características:**
- Contador por emoji
- Lista de usuarios que reaccionaron
- Toggle: click de nuevo para quitar reacción
- Highlighting visual del emoji si el usuario reaccionó
- Funciona tanto en chat como en podcast player

### 6. Sistema de Respuestas

**Características:**
- Respuestas anidadas hasta 5 niveles
- Preview del mensaje original en el mensaje de respuesta
- Click en preview para navegar al mensaje original
- Scroll suave con highlighting temporal
- Cadena completa visible en contexto del bot

---

## Base de Datos

### Tabla: `messages`

```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  user_colonia VARCHAR(255) NOT NULL,
  message_text TEXT,
  media_type ENUM('none', 'image', 'video', 'audio') DEFAULT 'none',
  media_url VARCHAR(500),
  media_filename VARCHAR(500),
  media_analysis TEXT,              -- Análisis de Gemini
  reply_to_id INT,
  is_bot BOOLEAN DEFAULT FALSE,
  bot_analyzed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
);
```

### Tabla: `reactions`

```sql
CREATE TABLE reactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_colonia VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reaction (message_id, user_name, user_colonia, emoji)
);
```

---

## API Endpoints

### Mensajes

**GET** `/api/messages`
- Obtiene todos los mensajes con información de respuestas
- Incluye: user_name, user_colonia, message_text, media_*, reply_to_*, created_at

**GET** `/api/messages/:id`
- Obtiene un mensaje específico por ID

**POST** `/api/messages`
- Crea un nuevo mensaje
- Body: `{ userName, userColonia, messageText?, replyToId? }`
- Soporta multipart/form-data para archivos
- Campos: `userName, userColonia, messageText, mediaFile, replyToId`

### Reacciones

**POST** `/api/messages/:messageId/reactions`
- Agrega o quita una reacción (toggle)
- Body: `{ userName, userColonia, emoji }`

**GET** `/api/messages/:messageId/reactions`
- Obtiene reacciones de un mensaje
- Agrupadas por emoji con contador

### Typing Indicators

**POST** `/api/messages/typing/start`
- Marca que usuario está escribiendo
- Body: `{ userName, userColonia }`

**POST** `/api/messages/typing/stop`
- Marca que usuario dejó de escribir
- Body: `{ userName, userColonia }`

**GET** `/api/messages/typing`
- Obtiene lista de usuarios escribiendo actualmente
- Timeout: 5 segundos de inactividad

### Status

**GET** `/api/messages/bot/status`
- Verifica si PozoBot está analizando
- Response: `{ isTyping: boolean }`

---

## Configuración

### Variables de Entorno - Backend

```env
# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=pozominerva

# OpenAI
OPENAI_API_KEY=sk-...

# Gemini
GEMINI_API_KEY=AI...

# Server
PORT=3001
```

### Variables de Entorno - Frontend

```env
SKIP_PREFLIGHT_CHECK=true
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

### Configuración OpenAI

- **Modelo**: GPT-4
- **Temperature**: 1
- **Max tokens**: 2000
- **Contexto PDF**: 125k tokens
- **Análisis**: Cada 30 segundos

### Configuración Gemini

- **Modelo**: gemini-2.5-pro-exp-0827
- **Análisis**: On-demand + batch en startup
- **Formatos**: PNG, JPG, MP4, MP3, WAV, M4A, WEBM

---

## Flujos de Trabajo

### Flujo 1: Usuario Envía Mensaje

1. Usuario escribe mensaje en chat
2. Frontend muestra "escribiendo..." a otros usuarios
3. Usuario envía mensaje (con o sin multimedia)
4. POST a `/api/messages`
5. Si hay multimedia:
   - Se sube a `/server/uploads/`
   - Se guarda sin análisis (rápido)
6. Mensaje se guarda en BD
7. Frontend hace polling y muestra mensaje
8. PozoBot detecta mensaje nuevo en próximo ciclo (30s)
9. Si hay multimedia sin análisis:
   - Gemini lo analiza
   - Guarda análisis en `media_analysis`
10. PozoBot procesa con contexto completo
11. Si debe responder, crea mensaje del bot

### Flujo 2: Usuario Reacciona a Mensaje

1. Click en emoji picker
2. Selecciona emoji
3. POST a `/api/messages/:id/reactions`
4. Toggle en BD (crea o elimina reacción)
5. Frontend polling actualiza contador
6. UI refleja cambio

### Flujo 3: Usuario Comenta en Podcast

1. Click en "Responder" en podcast player
2. Escribe comentario (activa typing indicator)
3. Click en enviar
4. POST a `/api/messages` con `replyToId` del podcast
5. Player se minimiza
6. Mensaje aparece en chat como respuesta al podcast

### Flujo 4: Navegación por Referencias

1. Usuario ve mensaje con preview de respuesta
2. Click en preview
3. `scrollToMessage(reply_to_id)` se ejecuta
4. Scroll suave al mensaje original
5. Highlighting temporal (2 segundos)
6. Auto-scroll desactivado temporalmente

### Flujo 5: Análisis Batch al Iniciar

1. Servidor inicia
2. `ensureMultimediaAnalysis()` se ejecuta
3. Query: multimedia sin `media_analysis`
4. Para cada archivo:
   - Gemini analiza
   - Guarda en BD
5. Log de progreso en consola

---

## Componentes Frontend Clave

### GroupChat.jsx

**Responsabilidades:**
- Renderizado de mensajes
- Polling de nuevos mensajes y typing
- Sistema de respuestas
- Reacciones
- Upload de multimedia
- Scroll management
- Navegación por referencias

**Hooks principales:**
- `useState`: messages, reactions, replyTo, typingUsers
- `useEffect`: polling intervals, scroll behavior
- `useRef`: messagesEndRef, scrollContainerRef
- `useImperativeHandle`: expone scrollToMessage al padre

**Funciones clave:**
- `loadMessages()`: Carga mensajes desde API
- `pollNewMessages()`: Polling cada 2s
- `scrollToMessage(id)`: Navegación a mensaje específico
- `handleReaction(id, emoji)`: Toggle de reacciones
- `handleFileUpload()`: Upload de multimedia

### PodcastPlayer.jsx

**Responsabilidades:**
- Reproducción de audio
- Controles de playback
- Reacciones al podcast
- Comentarios que se publican en chat
- Minimizar/maximizar
- Typing indicators para comentarios

**Estado principal:**
- `isPlaying, currentTime, duration, volume, isMuted`
- `isMinimized, showEmojiPicker, showCommentInput`
- `commentText`

**Funciones clave:**
- `handlePlayPause()`: Toggle reproducción
- `handleReaction(emoji)`: Reacción al podcast
- `handleCommentSubmit()`: Publica comentario en chat
- `notifyTypingStart/Stop()`: Indicadores de escritura

### App.jsx

**Responsabilidades:**
- Routing
- Referencia al chat para scroll
- Modal de registro
- Integración podcast player ↔ chat

**Función puente:**
- `handleScrollToPodcast(messageId)`: Llama a scrollToMessage del chat

---

## Servicios Backend Clave

### botAnalyzer.js

**Función principal:** `analyzeRecentMessages()`

**Flujo:**
1. Obtiene mensajes no analizados del último minuto
2. Analiza multimedia pendiente con Gemini
3. Obtiene contexto de últimos 20 mensajes
4. Construye prompt con:
   - System prompt
   - Contexto del PDF
   - Historial reciente
   - Mensajes nuevos con cadenas de respuestas
5. Llama a OpenAI GPT-4
6. Si responde, crea mensaje del bot
7. Marca mensajes como analizados

**Características especiales:**
- Procesa cadenas de respuestas recursivamente (5 niveles)
- Incluye análisis de multimedia en contexto
- Bitácora detallada en consola
- Indicador `isAnalyzing` para UI

### geminiAnalyzer.js

**Función principal:** `analyzeMultimedia(filePath, mediaType)`

**Flujo:**
1. Valida tipo de archivo
2. Lee archivo y convierte a base64
3. Crea request a Gemini con:
   - Imagen: "Describe detalladamente..."
   - Video: "Analiza este video..."
   - Audio: "Transcribe el siguiente audio..."
4. Retorna análisis como texto

**Modelos por tipo:**
- Todos: gemini-2.5-pro-exp-0827 (multimodal)

### typingTracker.js

**Estructura de datos:**
```javascript
typingUsers: Map<userId, {
  userName: string,
  userColonia: string,
  timestamp: number
}>
```

**Funciones:**
- `markUserTyping(userName, userColonia)`
- `markUserStoppedTyping(userName, userColonia)`
- `getTypingUsers()` - limpia usuarios inactivos >5s
- `clearExpiredTypingUsers()` - cleanup automático

---

## Estilos y Diseño

### Paleta de Colores

**Variables CSS:**
```css
--color-primary: #075e54      /* Verde WhatsApp */
--color-primary-dark: #054d44
--color-white: #ffffff
--color-light-green: #dcf8c6  /* Mensajes propios */
--color-gray: #e5ddd5         /* Fondo chat */
```

### Responsive Breakpoints

- Desktop: > 992px
- Tablet: 768px - 992px
- Mobile: < 768px
- Small mobile: < 480px

### Componentes Visuales

**Message Bubbles:**
- Propios: align-right, color-light-green
- Otros: align-left, white
- Bot: fondo especial con icono 🤖

**Podcast Player:**
- Desktop minimizado: -60px desde bottom
- Mobile minimizado: -50px desde bottom
- Transición suave: 0.3s ease

**Chat Spacing:**
- Desktop: padding-bottom 70px
- Tablet: padding-bottom 80px
- Mobile: padding-bottom 90px

---

## Seguridad

### Upload de Archivos

**Validaciones:**
- Extensiones permitidas: jpg, jpeg, png, mp4, mp3, wav, m4a, webm
- Tamaño máximo: configurado en Multer
- Nombres únicos con timestamp
- Storage en `/server/uploads/`

**Protección:**
- No download directo de multimedia en chat
- `controlsList="nodownload"` en video/audio
- `onContextMenu` bloqueado

### Input Sanitization

**Frontend:**
- Validación de campos requeridos
- Trimming de strings
- Verificación de usuario registrado

**Backend:**
- Prepared statements en MySQL
- Validación de tipos de datos
- Manejo de errores con try-catch

---

## Logging y Debugging

### Console Logs del Bot

```
🤖 PozoBot iniciado - Analizará mensajes cada 30 segundos
⏭️  ⚠️  TIMER ACTIVADO: PozoBot todavía está ocupado...
🤖 PozoBot analizando X mensaje(s)...
🎬 Analizando image con Gemini: uploads/file.jpg
✅ Análisis completado y guardado para mensaje ID X
📋 BITÁCORA - Mensajes NUEVOS a procesar:
   1. [ID: X] Usuario (Colonia): mensaje...
📝 PROMPT COMPLETO A ENVIAR A OPENAI:
─────────────────────
[prompt completo]
─────────────────────
📊 RESPUESTA COMPLETA DE OPENAI:
   Modelo usado: gpt-4
   Tokens totales: X
💬 RESPUESTA DE LA IA:
[respuesta]
🤖 PozoBot respondió en el chat
✅ PozoBot terminó el análisis
```

### Análisis Multimedia

```
📊 Encontrados X archivos multimedia sin análisis
🎬 Analizando image: file.jpg
✅ Análisis completado para mensaje ID X
✅ Todos los archivos multimedia ya tienen análisis
```

---

## Deployment

### Frontend Build

```bash
cd client
npm install
npm run build
# Build estará en client/build/
```

### Backend Start

```bash
cd server
npm install
node server.js
# Servidor en puerto 3001
```

### Database Setup

```sql
CREATE DATABASE pozominerva;
USE pozominerva;

-- Ejecutar esquemas de tables
-- Ver sección Base de Datos
```

### Archivos Requeridos

**Backend:**
- `.env` con todas las API keys
- `/uploads/` directory (crear si no existe)
- PDFs del proyecto en ubicación configurada

**Frontend:**
- `/public/audio/podcast.mp3`
- `/public/documents/*.pdf`

---

## Testing Manual

### Checklist de Funcionalidades

**Chat:**
- [ ] Enviar mensaje de texto
- [ ] Upload imagen
- [ ] Upload video
- [ ] Upload audio
- [ ] Responder a mensaje
- [ ] Reaccionar con emoji
- [ ] Ver typing indicators
- [ ] Navegar por referencias (click en reply-preview)
- [ ] Scroll automático con nuevos mensajes

**PozoBot:**
- [ ] Responde a preguntas sobre proyecto
- [ ] Analiza multimedia correctamente
- [ ] Muestra "escribiendo..." cuando analiza
- [ ] Vincula a puntos de preocupación
- [ ] NO responde a saludos simples

**Podcast:**
- [ ] Reproducir/pausar
- [ ] Seek en timeline
- [ ] Control de volumen
- [ ] Mute/unmute
- [ ] Reaccionar al podcast
- [ ] Comentar en podcast
- [ ] Minimizar/maximizar
- [ ] Ver contador de respuestas

**Multimedia:**
- [ ] Gemini analiza imágenes
- [ ] Gemini analiza videos
- [ ] Gemini transcribe audios
- [ ] Análisis se guarda en BD
- [ ] No se re-analiza en restart

---

## Troubleshooting

### Problema: Multimedia no se analiza

**Solución:**
1. Verificar API key de Gemini en `.env`
2. Verificar formato de archivo soportado
3. Revisar logs del servidor
4. Ejecutar manualmente `ensureMultimediaAnalysis()`

### Problema: Bot no responde

**Solución:**
1. Verificar API key de OpenAI
2. Confirmar que PDF context se cargó correctamente
3. Revisar logs del botAnalyzer
4. Verificar que mensaje cumple criterios de respuesta

### Problema: Servidor se cae

**Causas comunes:**
- Out of memory (muchas imágenes grandes)
- DB connection timeout
- API rate limits

**Solución:**
- Aumentar memoria Node.js
- Verificar conexión a MySQL
- Implementar rate limiting

### Problema: Frontend no compila

**Solución:**
1. Borrar node_modules y reinstalar
2. Limpiar cache: `npm cache clean --force`
3. Verificar versiones de Node y npm
4. Revisar .env con SKIP_PREFLIGHT_CHECK

---

## Mejoras Futuras

### Corto Plazo
- [ ] Sistema de notificaciones push
- [ ] Búsqueda de mensajes
- [ ] Filtros por fecha/usuario
- [ ] Exportar chat a PDF
- [ ] Modo oscuro

### Mediano Plazo
- [ ] Autenticación con JWT
- [ ] Roles de usuario (admin, moderador)
- [ ] Sistema de reportes
- [ ] Analytics de participación
- [ ] Backup automático de BD

### Largo Plazo
- [ ] App móvil nativa
- [ ] Video llamadas
- [ ] Integración con WhatsApp
- [ ] Sistema de encuestas
- [ ] Mapa interactivo del proyecto

---

## Contacto y Soporte

**Desarrollador:** Claude (Anthropic AI)
**Proyecto:** Pozo de Minerva
**Ubicación:** Guatemala
**Fecha:** 2025

---

## Licencia

Proyecto privado para uso comunitario del Pozo de Minerva.

---

**Última actualización:** 3 de noviembre de 2025
**Versión:** 1.0.0
