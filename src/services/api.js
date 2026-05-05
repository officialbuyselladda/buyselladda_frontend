import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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

const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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


