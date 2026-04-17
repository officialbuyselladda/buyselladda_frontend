import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const uploadApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'multipart/form-data' },
});

uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Chat API functions
export const chatApi = {
  getChats: () => api.get('/chats'),
  getMessages: (chatId) => api.get(`/chat/messages/${chatId}`),
  sendMessage: (chatId, content) => api.post(`/chat/messages/${chatId}`, { content }),
};

export default api;


