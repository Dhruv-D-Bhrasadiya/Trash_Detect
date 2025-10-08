import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  register: (userData) => api.post('/users/', userData),
  getCurrentUser: () => api.get('/users/me/'),
};

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploadfile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const submissionAPI = {
  getSubmissions: (skip = 0, limit = 10) => 
    api.get(`/submissions/?skip=${skip}&limit=${limit}`),
};

export const leaderboardAPI = {
  getLeaderboard: (limit = 10) => 
    api.get(`/leaderboard/?limit=${limit}`),
};

export const statsAPI = {
  getUserStats: () => api.get('/stats/'),
  getGlobalStats: () => api.get('/admin/stats/'),
};

export const adminAPI = {
  getUsers: (skip = 0, limit = 100) => 
    api.get(`/admin/users/?skip=${skip}&limit=${limit}`),
  getAllSubmissions: (skip = 0, limit = 100) => 
    api.get(`/admin/submissions/?skip=${skip}&limit=${limit}`),
  toggleUserActive: (userId) => 
    api.post(`/admin/users/${userId}/toggle-active`),
  makeUserAdmin: (userId) => 
    api.post(`/admin/users/${userId}/make-admin`),
};

export default api;
