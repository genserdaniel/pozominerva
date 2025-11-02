import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutos para procesar contexto grande
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ========== COMENTARIOS ==========

export const getComments = async (limit = 50, offset = 0) => {
  try {
    const response = await api.get('/comments', {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createComment = async (commentData) => {
  try {
    const response = await api.post('/comments', commentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const likeComment = async (commentId) => {
  try {
    const response = await api.put(`/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== CHAT ==========

export const sendChatMessage = async (message, sessionId) => {
  try {
    const response = await api.post('/chat', {
      message,
      sessionId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChatStatus = async (sessionId) => {
  try {
    const response = await api.get(`/chat/status/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== PDFs ==========

export const getPDFs = async () => {
  try {
    const response = await api.get('/pdfs');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPDFById = async (id) => {
  try {
    const response = await api.get(`/pdfs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPDFsByCategory = async (category) => {
  try {
    const response = await api.get(`/pdfs/category/${category}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== HEALTH CHECK ==========

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
