import axios from 'axios';

// TODO: Replace this URL with your actual deployed backend URL from Render/Railway
// Example: https://linkup-backend.onrender.com/api
const API_BASE_URL = 'https://your-backend-url.onrender.com/api';

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

// Links endpoints
export const linksAPI = {
  getAll: () => api.get('/links'),
  create: (linkData) => api.post('/links', linkData),
  update: (id, linkData) => api.put(`/links/${id}`, linkData),
  delete: (id) => api.delete(`/links/${id}`),
  getById: (id) => api.get(`/links/${id}`),
};

export default api; 