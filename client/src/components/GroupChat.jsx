import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSend, FiPaperclip, FiX, FiImage, FiMic, FiVideo, FiSmile } from 'react-icons/fi';
import './GroupChat.css';

const GroupChat = ({ userData }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [botTyping, setBotTyping] = useState(false);
  const [reactions, setReactions] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Cargar mensajes iniciales
  useEffect(() => {
    loadMessages();
  }, []);

  // Polling cada 3 segundos para nuevos mensajes
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastTimestamp) {
        pollNewMessages();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastTimestamp]);

  // Polling para estado de "escribiendo" del bot (cada 2 segundos)
  useEffect(() => {
    const checkBotTyping = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/messages/bot/typing');
        if (response.data.success) {
          setBotTyping(response.data.isTyping);
        }
      } catch (error) {
        console.error('Error verificando estado del bot:', error);
      }
    };

    const interval = setInterval(checkBotTyping, 2000);
    checkBotTyping(); // Ejecutar inmediatamente

    return () => clearInterval(interval);
  }, []);

  // Polling para usuarios escribiendo (cada 2 segundos)
  useEffect(() => {
    const checkTypingUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/messages/typing');
        if (response.data.success) {
          // Filtrar usuarios escribiendo (excluir al usuario actual)
          const otherUsersTyping = response.data.data.filter(u =>
            !(u.userName === userData.nombre && u.userColonia === userData.colonia)
          );
          setTypingUsers(otherUsersTyping);
        }
      } catch (error) {
        console.error('Error verificando usuarios escribiendo:', error);
      }
    };

    const interval = setInterval(checkTypingUsers, 2000);
    checkTypingUsers(); // Ejecutar inmediatamente

    return () => clearInterval(interval);
  }, [userData]);

  // Auto-scroll al final
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]); // También scroll cuando cambia typing

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/messages');
      if (response.data.success) {
        setMessages(response.data.data);
        if (response.data.data.length > 0) {
          const last = response.data.data[response.data.data.length - 1];
          setLastTimestamp(last.created_at);
        }
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const pollNewMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/messages/since/${lastTimestamp}`);
      if (response.data.success && response.data.data.length > 0) {
        setMessages(prev => [...prev, ...response.data.data]);
        const last = response.data.data[response.data.data.length - 1];
        setLastTimestamp(last.created_at);
      }
    } catch (error) {
      console.error('Error polling mensajes:', error);
    }
  };

  // Cerrar selector de emojis al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar reacciones cuando cambian los mensajes
  useEffect(() => {
    if (messages.length > 0) {
      loadReactions();
    }
  }, [messages]);

  const loadReactions = async () => {
    try {
      const messageIds = messages.map(m => m.id);
      const reactionsData = {};

      // Cargar reacciones para todos los mensajes
      await Promise.all(messageIds.map(async (id) => {
        const response = await axios.get(`http://localhost:3001/api/messages/${id}/reactions`);
        if (response.data.success) {
          reactionsData[id] = response.data.data;
        }
      }));

      setReactions(reactionsData);
    } catch (error) {
      console.error('Error cargando reacciones:', error);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      // Verificar si el usuario ya reaccionó con este emoji
      const messageReactions = reactions[messageId] || [];
      const existingReaction = messageReactions.find(r =>
        r.emoji === emoji && r.users?.split(',').includes(userData.nombre)
      );

      if (existingReaction) {
        // Eliminar reacción
        await axios.delete(`http://localhost:3001/api/messages/${messageId}/reactions`, {
          data: {
            userName: userData.nombre
          }
        });
      } else {
        // Agregar reacción
        await axios.post(`http://localhost:3001/api/messages/${messageId}/reactions`, {
          userName: userData.nombre,
          userColonia: userData.colonia,
          emoji
        });
      }

      // Recargar reacciones del mensaje
      const response = await axios.get(`http://localhost:3001/api/messages/${messageId}/reactions`);
      if (response.data.success) {
        setReactions(prev => ({
          ...prev,
          [messageId]: response.data.data
        }));
      }

      setShowEmojiPicker(null);
    } catch (error) {
      console.error('Error manejando reacción:', error);
    }
  };

  // Notificar al backend que el usuario está escribiendo
  const notifyTypingStart = async () => {
    try {
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
      await axios.post('http://localhost:3001/api/messages/typing/stop', {
        userName: userData.nombre,
        userColonia: userData.colonia
      });
    } catch (error) {
      console.error('Error notificando typing stop:', error);
    }
  };

  // Manejar cambio en el input de mensaje
  const handleMessageInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Si está escribiendo, notificar al backend
    if (value.trim().length > 0) {
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ['image/', 'audio/', 'video/'];
    const isAllowed = allowedTypes.some(type => file.type.startsWith(type));

    if (!isAllowed) {
      alert('Solo se permiten imágenes, audios y videos');
      return;
    }

    // Validar tamaño (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 50MB');
      return;
    }

    setSelectedFile(file);

    // Crear preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    // Limpiar timeout de typing y notificar que dejó de escribir
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    notifyTypingStop();

    setSending(true);

    try {
      const formData = new FormData();
      formData.append('userName', userData.nombre);
      formData.append('userColonia', userData.colonia);
      formData.append('messageText', newMessage.trim());

      if (replyTo) {
        formData.append('replyToId', replyTo.id);
      }

      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      const response = await axios.post('http://localhost:3001/api/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setNewMessage('');
        setSelectedFile(null);
        setFilePreview(null);
        setReplyTo(null);
        loadMessages();
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar mensaje. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });
    }
  };

  const renderMediaContent = (message) => {
    if (message.media_type === 'none' || !message.media_url) return null;

    const mediaUrl = `http://localhost:3001${message.media_url}`;

    switch (message.media_type) {
      case 'image':
        return (
          <div className="message-media">
            <img src={mediaUrl} alt="Imagen compartida" />
          </div>
        );
      case 'audio':
        return (
          <div className="message-media">
            <audio controls>
              <source src={mediaUrl} />
            </audio>
          </div>
        );
      case 'video':
        return (
          <div className="message-media">
            <video controls width="100%">
              <source src={mediaUrl} />
            </video>
          </div>
        );
      default:
        return null;
    }
  };

  const groupMessagesByDate = () => {
    const grouped = {};
    messages.forEach(msg => {
      const date = new Date(msg.created_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="group-chat">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>💬 Chat Comunitario</h3>
          <p>{messages.length} mensajes</p>
        </div>
      </div>

      <div className="chat-messages">
        {Object.keys(groupedMessages).map((date, idx) => (
          <div key={idx}>
            <div className="date-divider">
              <span>{formatDate(groupedMessages[date][0].created_at)}</span>
            </div>

            {groupedMessages[date].map((msg) => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.is_bot ? 'bot-message' : ''} ${msg.user_name === userData.nombre && msg.user_colonia === userData.colonia ? 'own-message' : ''}`}
              >
                <div className="message-bubble">
                  {msg.reply_to_id && (
                    <div className="reply-preview">
                      <strong>{msg.reply_to_user_name}</strong>
                      <p>{msg.reply_to_message_text || '[Multimedia]'}</p>
                    </div>
                  )}

                  <div className="message-header">
                    <span className="message-author">
                      {msg.is_bot ? '🤖 ' : ''}{msg.user_name}
                    </span>
                    <span className="message-colonia">{msg.user_colonia}</span>
                  </div>

                  {renderMediaContent(msg)}

                  {msg.message_text && (
                    <div className="message-text">{msg.message_text}</div>
                  )}

                  {/* Mostrar reacciones existentes */}
                  {reactions[msg.id] && reactions[msg.id].length > 0 && (
                    <div className="message-reactions">
                      {reactions[msg.id].map((reaction, idx) => {
                        const users = reaction.users.split(',');
                        const hasUserReacted = users.includes(userData.nombre);

                        return (
                          <button
                            key={idx}
                            className={`reaction-bubble ${hasUserReacted ? 'user-reacted' : ''}`}
                            onClick={() => handleReaction(msg.id, reaction.emoji)}
                            title={users.join(', ')}
                          >
                            {reaction.emoji} {reaction.count}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="message-footer">
                    <span className="message-time">{formatTime(msg.created_at)}</span>

                    <div className="message-actions">
                      {/* Botón para reaccionar */}
                      <div className="reaction-container" ref={showEmojiPicker === msg.id ? emojiPickerRef : null}>
                        <button
                          className="react-btn"
                          onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                        >
                          <FiSmile />
                        </button>

                        {/* Selector de emojis */}
                        {showEmojiPicker === msg.id && (
                          <div className="emoji-picker">
                            {['👍', '❤️', '😂', '😮', '😢', '🙏', '👏', '🔥'].map((emoji) => (
                              <button
                                key={emoji}
                                className="emoji-option"
                                onClick={() => handleReaction(msg.id, emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Botón para responder */}
                      <button
                        className="reply-btn"
                        onClick={() => setReplyTo(msg)}
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Indicador de "escribiendo..." cuando el bot está activo */}
        {botTyping && (
          <div className="message-wrapper bot-message">
            <div className="message-bubble typing-indicator">
              <div className="message-header">
                <span className="message-author">🤖 PozoBot</span>
                <span className="message-colonia">Sistema</span>
              </div>
              <div className="typing-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de usuarios escribiendo */}
        {typingUsers.length > 0 && (
          <div className="message-wrapper">
            <div className="message-bubble typing-indicator">
              <div className="message-header">
                <span className="message-author">
                  {typingUsers.map(u => `${u.userName} (${u.userColonia})`).join(', ')}
                </span>
              </div>
              <div className="typing-text">
                {typingUsers.length === 1 ? 'está escribiendo...' : 'están escribiendo...'}
              </div>
              <div className="typing-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        {replyTo && (
          <div className="reply-indicator">
            <div>
              <strong>Respondiendo a {replyTo.user_name}</strong>
              <p>{replyTo.message_text || '[Multimedia]'}</p>
            </div>
            <button onClick={() => setReplyTo(null)}>
              <FiX />
            </button>
          </div>
        )}

        {selectedFile && (
          <div className="file-preview">
            {filePreview ? (
              <img src={filePreview} alt="Preview" />
            ) : (
              <div className="file-info">
                <span>{selectedFile.name}</span>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}
            <button onClick={() => {
              setSelectedFile(null);
              setFilePreview(null);
            }}>
              <FiX />
            </button>
          </div>
        )}

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,audio/*,video/*"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            <FiPaperclip />
          </button>

          <input
            type="text"
            className="message-input"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={handleMessageInputChange}
            disabled={sending}
          />

          <button
            type="submit"
            className="send-btn"
            disabled={sending || (!newMessage.trim() && !selectedFile)}
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;
