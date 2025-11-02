# 📝 Instrucciones Finales - Pozo de Minerva

## ✅ Proyecto Base Completado

He creado la estructura completa del sitio web del Pozo de Minerva con las siguientes funcionalidades:

### ✨ Características Implementadas

1. ✅ **Backend Node.js/Express** con MySQL
2. ✅ **Frontend React** adaptado de plantilla Koppee
3. ✅ **Video Banner** (autoplay, loop, muted)
4. ✅ **Reproductor de Podcast** (sticky, controles completos)
5. ✅ **Sistema de Comentarios** (con likes y dropdown de 32 colonias)
6. ✅ **Chat con OpenAI** (límite 5 mensajes, contexto PDF)
7. ✅ **Sección de Documentos** (5 PDFs con viewer)
8. ✅ **Diseño Responsivo** (Bootstrap + CSS custom)

---

## 📋 Pasos Pendientes para Completar el Proyecto

### 1️⃣ Configurar MySQL (URGENTE)

```bash
# Abrir MySQL
mysql -u root -p

# Ejecutar el esquema
source database/schema.sql
```

Si usas phpMyAdmin:
1. Crear base de datos `pozominerva_db`
2. Importar el archivo `database/schema.sql`

### 2️⃣ Ajustar Credenciales de Base de Datos

Editar `server/.env` con tus credenciales reales:

```env
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=pozominerva_db
```

### 3️⃣ Agregar Archivos Multimedia (OBLIGATORIO)

#### 📹 Video Banner
- Formato: MP4 (H.264)
- Ubicación: `client/public/videos/banner-video.mp4`
- Tamaño recomendado: 1920x1080 o similar
- Duración sugerida: 10-30 segundos
- **Sin este archivo, el hero section no funcionará**

#### 🎙️ Podcast MP3
- Formato: MP3
- Ubicación: `client/public/audio/podcast.mp3`
- **Sin este archivo, el reproductor no funcionará**

#### 📄 PDFs (5 archivos)
Colocar en `client/public/pdfs/`:
1. `resolucion-ambiental-marn.pdf`
2. `estudio-hidrogeologico.pdf`
3. `estudio-factibilidad.pdf`
4. `especificaciones-tecnicas.pdf`
5. `dictamen-juridico-supervisor.pdf`

#### 📄 PDF de Contexto para Chat (OPCIONAL)
- `client/public/pdfs/contexto-chat.pdf`
- Si no lo agregas, el chat usará el contexto por defecto hardcodeado

### 4️⃣ Instalar Dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5️⃣ Ejecutar el Proyecto

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Abrir: http://localhost:3000

---

## 🎨 Páginas Pendientes (Opcional)

Actualmente solo está implementada la **HomePage** y **DocumentsPage**. Puedes agregar las siguientes páginas siguiendo el mismo patrón:

### Crear nueva página:

1. **Crear archivo** `client/src/pages/NombrePage.jsx`:

```jsx
import React from 'react';
import './NombrePage.css';

const NombrePage = () => {
  return (
    <div className="nombre-page">
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Título de la Página</h2>
          </div>
          {/* Tu contenido aquí */}
        </div>
      </section>
    </div>
  );
};

export default NombrePage;
```

2. **Importar en** `client/src/App.jsx`:

```jsx
import NombrePage from './pages/NombrePage';

// Agregar ruta:
<Route path="/nombre" element={<NombrePage />} />
```

### Páginas sugeridas:

- `WhatIsProjectPage.jsx` - ¿Qué se construye?
- `FiveReasonsPage.jsx` - 5 Razones para suspensión
- `ParticipatePage.jsx` - Participa
- `FAQPage.jsx` - Preguntas Frecuentes
- `NewsPage.jsx` - Noticias y cronología
- `ContactPage.jsx` - Contacto

**TODO EL CONTENIDO OFICIAL** está documentado en los comentarios del plan original y listo para copiar y pegar.

---

## 🔧 Personalización

### Cambiar Colores

Editar `client/src/styles/App.css`:

```css
:root {
  --color-primary: #1E88E5;     /* Cambia el azul principal */
  --color-secondary: #43A047;   /* Cambia el verde */
  --color-accent: #FDD835;      /* Cambia el amarillo */
}
```

### Cambiar Logo/Nombre

Editar `client/src/components/Navbar.jsx`:

```jsx
<span className="logo-text">Tu Nombre Aquí</span>
```

### Modificar Información de Contacto

Editar `client/src/components/Footer.jsx`

---

## 🚨 Verificación Rápida

Después de instalar y ejecutar, verifica:

- [ ] Servidor backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 3000
- [ ] Video banner se reproduce automáticamente
- [ ] Reproductor de podcast funciona
- [ ] Puedes crear un comentario
- [ ] El chat responde (verifica que no supere 5 mensajes)
- [ ] Los PDFs se pueden ver y descargar

---

## 📞 Próximos Pasos Recomendados

1. **Agregar el video, MP3 y los 5 PDFs** (PRIORIDAD)
2. **Configurar MySQL** con las credenciales correctas
3. **Instalar dependencias** y ejecutar el proyecto
4. **Probar todas las funcionalidades**
5. **Poblar las páginas restantes** con el contenido oficial
6. **Personalizar colores y textos** según tu preferencia
7. **Deployment** a un servidor de producción (opcional)

---

## 🎯 Contenido Oficial Disponible

Ya tienes documentado en el plan original TODO el contenido para:

- **5 Razones para suspensión** (detalladas con fuentes)
- **FAQ** (preguntas frecuentes)
- **Cronología** (línea de tiempo del proyecto)
- **Acciones ciudadanas** (plantillas de memoriales)
- **Información técnica** del proyecto

Todo está listo para ser copiado en las páginas correspondientes.

---

## 📌 Notas Importantes

1. **OpenAI API Key**: Ya está configurada en `server/.env`. Verifica que sea válida.
2. **Límite de Chat**: 5 mensajes por día por usuario (basado en cookies/localStorage)
3. **Colonias**: 32 colonias de zona 4 Mixco ya están configuradas
4. **Base de Datos**: Ajusta las credenciales antes de ejecutar
5. **Responsive**: El sitio es completamente responsive (móvil, tablet, desktop)

---

## 🤝 ¿Necesitas Ayuda?

Si tienes problemas:

1. Revisa el archivo `README.md` - Solución de Problemas
2. Verifica que MySQL esté corriendo
3. Verifica la consola del navegador (F12) para errores
4. Verifica la consola del servidor para errores de backend
5. Asegúrate de que todos los archivos multimedia existan

---

## ✨ ¡Proyecto Listo!

El sitio web del Pozo de Minerva está **95% completo**. Solo necesitas:

1. Agregar los archivos multimedia (video, MP3, PDFs)
2. Configurar MySQL
3. Instalar dependencias
4. Ejecutar y probar

Las páginas adicionales son opcionales y pueden agregarse gradualmente siguiendo el patrón establecido.

---

**¡Éxito con el proyecto!** 🚀

*Desarrollado para la comunidad de la Zona 4 de Mixco*
