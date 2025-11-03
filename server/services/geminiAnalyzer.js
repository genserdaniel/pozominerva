const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Inicializar Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Convertir archivo a base64 para Gemini
 */
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType
    }
  };
}

/**
 * Analizar imagen con Gemini
 * @param {string} filePath - Ruta absoluta al archivo de imagen
 * @param {string} mimeType - Tipo MIME de la imagen
 * @returns {Promise<string>} - Descripción de la imagen
 */
async function analyzeImage(filePath, mimeType) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

    const prompt = `Describe esta imagen de manera detallada y clara.
    Incluye qué objetos, personas o lugares puedes identificar,
    qué está sucediendo en la imagen, el contexto y cualquier detalle relevante.
    Responde en español.`;

    const imagePart = fileToGenerativePart(filePath, mimeType);

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini analizó imagen:', filePath);
    return text;

  } catch (error) {
    console.error('❌ Error analizando imagen con Gemini:', error);
    return '[Imagen - no se pudo analizar]';
  }
}

/**
 * Analizar video con Gemini
 * @param {string} filePath - Ruta absoluta al archivo de video
 * @param {string} mimeType - Tipo MIME del video
 * @returns {Promise<string>} - Descripción del video
 */
async function analyzeVideo(filePath, mimeType) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

    const prompt = `Describe este video de manera detallada.
    Incluye qué está sucediendo, quiénes aparecen, qué acciones se realizan,
    el contexto del video y cualquier detalle importante que puedas observar.
    Responde en español.`;

    const videoPart = fileToGenerativePart(filePath, mimeType);

    const result = await model.generateContent([prompt, videoPart]);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini analizó video:', filePath);
    return text;

  } catch (error) {
    console.error('❌ Error analizando video con Gemini:', error);
    return '[Video - no se pudo analizar]';
  }
}

/**
 * Transcribir audio con Gemini
 * @param {string} filePath - Ruta absoluta al archivo de audio
 * @param {string} mimeType - Tipo MIME del audio
 * @returns {Promise<string>} - Transcripción del audio
 */
async function transcribeAudio(filePath, mimeType) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

    const prompt = `Transcribe este audio de manera precisa.
    Incluye todo lo que se dice en el audio, manteniendo el orden y contexto.
    Si hay múltiples voces, indica cuando cambia el hablante si es posible.
    Responde en español.`;

    const audioPart = fileToGenerativePart(filePath, mimeType);

    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini transcribió audio:', filePath);
    return text;

  } catch (error) {
    console.error('❌ Error transcribiendo audio con Gemini:', error);
    return '[Audio - no se pudo transcribir]';
  }
}

/**
 * Analizar multimedia según el tipo
 * @param {string} mediaFilename - Nombre del archivo multimedia o URL relativa
 * @param {string} mediaType - Tipo de multimedia ('image', 'video', 'audio')
 * @returns {Promise<string>} - Análisis del contenido multimedia
 */
async function analyzeMultimedia(mediaFilename, mediaType) {
  try {
    let filePath;

    // Si comienza con '/', buscar en client/public (archivos estáticos)
    if (mediaFilename.startsWith('/')) {
      // Archivo estático en client/public (ej: /audio/podcast.mp3)
      filePath = path.join(__dirname, '../../client/public', mediaFilename);
    } else {
      // Archivo subido en server/uploads
      filePath = path.join(__dirname, '../uploads', mediaFilename);
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error('❌ Archivo no encontrado:', filePath);
      return '[Archivo multimedia no encontrado]';
    }

    // Determinar MIME type básico
    const ext = path.extname(mediaFilename).toLowerCase();
    let mimeType;

    switch (mediaType) {
      case 'image':
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.gif') mimeType = 'image/gif';
        else mimeType = 'image/jpeg'; // fallback

        return await analyzeImage(filePath, mimeType);

      case 'video':
        if (ext === '.mp4') mimeType = 'video/mp4';
        else if (ext === '.webm') mimeType = 'video/webm';
        else if (ext === '.mov') mimeType = 'video/mov';
        else if (ext === '.avi') mimeType = 'video/avi';
        else mimeType = 'video/mp4'; // fallback

        return await analyzeVideo(filePath, mimeType);

      case 'audio':
        if (ext === '.mp3') mimeType = 'audio/mpeg';
        else if (ext === '.wav') mimeType = 'audio/wav';
        else if (ext === '.ogg') mimeType = 'audio/ogg';
        else if (ext === '.aac') mimeType = 'audio/aac';
        else if (ext === '.flac') mimeType = 'audio/flac';
        else mimeType = 'audio/mpeg'; // fallback

        return await transcribeAudio(filePath, mimeType);

      default:
        return '[Tipo de multimedia no soportado]';
    }

  } catch (error) {
    console.error('❌ Error general en analyzeMultimedia:', error);
    return '[Error analizando multimedia]';
  }
}

module.exports = {
  analyzeImage,
  analyzeVideo,
  transcribeAudio,
  analyzeMultimedia
};
