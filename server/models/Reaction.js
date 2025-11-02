const { promisePool } = require('../config/db');

class Reaction {
  /**
   * Agregar o actualizar reacción de un usuario a un mensaje
   */
  static async addOrUpdate({ messageId, userName, userColonia, emoji }) {
    // Usar INSERT ... ON DUPLICATE KEY UPDATE para actualizar si ya existe
    const [result] = await promisePool.query(`
      INSERT INTO message_reactions
      (message_id, user_name, user_colonia, emoji)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        emoji = VALUES(emoji),
        created_at = CURRENT_TIMESTAMP
    `, [messageId, userName, userColonia, emoji]);

    return result.insertId || result.affectedRows;
  }

  /**
   * Eliminar reacción de un usuario
   */
  static async remove({ messageId, userName }) {
    const [result] = await promisePool.query(`
      DELETE FROM message_reactions
      WHERE message_id = ? AND user_name = ?
    `, [messageId, userName]);

    return result.affectedRows;
  }

  /**
   * Obtener todas las reacciones de un mensaje agrupadas por emoji
   */
  static async getByMessage(messageId) {
    const [rows] = await promisePool.query(`
      SELECT
        emoji,
        COUNT(*) as count,
        GROUP_CONCAT(user_name ORDER BY created_at) as users
      FROM message_reactions
      WHERE message_id = ?
      GROUP BY emoji
      ORDER BY count DESC
    `, [messageId]);

    return rows;
  }

  /**
   * Obtener reacciones de múltiples mensajes (para carga inicial)
   */
  static async getByMessages(messageIds) {
    if (!messageIds || messageIds.length === 0) return [];

    const placeholders = messageIds.map(() => '?').join(',');
    const [rows] = await promisePool.query(`
      SELECT
        message_id,
        emoji,
        COUNT(*) as count,
        GROUP_CONCAT(user_name ORDER BY created_at) as users
      FROM message_reactions
      WHERE message_id IN (${placeholders})
      GROUP BY message_id, emoji
      ORDER BY message_id, count DESC
    `, messageIds);

    return rows;
  }

  /**
   * Verificar si un usuario ya reaccionó a un mensaje
   */
  static async getUserReaction({ messageId, userName }) {
    const [rows] = await promisePool.query(`
      SELECT emoji
      FROM message_reactions
      WHERE message_id = ? AND user_name = ?
    `, [messageId, userName]);

    return rows[0]?.emoji || null;
  }
}

module.exports = Reaction;
