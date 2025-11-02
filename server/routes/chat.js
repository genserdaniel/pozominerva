const express = require('express');
const router = express.Router();
const { openai, config, systemPrompt } = require('../config/openai');
const ChatSession = require('../models/ChatSession');
const { loadPDFContext } = require('../utils/pdfContext');

let pdfContextLoaded = false;
let pdfContext = '';

// Cargar contexto del PDF al iniciar
(async () => {
  try {
    pdfContext = await loadPDFContext();
    pdfContextLoaded = true;
  } catch (error) {
    console.error('Error cargando contexto PDF:', error);
  }
})();

// POST /api/chat - Enviar mensaje al chat
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Validación
    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere mensaje y sessionId'
      });
    }

    if (message.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje es demasiado corto'
      });
    }

    // Verificar límite de mensajes
    const messageLimit = parseInt(process.env.CHAT_MESSAGE_LIMIT) || 5;
    const hasReachedLimit = await ChatSession.hasReachedLimit(sessionId, messageLimit);

    if (hasReachedLimit) {
      return res.status(429).json({
        success: false,
        message: `Has alcanzado el límite de ${messageLimit} preguntas por día. Por favor, intenta mañana.`,
        limitReached: true
      });
    }

    // Incrementar contador de mensajes
    await ChatSession.incrementMessageCount(sessionId);

    // Construir prompt con contexto
    const fullSystemPrompt = `${systemPrompt}

CONTEXTO DEL PROYECTO (información oficial):

${pdfContext}

---

Con base en esta información, responde la pregunta del vecino de forma clara y útil.`;

    // Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      messages: [
        {
          role: 'system',
          content: fullSystemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    const response = completion.choices[0].message.content;

    // Obtener sesión actualizada para devolver contador
    const session = await ChatSession.getOrCreate(sessionId);

    res.json({
      success: true,
      data: {
        response,
        messagesRemaining: messageLimit - session.message_count
      }
    });

  } catch (error) {
    console.error('Error en chat:', error);

    // Manejar errores específicos de OpenAI
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error al comunicarse con el servicio de IA',
        error: error.response.data?.error?.message || error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al procesar tu pregunta',
      error: error.message
    });
  }
});

// GET /api/chat/status/:sessionId - Obtener estado de la sesión
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messageLimit = parseInt(process.env.CHAT_MESSAGE_LIMIT) || 5;

    const session = await ChatSession.getOrCreate(sessionId);

    res.json({
      success: true,
      data: {
        messagesUsed: session.message_count,
        messagesRemaining: messageLimit - session.message_count,
        limitReached: session.message_count >= messageLimit
      }
    });
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de sesión',
      error: error.message
    });
  }
});

module.exports = router;
