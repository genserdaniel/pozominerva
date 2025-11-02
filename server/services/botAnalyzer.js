const Message = require('../models/Message');
const { openai, config, systemPrompt } = require('../config/openai');
const { loadPDFContext } = require('../utils/pdfContext');
const { analyzeMultimedia } = require('./geminiAnalyzer');

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
    const newMessages = await Message.getUnanalyzedRecent();

    if (newMessages.length === 0) {
      return; // No hay mensajes nuevos - NO activamos el indicador
    }

    // SOLO activar el indicador cuando HAY mensajes que procesar
    isAnalyzing = true;

    console.log(`🤖 PozoBot analizando ${newMessages.length} mensaje(s)...`);

    // Obtener últimos 20 mensajes para contexto
    const recentMessages = await Message.getRecent(20);

    // Bitácora: Mostrar mensajes que se van a procesar
    console.log('📋 BITÁCORA - Mensajes NUEVOS a procesar:');
    newMessages.forEach((msg, index) => {
      const preview = msg.message_text ?
        (msg.message_text.length > 50 ? msg.message_text.substring(0, 50) + '...' : msg.message_text) :
        '[archivo multimedia]';
      const replyInfo = msg.reply_to_id ?
        ` (respondiendo a ID ${msg.reply_to_id}: ${msg.reply_to_user_name})` : '';
      console.log(`   ${index + 1}. [ID: ${msg.id}] ${msg.user_name} (${msg.user_colonia}): ${preview}${replyInfo}`);
    });
    console.log('---');

    // Función para formatear un mensaje completo con toda su información
    const formatMessageComplete = (msg) => {
      let content = msg.message_text || '';

      // Si tiene multimedia, usar análisis guardado en metadata
      if (msg.media_type !== 'none' && msg.media_filename) {
        let analysis;

        // Usar análisis ya guardado en la BD
        if (msg.media_analysis) {
          analysis = msg.media_analysis;
          console.log(`   📦 Usando análisis guardado en metadata: ${msg.media_filename}`);
        } else {
          // Fallback: si no tiene análisis (mensajes antiguos)
          analysis = '[multimedia sin analizar]';
          console.log(`   ⚠️  Mensaje sin análisis en metadata: ${msg.media_filename}`);
        }

        if (content) {
          content = `${content}\n[${msg.media_type.toUpperCase()}: ${analysis}]`;
        } else {
          content = `[${msg.media_type.toUpperCase()}: ${analysis}]`;
        }
      }

      // Formatear fecha completa
      const date = new Date(msg.created_at);
      const dateStr = date.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const timeStr = date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

      return `[${dateStr} ${timeStr}] ${msg.user_name} (${msg.user_colonia}): ${content}`;
    };

    // Función para obtener la cadena completa de respuestas recursivamente
    const getReplyChain = async (message) => {
      const chain = [];
      let currentMsg = message;

      // Seguir la cadena de respuestas hacia atrás hasta 5 niveles
      for (let i = 0; i < 5 && currentMsg.reply_to_id; i++) {
        const parentMsg = await Message.getById(currentMsg.reply_to_id);
        if (parentMsg) {
          // Guardar toda la información del mensaje
          chain.push(parentMsg);
          currentMsg = parentMsg;
        } else {
          break;
        }
      }

      return chain;
    };

    // Función para procesar mensajes de CONTEXTO (sin analizar multimedia de nuevo)
    const processContextMessage = (m) => {
      let content = m.message_text || '';

      // Para mensajes de contexto, solo mencionar que hay multimedia sin analizarlo
      if (m.media_type !== 'none' && m.media_filename) {
        if (content) {
          content = `${content} [${m.media_type}]`;
        } else {
          content = `[${m.media_type}]`;
        }
      }

      // Agregar información de respuesta si existe
      let prefix = '';
      if (m.reply_to_id && m.reply_to_user_name) {
        const replyText = m.reply_to_message_text || '[multimedia]';
        prefix = `(respondiendo a ${m.reply_to_user_name}: "${replyText}") `;
      }

      // Formatear fecha completa
      const date = new Date(m.created_at);
      const dateStr = date.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const timeStr = date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

      return `[${dateStr} ${timeStr}] ${m.user_name} (${m.user_colonia}): ${prefix}${content}`;
    };

    // Función para procesar mensajes NUEVOS (usando metadata)
    const processNewMessage = async (m) => {
      let content = m.message_text || '';

      // Usar análisis ya guardado en metadata
      if (m.media_type !== 'none' && m.media_filename) {
        let analysis;

        if (m.media_analysis) {
          analysis = m.media_analysis;
          console.log(`   📦 Usando análisis guardado en metadata: ${m.media_filename}`);
        } else {
          // Fallback: si no tiene análisis (mensajes antiguos)
          analysis = '[multimedia sin analizar]';
          console.log(`   ⚠️  Mensaje sin análisis en metadata: ${m.media_filename}`);
        }

        // Si hay texto Y multimedia, combinar ambos
        if (content) {
          content = `${content}\n[${m.media_type.toUpperCase()}: ${analysis}]`;
        } else {
          content = `[${m.media_type.toUpperCase()}: ${analysis}]`;
        }
      }

      // Formatear fecha completa del mensaje actual
      const date = new Date(m.created_at);
      const dateStr = date.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const timeStr = date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

      // Construir el mensaje principal
      let result = `[${dateStr} ${timeStr}] ${m.user_name} (${m.user_colonia}): ${content}`;

      // Obtener cadena completa de respuestas recursivamente
      if (m.reply_to_id) {
        const replyChain = await getReplyChain(m);

        if (replyChain.length > 0) {
          // Formatear cada mensaje de la cadena con toda su información
          const chainFormatted = replyChain.reverse().map(msg => formatMessageComplete(msg));
          const chainText = chainFormatted.join('\n   → ');

          // Agregar el contexto DESPUÉS del mensaje principal
          result += `\n\n   Respondiendo a:\n   → ${chainText}`;

          console.log(`   🔗 Cadena de respuestas detectada con ${replyChain.length} nivel(es):`);
          chainFormatted.forEach((formattedMsg, idx) => {
            console.log(`      ${idx + 1}. ${formattedMsg}`);
          });
        }
      }

      return result;
    };

    // Procesar mensajes de contexto SIN analizar multimedia
    const contextSummary = recentMessages.map(processContextMessage).join('\n');

    // Procesar mensajes nuevos CON análisis de multimedia
    const newMessagesSummaryPromises = newMessages.map(processNewMessage);
    const newMessagesSummary = (await Promise.all(newMessagesSummaryPromises)).join('\n');

    // Crear prompt para la IA
    const analysisPrompt = `${systemPrompt}

CONTEXTO DEL PROYECTO (información oficial):

${pdfContext}

---

HISTORIAL RECIENTE DEL CHAT (últimos ${recentMessages.length} mensajes para contexto):

${contextSummary}

---

MENSAJES NUEVOS QUE DEBES ANALIZAR:

${newMessagesSummary}

---

INSTRUCCIONES:
Has detectado ${newMessages.length} mensaje(s) nuevo(s) en el chat grupal comunitario.
Lee el HISTORIAL RECIENTE para entender el contexto de la conversación.

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

Si decides responder:
1. Busca la información específica en el CONTEXTO DEL PROYECTO para responder la pregunta
2. Escribe tu respuesta de máximo 2-3 párrafos cortos
3. Usa tono moderador y crítico
4. Usa "supuestamente" para información oficial
5. Sé directo y sin rodeos
6. SIEMPRE cierra vinculando a UNO de los 5 puntos de preocupación que mejor encaje con la pregunta`;

    // Mostrar el prompt completo que se enviará a OpenAI
    console.log('📝 PROMPT COMPLETO A ENVIAR A OPENAI:');
    console.log('─'.repeat(80));
    console.log(analysisPrompt);
    console.log('─'.repeat(80));

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

    // Marcar mensajes NUEVOS como analizados
    const messageIds = newMessages.map(m => m.id);
    await Message.markAsAnalyzed(messageIds);

    // Si decide responder, crear el mensaje del bot
    if (botResponse !== 'NO_RESPONDER' && botResponse.length > 0) {
      // Responder al último mensaje analizado para mantener la cadena
      const lastMessageId = newMessages[newMessages.length - 1].id;

      await Message.create({
        userName: 'PozoBot',
        userColonia: 'Sistema',
        messageText: botResponse,
        mediaType: 'none',
        mediaUrl: null,
        mediaFilename: null,
        replyToId: lastMessageId,  // Responder al último mensaje
        isBot: true
      });

      console.log(`🤖 PozoBot respondió en el chat (respondiendo a mensaje ID ${lastMessageId})`);
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
