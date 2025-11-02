import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { sendChatMessage, getChatStatus } from '../services/api';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messagesRemaining, setMessagesRemaining] = useState(5);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef(null);

  // Preguntas sugeridas
  const suggestedQuestions = [
    '¿Qué impacto tiene el pozo en mi colonia?',
    '¿Cómo puedo participar?',
    '¿Qué dice la ley sobre este proyecto?',
    '¿Cuáles son las 5 razones principales?'
  ];

  // Inicializar sessionId
  useEffect(() => {
    let storedSessionId = localStorage.getItem('chatSessionId');

    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem('chatSessionId', storedSessionId);
    }

    setSessionId(storedSessionId);

    // Cargar estado de la sesión
    loadSessionStatus(storedSessionId);

    // Mensaje de bienvenida
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: '¡Hola! Soy tu asistente virtual sobre el Pozo de Minerva. Puedo responder tus preguntas basándome en la información oficial del proyecto. ¿En qué puedo ayudarte?',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Cargar estado de la sesión
  const loadSessionStatus = async (sid) => {
    try {
      const response = await getChatStatus(sid);
      if (response.success) {
        setMessagesRemaining(response.data.messagesRemaining);
        setLimitReached(response.data.limitReached);
      }
    } catch (error) {
      console.error('Error al cargar estado:', error);
    }
  };

  // Scroll automático al final
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || loading || limitReached) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await sendChatMessage(inputMessage, sessionId);

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: response.data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setMessagesRemaining(response.data.messagesRemaining);

        if (response.data.messagesRemaining === 0) {
          setLimitReached(true);
        }
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);

      let errorMessage = 'Lo siento, hubo un error al procesar tu pregunta.';

      if (error.response?.status === 429) {
        errorMessage = error.response.data.message || 'Has alcanzado el límite de preguntas por día.';
        setLimitReached(true);
      }

      const errorBotMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: errorMessage,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Abrir chat"
      >
        <FaComments />
        {messagesRemaining < 5 && (
          <span className="message-badge">{messagesRemaining}</span>
        )}
      </button>

      {/* Ventana del chat */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <FaRobot className="chatbot-icon" />
            <div>
              <h4>Asistente Virtual</h4>
              <span className="chatbot-status">En línea</span>
            </div>
          </div>
          <button
            className="chatbot-close"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar chat"
          >
            <FaTimes />
          </button>
        </div>

        {/* Contador de mensajes */}
        <div className="chatbot-counter">
          <span>
            {limitReached
              ? '❌ Límite alcanzado'
              : `📊 ${messagesRemaining} preguntas disponibles`}
          </span>
        </div>

        {/* Mensajes */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.type} ${message.isError ? 'error' : ''}`}
            >
              {message.type === 'bot' && (
                <div className="message-avatar bot">
                  <FaRobot />
                </div>
              )}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
              {message.type === 'user' && (
                <div className="message-avatar user">
                  <span>👤</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message bot">
              <div className="message-avatar bot">
                <FaRobot />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preguntas sugeridas (solo si no ha alcanzado el límite y no hay mensajes del usuario) */}
        {!limitReached && messages.filter(m => m.type === 'user').length === 0 && (
          <div className="suggested-questions">
            <p>Preguntas frecuentes:</p>
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="suggested-question-btn"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="chatbot-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              limitReached
                ? 'Límite de preguntas alcanzado'
                : 'Escribe tu pregunta...'
            }
            disabled={loading || limitReached}
            className="chatbot-input"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading || limitReached}
            className="chatbot-send-btn"
            aria-label="Enviar mensaje"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
