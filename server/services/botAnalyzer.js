const Message = require('../models/Message');
const { openai, config, systemPrompt } = require('../config/openai');
const { loadPDFContext } = require('../utils/pdfContext');

let isAnalyzing = false;
let pdfContext = '';

// Cargar contexto del PDF al iniciar
(async () => {
  try {
    pdfContext = await loadPDFContext();
    console.log('✅ Contexto PDF cargado para PozoBot');
  } catch (error) {
    console.error('❌ Error cargando contexto PDF para PozoBot:', error);
  }
})();

/**
 * Analizar mensajes recientes y responder si es necesario
 */
async function analyzeRecentMessages() {
  if (isAnalyzing) {
    console.log('⏭️  ⚠️  TIMER ACTIVADO: PozoBot todavía está ocupado, ignorando ciclo hasta que termine...');
    return;
  }

  try {
    // Obtener mensajes no analizados del último minuto
    const messages = await Message.getUnanalyzedRecent();

    if (messages.length === 0) {
      return; // No hay mensajes nuevos - NO activamos el indicador
    }

    // SOLO activar el indicador cuando HAY mensajes que procesar
    isAnalyzing = true;

    console.log(`🤖 PozoBot analizando ${messages.length} mensaje(s)...`);

    // Bitácora: Mostrar mensajes que se van a procesar
    console.log('📋 BITÁCORA - Mensajes a procesar:');
    messages.forEach((msg, index) => {
      const preview = msg.message_text ?
        (msg.message_text.length > 50 ? msg.message_text.substring(0, 50) + '...' : msg.message_text) :
        '[archivo multimedia]';
      console.log(`   ${index + 1}. [ID: ${msg.id}] ${msg.user_name} (${msg.user_colonia}): ${preview}`);
    });
    console.log('---');

    // Crear resumen de los mensajes
    const messagesSummary = messages.map(m => {
      return `[${m.user_name} (${m.user_colonia})]: ${m.message_text || '[archivo multimedia]'}`;
    }).join('\n');

    // Crear prompt para la IA
    const analysisPrompt = `${systemPrompt}

CONTEXTO DEL PROYECTO (información oficial):

${pdfContext}

---

NUEVOS MENSAJES EN EL CHAT GRUPAL:

${messagesSummary}

---

INSTRUCCIONES:
Has detectado ${messages.length} mensaje(s) nuevo(s) en el chat grupal comunitario.

DEBES RESPONDER a cualquier pregunta sobre el proyecto del Pozo de Minerva, incluyendo:
- Preguntas sobre ubicación, colonias afectadas, costos, plazos
- Preguntas sobre impacto ambiental, permisos, aspectos legales
- Dudas sobre procedimientos, contratación, o aspectos técnicos
- Menciones de rumores o información incorrecta

SOLO NO respondas si:
- Son saludos simples ("hola", "buenos días") sin preguntas
- Son conversaciones personales entre vecinos sin relación al proyecto
- Son comentarios de opinión SIN preguntas

Si decides NO responder, di exactamente: "NO_RESPONDER"

Si decides responder, escribe tu mensaje siguiendo estas reglas:
- Máximo 2-3 párrafos cortos
- Tono moderador y crítico
- Usa "supuestamente" para información oficial
- Menciona al menos uno de los 5 puntos de preocupación
- Sé directo y sin rodeos
- Responde SIEMPRE las preguntas directas`;

    // Llamar a OpenAI para análisis
    console.log('🔄 Llamando a OpenAI...');
    const completion = await openai.chat.completions.create({
      model: config.model,
      temperature: 1,
      max_completion_tokens: 2000, // Suficiente para respuestas completas
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });

    // Bitácora completa de la respuesta de OpenAI
    console.log('📊 RESPUESTA COMPLETA DE OPENAI:');
    console.log('   Modelo usado:', completion.model);
    console.log('   Tokens prompt:', completion.usage.prompt_tokens);
    console.log('   Tokens respuesta:', completion.usage.completion_tokens);
    console.log('   Tokens totales:', completion.usage.total_tokens);
    console.log('   Finish reason:', completion.choices[0].finish_reason);

    const botResponse = completion.choices[0].message.content.trim();

    // Bitácora: Mostrar respuesta de la IA
    console.log('💬 RESPUESTA DE LA IA:');
    console.log(botResponse);
    console.log('   Longitud:', botResponse.length, 'caracteres');
    console.log('---');

    // Marcar mensajes como analizados
    const messageIds = messages.map(m => m.id);
    await Message.markAsAnalyzed(messageIds);

    // Si decide responder, crear el mensaje del bot
    if (botResponse !== 'NO_RESPONDER' && botResponse.length > 0) {
      await Message.create({
        userName: 'PozoBot',
        userColonia: 'Sistema',
        messageText: botResponse,
        mediaType: 'none',
        mediaUrl: null,
        mediaFilename: null,
        replyToId: null,
        isBot: true
      });

      console.log('🤖 PozoBot respondió en el chat');
    } else {
      console.log('🤖 PozoBot decidió no responder');
    }

  } catch (error) {
    console.error('❌ Error en análisis de PozoBot:', error);
  } finally {
    // Mantener el indicador "escribiendo..." visible por 3 segundos más
    // para que el frontend tenga tiempo de mostrarlo
    setTimeout(() => {
      isAnalyzing = false;
      console.log('✅ PozoBot terminó el análisis');
    }, 3000); // 3 segundos de delay
  }
}

/**
 * Iniciar el analizador automático (cada 30 segundos)
 */
function startBotAnalyzer() {
  console.log('🤖 PozoBot iniciado - Analizará mensajes cada 30 segundos');

  // Ejecutar inmediatamente la primera vez
  analyzeRecentMessages();

  // Luego cada 30 segundos
  setInterval(analyzeRecentMessages, 30000); // 30 segundos
}

/**
 * Verificar si el bot está escribiendo actualmente
 */
function isBotTyping() {
  return isAnalyzing;
}

module.exports = {
  startBotAnalyzer,
  analyzeRecentMessages,
  isBotTyping
};
