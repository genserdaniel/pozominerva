const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message');
const Reaction = require('../models/Reaction');
const { isBotTyping } = require('../services/botAnalyzer');
const { setUserTyping, removeUserTyping, getTypingUsers } = require('../services/typingTracker');
const { setUserActive, getActiveUsers, getActiveUsersCount } = require('../services/activeUsersTracker');
const { promisePool } = require('../config/db');

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
    let mediaAnalysis = null;

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

      // NO analizar inmediatamente - PozoBot lo hará de forma asíncrona
      console.log(`📤 Multimedia subida (${mediaType}): ${mediaFilename} - PozoBot la analizará`);
    }

    // Crear mensaje
    const messageId = await Message.create({
      userName,
      userColonia,
      messageText: messageText || '',
      mediaType,
      mediaUrl,
      mediaFilename,
      mediaAnalysis,
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

/**
 * POST /api/messages/:messageId/reactions
 * Agregar o actualizar reacción a un mensaje
 */
router.post('/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userName, userColonia, emoji } = req.body;

    // Validación
    if (!userName || !userColonia || !emoji) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userName, userColonia y emoji'
      });
    }

    // Verificar que el mensaje existe
    const message = await Message.getById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Agregar o actualizar reacción
    await Reaction.addOrUpdate({
      messageId,
      userName,
      userColonia,
      emoji
    });

    // Obtener reacciones actualizadas del mensaje
    const reactions = await Reaction.getByMessage(messageId);

    res.json({
      success: true,
      data: reactions
    });

  } catch (error) {
    console.error('Error agregando reacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar reacción',
      error: error.message
    });
  }
});

/**
 * DELETE /api/messages/:messageId/reactions
 * Eliminar reacción de un usuario
 */
router.delete('/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userName } = req.body;

    // Validación
    if (!userName) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userName'
      });
    }

    // Eliminar reacción
    await Reaction.remove({ messageId, userName });

    // Obtener reacciones actualizadas del mensaje
    const reactions = await Reaction.getByMessage(messageId);

    res.json({
      success: true,
      data: reactions
    });

  } catch (error) {
    console.error('Error eliminando reacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reacción',
      error: error.message
    });
  }
});

/**
 * GET /api/messages/:messageId/reactions
 * Obtener reacciones de un mensaje
 */
router.get('/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const reactions = await Reaction.getByMessage(messageId);

    res.json({
      success: true,
      data: reactions
    });

  } catch (error) {
    console.error('Error obteniendo reacciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reacciones',
      error: error.message
    });
  }
});

/**
 * POST /api/messages/typing/start
 * Notificar que un usuario está escribiendo
 */
router.post('/typing/start', (req, res) => {
  try {
    const { userName, userColonia } = req.body;

    if (!userName || !userColonia) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userName y userColonia'
      });
    }

    setUserTyping(userName, userColonia);

    res.json({
      success: true,
      message: 'Estado de escritura actualizado'
    });
  } catch (error) {
    console.error('Error actualizando estado de escritura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
});

/**
 * POST /api/messages/typing/stop
 * Notificar que un usuario dejó de escribir
 */
router.post('/typing/stop', (req, res) => {
  try {
    const { userName, userColonia } = req.body;

    if (!userName || !userColonia) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userName y userColonia'
      });
    }

    removeUserTyping(userName, userColonia);

    res.json({
      success: true,
      message: 'Estado de escritura removido'
    });
  } catch (error) {
    console.error('Error removiendo estado de escritura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover estado',
      error: error.message
    });
  }
});

/**
 * GET /api/messages/typing
 * Obtener lista de usuarios escribiendo actualmente
 */
router.get('/typing', (req, res) => {
  try {
    const typingUsers = getTypingUsers();

    res.json({
      success: true,
      data: typingUsers
    });
  } catch (error) {
    console.error('Error obteniendo usuarios escribiendo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios escribiendo',
      error: error.message
    });
  }
});

/**
 * POST /api/messages/active/heartbeat
 * Registrar que un usuario está activo (heartbeat)
 */
router.post('/active/heartbeat', (req, res) => {
  try {
    const { userName, userColonia } = req.body;

    if (!userName || !userColonia) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere userName y userColonia'
      });
    }

    setUserActive(userName, userColonia);

    res.json({
      success: true,
      message: 'Heartbeat registrado'
    });
  } catch (error) {
    console.error('Error registrando heartbeat:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar heartbeat',
      error: error.message
    });
  }
});

/**
 * GET /api/messages/active
 * Obtener lista de usuarios activos
 */
router.get('/active', (req, res) => {
  try {
    const activeUsers = getActiveUsers();

    res.json({
      success: true,
      data: activeUsers
    });
  } catch (error) {
    console.error('Error obteniendo usuarios activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios activos',
      error: error.message
    });
  }
});

/**
 * GET /api/messages/active/count
 * Obtener cantidad de usuarios activos
 */
router.get('/active/count', (req, res) => {
  try {
    const count = getActiveUsersCount();

    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error obteniendo cantidad de usuarios activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cantidad',
      error: error.message
    });
  }
});

/**
 * GET /api/messages/podcast/id
 * Obtener el ID del mensaje del podcast
 */
router.get('/podcast/id', async (req, res) => {
  try {
    // Buscar el mensaje del podcast
    const [rows] = await promisePool.query(`
      SELECT id FROM messages
      WHERE user_name = 'Pozo Minerva'
      AND user_colonia = 'Información'
      AND media_type = 'audio'
      ORDER BY created_at ASC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el mensaje del podcast'
      });
    }

    res.json({
      success: true,
      podcastMessageId: rows[0].id
    });
  } catch (error) {
    console.error('Error obteniendo ID del podcast:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ID del podcast',
      error: error.message
    });
  }
});

module.exports = router;
