// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Replace with your backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in the headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (userData) => api.post('/auth/login', userData);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (userData) => api.put('/auth/profile', userData);
export const changePassword = (passwords) => api.put('/auth/change-password', passwords);

export const addWebsite = (websiteData) => api.post('/websites/add', websiteData);
export const getWebsites = () => api.get('/websites/');

export const getMetrics = (websiteId) => api.get(`/metrics/?website_id=${websiteId}`);
export const addMetric = (metricData) => api.post('/metrics/add', metricData);

export const getAlerts = (websiteId) => api.get(`/alerts/?website_id=${websiteId}`);
export const updateAlert = (alertId, status) => api.patch(`/alerts/${alertId}`, { status });

export default api;
