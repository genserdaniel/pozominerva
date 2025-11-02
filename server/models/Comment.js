const { promisePool } = require('../config/db');

class Comment {
  // Crear nuevo comentario
  static async create(nombre, colonia, comentario) {
    try {
      const [result] = await promisePool.query(
        'INSERT INTO comments (nombre, colonia, comentario) VALUES (?, ?, ?)',
        [nombre, colonia, comentario]
      );
      return { id: result.insertId, nombre, colonia, comentario, likes: 0 };
    } catch (error) {
      throw new Error('Error al crear comentario: ' + error.message);
    }
  }

  // Obtener todos los comentarios (con paginación opcional)
  static async getAll(limit = 50, offset = 0) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM comments ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      return rows;
    } catch (error) {
      throw new Error('Error al obtener comentarios: ' + error.message);
    }
  }

  // Obtener total de comentarios
  static async getCount() {
    try {
      const [rows] = await promisePool.query('SELECT COUNT(*) as total FROM comments');
      return rows[0].total;
    } catch (error) {
      throw new Error('Error al contar comentarios: ' + error.message);
    }
  }

  // Incrementar likes de un comentario
  static async incrementLikes(id) {
    try {
      await promisePool.query(
        'UPDATE comments SET likes = likes + 1 WHERE id = ?',
        [id]
      );

      // Retornar el comentario actualizado
      const [rows] = await promisePool.query('SELECT * FROM comments WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Error al incrementar likes: ' + error.message);
    }
  }

  // Obtener comentario por ID
  static async getById(id) {
    try {
      const [rows] = await promisePool.query('SELECT * FROM comments WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Error al obtener comentario: ' + error.message);
    }
  }
}

module.exports = Comment;
