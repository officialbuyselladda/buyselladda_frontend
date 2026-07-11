import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30 second timeout
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
    // Only redirect on 401 if there's actually a token stored (meaning user was previously logged in)
    if (error.response?.status === 401) {
      const storedToken = localStorage.getItem('token');
      
      // Only clear and redirect if token existed (user was logged in)
      // This prevents redirect on initial load
      if (storedToken) {
        // Check if this is an admin endpoint (dashboard, users, etc.)
        const isAdminEndpoint = error.config?.url?.includes('/admin');
        const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register');
        
        // Only redirect if it's NOT an admin endpoint AND NOT auth endpoint
        // This allows dashboard API calls to fail silently without redirecting
        if (!isAuthEndpoint && !isAdminEndpoint) {
          // Clear storage and redirect for regular user endpoints
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          } else {
            window.location.href = '/login';
          }
        }
        // If it's an admin endpoint (like /admin/dashboard), do NOT clear storage or redirect
        // Just fail silently - the component will handle the error gracefully
      }
      // If no token stored, this is initial load - do nothing
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
  getChats: () => api.get('/chats').then((res) => res.data.data || []),
  getMessages: (chatId) => api.get(`/chats/${chatId}/messages`).then((res) => res.data.data),
  sendMessage: (chatId, text) => api.post(`/chats/${chatId}/send`, { text }),
};

export const userApi = {
  getProfile: (userId) => api.get(`/users/${userId}`).then((res) => res.data.data),
  toggleBlock: (userId) => api.post(`/users/${userId}/block`).then((res) => res.data.data),
  report: (userId, payload) => api.post(`/users/${userId}/report`, payload).then((res) => res.data.data),
};

export const contentApi = {
  getSiteContent: () => api.get('/content/site').then((res) => res.data.data),
  getAdminContent: () => api.get('/admin/content').then((res) => res.data.data),
  updateAdminContent: (payload) => api.put('/admin/content', payload).then((res) => res.data.data),
};

export const contactApi = {
  send: (payload) => api.post('/contact', payload).then((res) => res.data),
  sendWithFile: (formData) => uploadApi.post('/contact', formData).then((res) => res.data),
};

export const appConfigApi = {
  getPublicConfig: () => api.get('/app-config').then((res) => res.data.data),
  getAdminConfig: () => api.get('/app-config/admin').then((res) => res.data.data),
  updateAdminConfig: (payload) => api.put('/app-config/admin', payload).then((res) => res.data.data),
};

export default api;


