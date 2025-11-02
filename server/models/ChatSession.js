const { promisePool } = require('../config/db');

class ChatSession {
  // Crear o obtener sesión existente
  static async getOrCreate(sessionId) {
    try {
      // Intentar obtener sesión existente
      const [rows] = await promisePool.query(
        'SELECT * FROM chat_sessions WHERE session_id = ? AND (expires_at IS NULL OR expires_at > NOW())',
        [sessionId]
      );

      if (rows.length > 0) {
        return rows[0];
      }

      // Crear nueva sesión (expira en 24 horas)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await promisePool.query(
        'INSERT INTO chat_sessions (session_id, message_count, expires_at) VALUES (?, 0, ?)',
        [sessionId, expiresAt]
      );

      const [newRows] = await promisePool.query(
        'SELECT * FROM chat_sessions WHERE session_id = ?',
        [sessionId]
      );

      return newRows[0];
    } catch (error) {
      throw new Error('Error al crear/obtener sesión: ' + error.message);
    }
  }

  // Incrementar contador de mensajes
  static async incrementMessageCount(sessionId) {
    try {
      await promisePool.query(
        'UPDATE chat_sessions SET message_count = message_count + 1 WHERE session_id = ?',
        [sessionId]
      );

      // Retornar sesión actualizada
      const [rows] = await promisePool.query(
        'SELECT * FROM chat_sessions WHERE session_id = ?',
        [sessionId]
      );

      return rows[0];
    } catch (error) {
      throw new Error('Error al incrementar contador: ' + error.message);
    }
  }

  // Verificar si ha alcanzado el límite
  static async hasReachedLimit(sessionId, limit = 5) {
    try {
      const session = await this.getOrCreate(sessionId);
      return session.message_count >= limit;
    } catch (error) {
      throw new Error('Error al verificar límite: ' + error.message);
    }
  }

  // Limpiar sesiones expiradas (mantenimiento)
  static async cleanExpired() {
    try {
      const [result] = await promisePool.query(
        'DELETE FROM chat_sessions WHERE expires_at < NOW()'
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error('Error al limpiar sesiones: ' + error.message);
    }
  }
}

module.exports = ChatSession;
