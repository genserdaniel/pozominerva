const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message');
const { isBotTyping } = require('../services/botAnalyzer');

// Crear directorio para uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Permitir solo ciertos tipos de archivos
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo imágenes, audios y videos.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  }
});

// GET /api/messages - Obtener mensajes recientes
router.get('/', async (req, res) => {
  try {
    const messages = await Message.getRecent(100);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes',
      error: error.message
    });
  }
});

// GET /api/messages/since/:timestamp - Obtener mensajes desde timestamp (polling)
router.get('/since/:timestamp', async (req, res) => {
  try {
    const { timestamp } = req.params;
    const messages = await Message.getSince(timestamp);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes',
      error: error.message
    });
  }
});

// POST /api/messages - Enviar nuevo mensaje (con o sin multimedia)
router.post('/', upload.single('media'), async (req, res) => {
  try {
    const { userName, userColonia, messageText, replyToId } = req.body;

    // Validación
    if (!userName || !userColonia) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere nombre y colonia'
      });
    }

    if (!messageText && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere texto o archivo multimedia'
      });
    }

    // Determinar tipo de media
    let mediaType = 'none';
    let mediaUrl = null;
    let mediaFilename = null;

    if (req.file) {
      mediaFilename = req.file.filename;
      mediaUrl = `/uploads/${req.file.filename}`;

      if (req.file.mimetype.startsWith('image/')) {
        mediaType = 'image';
      } else if (req.file.mimetype.startsWith('audio/')) {
        mediaType = 'audio';
      } else if (req.file.mimetype.startsWith('video/')) {
        mediaType = 'video';
      }
    }

    // Crear mensaje
    const messageId = await Message.create({
      userName,
      userColonia,
      messageText: messageText || '',
      mediaType,
      mediaUrl,
      mediaFilename,
      replyToId: replyToId || null,
      isBot: false
    });

    // Obtener el mensaje creado
    const message = await Message.getById(messageId);

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error creando mensaje:', error);

    // Eliminar archivo si hubo error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error eliminando archivo:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje',
      error: error.message
    });
  }
});

/**
 * GET /api/messages/bot/typing
 * Verificar si el bot está escribiendo
 */
router.get('/bot/typing', (req, res) => {
  res.json({
    success: true,
    isTyping: isBotTyping()
  });
});

module.exports = router;
