import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSend, FiPaperclip, FiX, FiImage, FiMic, FiVideo } from 'react-icons/fi';
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

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Auto-scroll al final
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

                  <div className="message-footer">
                    <span className="message-time">{formatTime(msg.created_at)}</span>
                    {!msg.is_bot && msg.user_name !== userData.nombre && (
                      <button
                        className="reply-btn"
                        onClick={() => setReplyTo(msg)}
                      >
                        Responder
                      </button>
                    )}
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
            onChange={(e) => setNewMessage(e.target.value)}
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
