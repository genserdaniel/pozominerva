const { analyzeMultimedia } = require('./geminiAnalyzer');
const { promisePool } = require('../config/db');

/**
 * Analizar todos los archivos multimedia que no tienen análisis
 * Esta función se ejecuta al iniciar el servidor
 */
async function ensureMultimediaAnalysis() {
  try {
    // Buscar todos los mensajes con multimedia que no tienen análisis
    const [rows] = await promisePool.query(`
      SELECT id, media_type, media_url, media_filename
      FROM messages
      WHERE media_type != 'none'
      AND (media_analysis IS NULL OR media_analysis = '')
      ORDER BY created_at ASC
    `);

    if (rows.length === 0) {
      console.log('✅ Todos los archivos multimedia ya tienen análisis');
      return;
    }

    console.log(`📊 Encontrados ${rows.length} archivos multimedia sin análisis`);

    // Analizar cada archivo
    for (const row of rows) {
      try {
        console.log(`🎬 Analizando ${row.media_type}: ${row.media_filename || row.media_url}`);

        // Usar media_filename si existe, si no usar media_url (para archivos estáticos)
        const fileToAnalyze = row.media_filename || row.media_url;
        const mediaAnalysis = await analyzeMultimedia(fileToAnalyze, row.media_type);

        // Guardar el análisis en la base de datos
        await promisePool.query(
          'UPDATE messages SET media_analysis = ? WHERE id = ?',
          [mediaAnalysis, row.id]
        );

        console.log(`✅ Análisis completado para mensaje ID ${row.id}`);
      } catch (error) {
        console.error(`❌ Error analizando mensaje ID ${row.id}:`, error.message);
        // Continuar con el siguiente archivo
      }
    }

    console.log('✅ Análisis de multimedia completado');
  } catch (error) {
    console.error('❌ Error en ensureMultimediaAnalysis:', error);
  }
}

module.exports = {
  ensureMultimediaAnalysis
};
