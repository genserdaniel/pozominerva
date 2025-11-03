import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { FiSmile, FiSend, FiX } from 'react-icons/fi';
import axios from 'axios';
import './PodcastPlayer.css';

const PodcastPlayer = ({ onScrollToPodcast, onReplyToPodcast }) => {
  const [podcastMessageId, setPodcastMessageId] = useState(null);
  const audioRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Obtener ID del mensaje del podcast al montar
  useEffect(() => {
    const fetchPodcastId = async () => {
      try {
        console.log('🎙️ PodcastPlayer: Obteniendo ID del podcast...');
        const response = await axios.get('http://localhost:3001/api/messages/podcast/id');
        console.log('🎙️ PodcastPlayer: Respuesta de ID:', response.data);
        if (response.data.success) {
          setPodcastMessageId(response.data.podcastMessageId);
          console.log('🎙️ PodcastPlayer: ID del podcast establecido:', response.data.podcastMessageId);
        }
      } catch (error) {
        console.error('Error obteniendo ID del podcast:', error);
      }
    };

    fetchPodcastId();
  }, []);

  // Cargar número de respuestas al podcast
  useEffect(() => {
    const loadReplyCount = async () => {
      if (!podcastMessageId) return;

      try {
        const response = await axios.get('http://localhost:3001/api/messages');
        if (response.data.success) {
          const replies = response.data.data.filter(msg => msg.reply_to_id === podcastMessageId);
          setReplyCount(replies.length);
        }
      } catch (error) {
        console.error('Error cargando respuestas:', error);
      }
    };

    loadReplyCount();

    // Polling cada 3 segundos para actualizar contador
    const interval = setInterval(loadReplyCount, 3000);
    return () => clearInterval(interval);
  }, [podcastMessageId]);

  // Cerrar emoji picker al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Actualizar tiempo actual
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  // Play/Pause
  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Mute/Unmute
  const toggleMute = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Cambiar volumen
  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Cambiar posición de reproducción
  const handleSeek = (e) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Formatear tiempo (MM:SS)
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Manejar reacción - Usa la API de reacciones
  const handleReaction = async (emoji) => {
    if (!podcastMessageId) return;

    try {
      const userData = localStorage.getItem('pozoMinervaUser')
        ? JSON.parse(localStorage.getItem('pozoMinervaUser'))
        : null;

      if (!userData) {
        alert('Debes estar registrado para reaccionar');
        return;
      }

      // Crear reacción usando la API de reacciones
      await axios.post(`http://localhost:3001/api/messages/${podcastMessageId}/reactions`, {
        userName: userData.nombre,
        userColonia: userData.colonia,
        emoji: emoji
      });

      setShowEmojiPicker(false);

      // Minimizar el player
      setIsMinimized(true);
    } catch (error) {
      console.error('Error agregando reacción:', error);
      alert('Error al enviar reacción');
    }
  };

  // Notificar al backend que el usuario está escribiendo
  const notifyTypingStart = async () => {
    try {
      const userData = localStorage.getItem('pozoMinervaUser')
        ? JSON.parse(localStorage.getItem('pozoMinervaUser'))
        : null;

      if (!userData) return;

      await axios.post('http://localhost:3001/api/messages/typing/start', {
        userName: userData.nombre,
        userColonia: userData.colonia
      });
    } catch (error) {
      console.error('Error notificando typing start:', error);
    }
  };

  // Notificar al backend que el usuario dejó de escribir
  const notifyTypingStop = async () => {
    try {
      const userData = localStorage.getItem('pozoMinervaUser')
        ? JSON.parse(localStorage.getItem('pozoMinervaUser'))
        : null;

      if (!userData) return;

      await axios.post('http://localhost:3001/api/messages/typing/stop', {
        userName: userData.nombre,
        userColonia: userData.colonia
      });
    } catch (error) {
      console.error('Error notificando typing stop:', error);
    }
  };

  // Manejar cambios en el texto del comentario
  const handleCommentTextChange = (e) => {
    const text = e.target.value;
    setCommentText(text);

    if (text.trim()) {
      notifyTypingStart();

      // Cancelar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Configurar nuevo timeout para dejar de escribir después de 3 segundos
      typingTimeoutRef.current = setTimeout(() => {
        notifyTypingStop();
      }, 3000);
    } else {
      // Si el input está vacío, dejar de escribir inmediatamente
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      notifyTypingStop();
    }
  };

  // Manejar botón de comentar - Muestra/oculta el input inline
  const handleCommentToggle = () => {
    setShowCommentInput(!showCommentInput);
    if (!showCommentInput) {
      // Al abrir, hacer foco en el input después de un breve delay
      setTimeout(() => {
        const input = document.querySelector('.podcast-comment-input');
        if (input) input.focus();
      }, 100);
    } else {
      // Al cerrar, limpiar el texto y notificar stop typing
      setCommentText('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      notifyTypingStop();
    }
  };

  // Enviar comentario como respuesta al podcast
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!podcastMessageId || !commentText.trim()) return;

    try {
      const userData = localStorage.getItem('pozoMinervaUser')
        ? JSON.parse(localStorage.getItem('pozoMinervaUser'))
        : null;

      if (!userData) {
        alert('Debes estar registrado para comentar');
        return;
      }

      // Detener indicador de typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      notifyTypingStop();

      // Crear mensaje como respuesta al podcast
      const response = await axios.post('http://localhost:3001/api/messages', {
        userName: userData.nombre,
        userColonia: userData.colonia,
        messageText: commentText,
        replyToId: podcastMessageId
      });

      // Limpiar y cerrar el input
      setCommentText('');
      setShowCommentInput(false);

      // Minimizar el player
      setIsMinimized(true);
    } catch (error) {
      console.error('Error enviando comentario:', error);
      alert('Error al enviar comentario');
    }
  };

  // Manejar clic en el player para maximizar/minimizar
  const handlePlayerClick = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`podcast-player ${isMinimized ? 'minimized' : ''}`}>
      <audio ref={audioRef} src="/audio/podcast.mp3" preload="metadata" />

      <div className="podcast-player-container" onClick={handlePlayerClick}>
        {/* Fila 1: Info + Controles + Progreso */}
        <div className="podcast-row">
          {/* Información del podcast */}
          <div className="podcast-info">
            <div className="podcast-icon">🎙️</div>
            <div className="podcast-details">
              <div className="podcast-title">Podcast Informativo</div>
              <div className="podcast-subtitle">Proyecto Pozo de Minerva</div>
            </div>
          </div>

          {/* Estadísticas del podcast */}
          {replyCount > 0 && (
            <div className="podcast-stats" onClick={(e) => e.stopPropagation()}>
              <span className="reply-count-badge">{replyCount} respuesta{replyCount !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Controles de reproducción */}
          <div className="podcast-controls" onClick={(e) => e.stopPropagation()}>
          {/* Botón Play/Pause */}
          <button
            className="control-btn play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          {/* Barra de progreso */}
          <div className="progress-container">
            <span className="time-current">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                  (currentTime / duration) * 100
                }%, #ddd ${(currentTime / duration) * 100}%, #ddd 100%)`
              }}
            />
            <span className="time-duration">{formatTime(duration)}</span>
          </div>
        </div>
        </div>

        {/* Fila 2: Volumen + Reacciones + Responder */}
        <div className="podcast-row">
          {/* Controles de volumen */}
          <div className="volume-controls">
            <button
              className="control-btn volume-btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              className="volume-bar"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </div>

          {/* Botón de reaccionar */}
          <div
            className="reaction-container"
            ref={showEmojiPicker ? emojiPickerRef : null}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="control-btn react-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              aria-label="Reaccionar"
              title="Reaccionar al podcast"
            >
              <FiSmile />
            </button>

            {/* Selector de emojis */}
            {showEmojiPicker && (
              <div className="emoji-picker">
                {['👍', '❤️', '😂', '😮', '😢', '🙏', '👏', '🔥'].map((emoji) => (
                  <button
                    key={emoji}
                    className="emoji-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(emoji);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón de comentar */}
          <button
            className="reply-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleCommentToggle();
            }}
            aria-label="Comentar"
            title="Comentar en el chat"
          >
            Responder
          </button>
        </div>

        {/* Input de comentario inline */}
        {showCommentInput && (
          <div className="podcast-comment-section" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCommentSubmit} className="podcast-comment-form">
              <input
                type="text"
                className="podcast-comment-input"
                placeholder="Escribe tu comentario sobre el podcast..."
                value={commentText}
                onChange={handleCommentTextChange}
              />
              <button
                type="submit"
                className="podcast-comment-submit"
                disabled={!commentText.trim()}
                aria-label="Enviar"
              >
                <FiSend />
              </button>
              <button
                type="button"
                className="podcast-comment-cancel"
                onClick={handleCommentToggle}
                aria-label="Cancelar"
              >
                <FiX />
              </button>
            </form>
          </div>
        )}

        {/* Botón minimizar/maximizar */}
        <button
          className="minimize-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
          aria-label={isMinimized ? 'Maximizar' : 'Minimizar'}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>
    </div>
  );
};

export default PodcastPlayer;
