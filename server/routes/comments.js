const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// GET /api/comments - Obtener todos los comentarios
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const comments = await Comment.getAll(limit, offset);
    const total = await Comment.getCount();

    res.json({
      success: true,
      data: comments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comentarios',
      error: error.message
    });
  }
});

// POST /api/comments - Crear nuevo comentario
router.post('/', async (req, res) => {
  try {
    const { nombre, colonia, comentario } = req.body;

    // Validación
    if (!nombre || !colonia || !comentario) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos (nombre, colonia, comentario)'
      });
    }

    // Validar longitud
    if (nombre.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'El nombre no puede exceder 100 caracteres'
      });
    }

    if (comentario.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'El comentario debe tener al menos 10 caracteres'
      });
    }

    const newComment = await Comment.create(nombre, colonia, comentario);

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: newComment
    });
  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear comentario',
      error: error.message
    });
  }
});

// PUT /api/comments/:id/like - Incrementar likes
router.put('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el comentario existe
    const comment = await Comment.getById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    const updatedComment = await Comment.incrementLikes(id);

    res.json({
      success: true,
      message: 'Like agregado exitosamente',
      data: updatedComment
    });
  } catch (error) {
    console.error('Error incrementando likes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar like',
      error: error.message
    });
  }
});

module.exports = router;
