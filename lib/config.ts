// Configuración centralizada para la aplicación
export const config = {
  // URL de la API - prioriza la variable de entorno, sino usa la URL por defecto
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://uppamed.vercel.app',
  
  // Configuración de CORS
  cors: {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  // Configuración de la aplicación
  app: {
    name: 'UppaMed',
    version: '1.0.0'
  }
};

// Función helper para construir URLs de la API
export const buildApiUrl = (endpoint: string): string => {
  return `${config.apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Función helper para crear headers de autenticación
export const createAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    ...config.cors.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}; 