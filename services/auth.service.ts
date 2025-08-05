'use client';

import { LoginCredentials, AuthResponse, User } from '../types/auth';
import Cookies from 'js-cookie';
import { buildApiUrl, createAuthHeaders } from '../lib/config';

// Función helper para verificar si estamos en el cliente
const isClient = () => typeof window !== 'undefined';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }
      this.clearImpersonation();

      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Manejar diferentes códigos de error HTTP
        switch (response.status) {
          case 400:
            throw new Error(errorData.message || 'Datos de entrada inválidos');
          case 401:
            throw new Error('Credenciales incorrectas. Verifica tu email y contraseña');
          case 403:
            throw new Error('Tu cuenta ha sido bloqueada. Contacta al administrador');
          case 404:
            throw new Error('Usuario no encontrado');
          case 429:
            throw new Error('Demasiados intentos de login. Intenta de nuevo en unos minutos');
          case 500:
            throw new Error('Error interno del servidor. Intenta de nuevo más tarde');
          case 502:
          case 503:
          case 504:
            throw new Error('Servidor no disponible. Intenta de nuevo más tarde');
          default:
            throw new Error(errorData.message || 'Error en la autenticación');
        }
      }

      const data = await response.json();
      this.setToken(data.token);
      if (data.user && isClient()) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar al servidor. Verifica tu conexión a internet');
      }
      
      // Re-lanzar errores que ya tienen mensajes específicos
      if (error instanceof Error) {
        throw error;
      }
      
      // Error genérico para casos no manejados
      throw new Error('Error inesperado al iniciar sesión');
    }
  },

  clearImpersonation(): void {
    if (!isClient()) return;
    localStorage.removeItem('isImpersonating');
    localStorage.removeItem('original_token');
    localStorage.removeItem('original_user');
  },

  async fetchUserData(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(buildApiUrl('/auth/me'), {
        method: 'GET',
        headers: createAuthHeaders(token),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error al obtener datos del usuario');

      const userData = await response.json();
      if (isClient()) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return userData;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/auth/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  },

  async updateProfile(profileData: {
    username: string;
    email: string;
    area?: string;
    specialty?: string;
  }): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el perfil');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },

  setToken(token: string): void {
    if (!isClient()) return;
    
    localStorage.setItem('token', token);
    Cookies.set('token', token, { expires: 1, path: '/' });
  },

  getToken(): string | null {
    if (!isClient()) return null;
    
    return Cookies.get('token') || localStorage.getItem('token') || null;
  },

  getCurrentUser(): User | null {
    if (!isClient()) return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isImpersonating(): boolean {
    if (!isClient()) return false;
    
    return localStorage.getItem('isImpersonating') === 'true';
  },

  async impersonateTenantAdmin(tenantId: string | number) {
    try {
      if (!isClient()) return;
      
      const token = this.getToken();
      if (!token) throw new Error('No hay token de autenticación');

      // Guardar datos originales antes de la suplantación
      const originalUser = this.getCurrentUser();
      if (originalUser) {
        localStorage.setItem('original_user', JSON.stringify(originalUser));
      }
      localStorage.setItem('original_token', token);

      const response = await fetch(buildApiUrl(`/auth/impersonate/${tenantId}`), {
        method: 'POST',
        headers: createAuthHeaders(token),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al suplantar usuario');
      }

      const data = await response.json();
      
      // Actualizar con los datos del usuario suplantado
      this.setToken(data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      localStorage.setItem('isImpersonating', 'true');

      return data;
    } catch (error) {
      console.error('Error al suplantar usuario:', error);
      throw error;
    }
  },

  async restoreImpersonation() {
    try {
      if (!isClient()) return;
      
      const token = this.getToken();
      if (!token) throw new Error('No hay token de autenticación');

      // Llamar al endpoint del backend para restaurar la sesión
      const response = await fetch(buildApiUrl('/auth/restore-impersonation'), {
        method: 'POST',
        headers: createAuthHeaders(token),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al restaurar sesión original');
      }

      const data = await response.json();
      
      // Restaurar el token original
      this.setToken(data.token);
      
      // Limpiar datos de suplantación
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('original_token');
      localStorage.removeItem('original_user');

      // Recargar los datos del usuario actual
      const userData = await this.fetchUserData();
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Error al restaurar sesión original:', error);
      throw error;
    }
  }
}; 