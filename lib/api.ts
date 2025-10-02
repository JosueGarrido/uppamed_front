import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://uppamed.vercel.app';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token agregado a la petición:', config.url);
    } else {
      console.warn('⚠️ No hay token disponible para:', config.url);
    }
  }
  return config;
});

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 Error 401 - Token inválido o expirado');
    }
    return Promise.reject(error);
  }
); 