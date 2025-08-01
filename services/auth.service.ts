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
        const error = await response.json();
        throw new Error(error.message || 'Error en la autenticación');
      }

      const data = await response.json();
      this.setToken(data.token);
      if (data.user && isClient()) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
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

  logout(): void {
    if (!isClient()) return;
    
    const originalToken = localStorage.getItem('original_token') || Cookies.get('original_token');
    Cookies.remove('token', { path: '/' });
    localStorage.clear();
    if (originalToken) {
      localStorage.setItem('original_token', originalToken);
      Cookies.set('original_token', originalToken, { expires: 1, path: '/' });
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
      
      const originalToken = localStorage.getItem('original_token');
      const originalUser = localStorage.getItem('original_user');

      if (!originalToken || !originalUser) {
        throw new Error('No hay datos de sesión original para restaurar');
      }

      // Restaurar datos originales
      this.setToken(originalToken);
      localStorage.setItem('user', originalUser);
      
      // Limpiar datos de suplantación
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('original_token');
      localStorage.removeItem('original_user');

      return JSON.parse(originalUser);
    } catch (error) {
      console.error('Error al restaurar sesión original:', error);
      throw error;
    }
  }
}; 