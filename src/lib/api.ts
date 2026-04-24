import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const raw = error.response?.data?.message;
    const msg = typeof raw === 'string' ? raw : error.message || 'Error de conexión';
    return Promise.reject(new Error(msg));
  }
);

export default api;
