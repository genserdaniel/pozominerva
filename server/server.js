const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const corsMiddleware = require('./middleware/cors');
const { testConnection } = require('./config/db');
const { startBotAnalyzer } = require('./services/botAnalyzer');
const { ensureMultimediaAnalysis } = require('./services/ensureMultimediaAnalysis');

// Importar rutas
const commentsRouter = require('./routes/comments');
const chatRouter = require('./routes/chat');
const pdfsRouter = require('./routes/pdfs');
const messagesRouter = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Servir archivos estáticos (PDFs, etc.) desde client/public
app.use('/public', express.static(path.join(__dirname, '../client/public')));

// Servir archivos subidos (imágenes, audios, videos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api/comments', commentsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/pdfs', pdfsRouter);
app.use('/api/messages', messagesRouter);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API del Pozo de Minerva',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      comments: '/api/comments',
      chat: '/api/chat',
      pdfs: '/api/pdfs'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Test de conexión a base de datos
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.warn('⚠️ No se pudo conectar a la base de datos. El servidor continuará pero algunas funciones no estarán disponibles.');
    }

    // Iniciar servicios si la BD está conectada (ANTES de app.listen)
    if (dbConnected) {
      // Analizar todos los archivos multimedia que no tienen análisis
      await ensureMultimediaAnalysis();

      // Iniciar PozoBot analizador automático
      startBotAnalyzer();
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('🚀 Servidor Pozo de Minerva');
      console.log('═══════════════════════════════════════════');
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`💾 Base de datos: ${dbConnected ? '✅ Conectada' : '❌ No conectada'}`);
      console.log('═══════════════════════════════════════════');
      console.log('');
      console.log('Endpoints disponibles:');
      console.log(`  GET  http://localhost:${PORT}/api/health`);
      console.log(`  GET  http://localhost:${PORT}/api/comments`);
      console.log(`  POST http://localhost:${PORT}/api/comments`);
      console.log(`  PUT  http://localhost:${PORT}/api/comments/:id/like`);
      console.log(`  POST http://localhost:${PORT}/api/chat`);
      console.log(`  GET  http://localhost:${PORT}/api/chat/status/:sessionId`);
      console.log(`  GET  http://localhost:${PORT}/api/pdfs`);
      console.log(`  GET  http://localhost:${PORT}/api/messages`);
      console.log(`  POST http://localhost:${PORT}/api/messages`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
