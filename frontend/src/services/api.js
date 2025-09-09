import axios from 'axios';

// Local development API URL
const API_BASE_URL = 'https://linkup-1-ke2l.onrender.com/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signup';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/users/signup', userData),
  login: (userData) => api.post('/users/login', userData),
};

// Links endpoints with AI features
export const linksAPI = {
  getAll: (params = {}) => api.get('/links', { params }),
  create: (linkData) => api.post('/links', linkData),
  update: (id, linkData) => api.put(`/links/${id}`, linkData),
  delete: (id) => api.delete(`/links/${id}`),
  getById: (id) => api.get(`/links/${id}`),
  getCategories: () => api.get('/links/categories'),
  getStats: () => api.get('/links/stats'),
  toggleFavorite: (id) => api.patch(`/links/${id}/favorite`),
  reanalyze: (id) => api.post(`/links/${id}/reanalyze`),
};

export default api; 