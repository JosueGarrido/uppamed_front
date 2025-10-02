import axios from 'axios';
import Cookies from 'js-cookie';

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
    // Intentar obtener el token de cookies primero, luego de localStorage
    const token = Cookies.get('token') || localStorage.getItem('token');
    
    // Debug: Log del token para verificar
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Token encontrado:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + '...',
        url: config.url
      });
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No se encontró token de autenticación');
    }
  }
  return config;
});

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Error de autenticación - Token inválido o expirado');
    }
    return Promise.reject(error);
  }
); 