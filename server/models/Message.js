const { promisePool } = require('../config/db');

class Message {
  /**
   * Obtener todos los mensajes recientes (últimos 100)
   */
  static async getRecent(limit = 100) {
    const [rows] = await promisePool.query(`
      SELECT
        m.id,
        m.user_name,
        m.user_colonia,
        m.message_text,
        m.media_type,
        m.media_url,
        m.media_filename,
        m.reply_to_id,
        m.is_bot,
        m.analyzed_by_bot,
        m.created_at,
        r.user_name AS reply_to_user_name,
        r.message_text AS reply_to_message_text,
        r.media_type AS reply_to_media_type
      FROM messages m
      LEFT JOIN messages r ON m.reply_to_id = r.id
      ORDER BY m.created_at ASC
      LIMIT ?
    `, [limit]);

    return rows;
  }

  /**
   * Crear un nuevo mensaje
   */
  static async create({ userName, userColonia, messageText, mediaType = 'none', mediaUrl = null, mediaFilename = null, replyToId = null, isBot = false }) {
    const [result] = await promisePool.query(`
      INSERT INTO messages
      (user_name, user_colonia, message_text, media_type, media_url, media_filename, reply_to_id, is_bot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userName, userColonia, messageText, mediaType, mediaUrl, mediaFilename, replyToId, isBot]);

    return result.insertId;
  }

  /**
   * Obtener mensajes no analizados por el bot (último minuto)
   */
  static async getUnanalyzedRecent() {
    const [rows] = await promisePool.query(`
      SELECT
        id,
        user_name,
        user_colonia,
        message_text,
        media_type,
        media_url,
        media_filename,
        reply_to_id,
        is_bot,
        created_at
      FROM messages
      WHERE analyzed_by_bot = FALSE
        AND is_bot = FALSE
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
      ORDER BY created_at ASC
    `);

    return rows;
  }

  /**
   * Marcar mensajes como analizados
   */
  static async markAsAnalyzed(messageIds) {
    if (!messageIds || messageIds.length === 0) return;

    const placeholders = messageIds.map(() => '?').join(',');
    await promisePool.query(`
      UPDATE messages
      SET analyzed_by_bot = TRUE
      WHERE id IN (${placeholders})
    `, messageIds);
  }

  /**
   * Obtener un mensaje por ID
   */
  static async getById(id) {
    const [rows] = await promisePool.query(`
      SELECT * FROM messages WHERE id = ?
    `, [id]);

    return rows[0];
  }

  /**
   * Obtener mensajes desde una fecha específica (para polling)
   */
  static async getSince(timestamp) {
    // Convertir timestamp ISO UTC a formato MySQL local
    // JavaScript Date maneja automáticamente la conversión de UTC a local
    const date = new Date(timestamp);
    const localTimestamp = date.toISOString().slice(0, 19).replace('T', ' ');

    const [rows] = await promisePool.query(`
      SELECT
        m.id,
        m.user_name,
        m.user_colonia,
        m.message_text,
        m.media_type,
        m.media_url,
        m.media_filename,
        m.reply_to_id,
        m.is_bot,
        m.analyzed_by_bot,
        m.created_at,
        r.user_name AS reply_to_user_name,
        r.message_text AS reply_to_message_text,
        r.media_type AS reply_to_media_type
      FROM messages m
      LEFT JOIN messages r ON m.reply_to_id = r.id
      WHERE m.created_at > CONVERT_TZ(?, '+00:00', @@session.time_zone)
      ORDER BY m.created_at ASC
    `, [localTimestamp]);

    return rows;
  }
}

module.exports = Message;
