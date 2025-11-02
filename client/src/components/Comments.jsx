import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { getComments, createComment, likeComment } from '../services/api';
import { coloniasAgrupadas } from '../data/colonias';
import './Comments.css';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    colonia: '',
    comentario: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Cargar comentarios al montar el componente
  useEffect(() => {
    fetchComments();
    loadLikedComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getComments(50, 0);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar comentarios que ya han sido liked desde localStorage
  const loadLikedComments = () => {
    const liked = localStorage.getItem('likedComments');
    if (liked) {
      setLikedComments(new Set(JSON.parse(liked)));
    }
  };

  // Guardar comentarios liked en localStorage
  const saveLikedComments = (newLikedSet) => {
    localStorage.setItem('likedComments', JSON.stringify([...newLikedSet]));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 100) {
      errors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (!formData.colonia) {
      errors.colonia = 'Debes seleccionar una colonia';
    }

    if (!formData.comentario.trim()) {
      errors.comentario = 'El comentario es requerido';
    } else if (formData.comentario.length < 10) {
      errors.comentario = 'El comentario debe tener al menos 10 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await createComment(formData);

      if (response.success) {
        // Agregar el nuevo comentario al inicio de la lista
        setComments(prev => [response.data, ...prev]);

        // Limpiar formulario
        setFormData({
          nombre: '',
          colonia: '',
          comentario: ''
        });

        // Mostrar mensaje de éxito
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000);

        // Scroll al inicio de los comentarios
        document.getElementById('comments-list')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error al crear comentario:', error);
      alert('Hubo un error al enviar tu comentario. Por favor, intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    // Verificar si ya dio like
    if (likedComments.has(commentId)) {
      alert('Ya diste "Me gusta" a este comentario');
      return;
    }

    try {
      const response = await likeComment(commentId);

      if (response.success) {
        // Actualizar comentario en la lista
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId ? response.data : comment
          )
        );

        // Agregar a liked
        const newLikedSet = new Set(likedComments);
        newLikedSet.add(commentId);
        setLikedComments(newLikedSet);
        saveLikedComments(newLikedSet);
      }
    } catch (error) {
      console.error('Error al dar like:', error);
      alert('Hubo un error al dar "Me gusta". Por favor, intenta de nuevo.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="comments-section section" id="comentarios">
      <div className="container">
        <div className="section-title">
          <h2>Comentarios de Vecinos</h2>
          <p className="section-subtitle">
            Comparte tu opinión y preocupaciones sobre el proyecto del Pozo de Minerva
          </p>
        </div>

        {/* Formulario */}
        <div className="comments-form-wrapper">
          <h3><FaComment /> Deja tu comentario</h3>

          {submitSuccess && (
            <div className="alert alert-success">
              ¡Tu comentario ha sido publicado exitosamente!
            </div>
          )}

          <form onSubmit={handleSubmit} className="comments-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={formErrors.nombre ? 'error' : ''}
                placeholder="Ej: Juan Pérez"
                maxLength={100}
              />
              {formErrors.nombre && <span className="error-message">{formErrors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="colonia">Colonia donde vives *</label>
              <select
                id="colonia"
                name="colonia"
                value={formData.colonia}
                onChange={handleInputChange}
                className={formErrors.colonia ? 'error' : ''}
              >
                <option value="">-- Selecciona tu colonia --</option>
                {coloniasAgrupadas.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((colonia) => (
                      <option key={colonia.value} value={colonia.value}>
                        {colonia.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {formErrors.colonia && <span className="error-message">{formErrors.colonia}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="comentario">Tu comentario *</label>
              <textarea
                id="comentario"
                name="comentario"
                value={formData.comentario}
                onChange={handleInputChange}
                className={formErrors.comentario ? 'error' : ''}
                placeholder="Comparte tu opinión, preocupaciones o preguntas sobre el proyecto..."
                rows={5}
              />
              {formErrors.comentario && <span className="error-message">{formErrors.comentario}</span>}
              <small className="char-count">
                {formData.comentario.length} caracteres
              </small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Publicar Comentario'}
            </button>
          </form>
        </div>

        {/* Lista de comentarios */}
        <div className="comments-list" id="comments-list">
          <h3>Comentarios recientes ({comments.length})</h3>

          {loading ? (
            <div className="loading-message">Cargando comentarios...</div>
          ) : comments.length === 0 ? (
            <div className="empty-message">
              Aún no hay comentarios. ¡Sé el primero en compartir tu opinión!
            </div>
          ) : (
            <div className="comments-grid">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-avatar">
                      {comment.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-info">
                      <h4 className="comment-author">{comment.nombre}</h4>
                      <p className="comment-location">📍 {comment.colonia}</p>
                      <span className="comment-date">{formatDate(comment.created_at)}</span>
                    </div>
                  </div>

                  <div className="comment-body">
                    <p>{comment.comentario}</p>
                  </div>

                  <div className="comment-footer">
                    <button
                      className={`like-btn ${likedComments.has(comment.id) ? 'liked' : ''}`}
                      onClick={() => handleLike(comment.id)}
                      disabled={likedComments.has(comment.id)}
                    >
                      {likedComments.has(comment.id) ? <FaHeart /> : <FaRegHeart />}
                      <span>{comment.likes} Me gusta</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Comments;
