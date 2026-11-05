import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicai_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
