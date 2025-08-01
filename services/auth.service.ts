'use client';

import { LoginCredentials, AuthResponse, User } from '../types/auth';
import Cookies from 'js-cookie';
import { buildApiUrl, createAuthHeaders } from '../lib/config';

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
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  clearImpersonation(): void {
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
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      throw error;
    }
  },

  logout(): void {
    const originalToken = localStorage.getItem('original_token') || Cookies.get('original_token');
    Cookies.remove('token', { path: '/' });
    localStorage.clear();
    if (originalToken) {
      localStorage.setItem('original_token', originalToken);
      Cookies.set('original_token', originalToken, { expires: 1, path: '/' });
    }
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
    Cookies.set('token', token, { expires: 1, path: '/' });
  },

  getToken(): string | null {
    return Cookies.get('token') || localStorage.getItem('token') || null;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  isImpersonating(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isImpersonating') === 'true';
    }
    return false;
  },

  async impersonateTenantAdmin(tenantId: string | number) {
    const token = this.getToken();
    if (!token) throw new Error('No hay token de autenticación');

    // GUARDA EL TOKEN ORIGINAL SOLO SI NO EXISTE
    if (!localStorage.getItem('original_token')) {
      localStorage.setItem('original_token', token);
      Cookies.set('original_token', token, { expires: 1, path: '/' });
      const originalUser = this.getCurrentUser();
      if (originalUser) {
        localStorage.setItem('original_user', JSON.stringify(originalUser));
        Cookies.set('original_user', JSON.stringify(originalUser), { expires: 1, path: '/' });
      }
    }

    const response = await fetch(buildApiUrl(`/auth/impersonate/${tenantId}`), {
      method: 'POST',
      headers: createAuthHeaders(token),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al impersonar');
    }

    const data = await response.json();
    this.setToken(data.token);
    localStorage.setItem('isImpersonating', 'true');
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async restoreImpersonation() {
    try {
      // Obtener el token y usuario originales almacenados
      const originalToken = localStorage.getItem('original_token') || Cookies.get('original_token');
      const originalUserStr = localStorage.getItem('original_user') || Cookies.get('original_user');
      
      if (!originalToken) {
        throw new Error('No se encontró la sesión original');
      }

      // Restaurar el token original
      this.setToken(originalToken);
      
      // Restaurar el usuario original
      if (originalUserStr) {
        try {
          const originalUser = JSON.parse(originalUserStr);
          localStorage.setItem('user', JSON.stringify(originalUser));
        } catch (error) {
          console.error('Error parseando usuario original:', error);
          // Si no se puede parsear, obtener del backend
          await this.fetchUserData();
        }
      } else {
        // Si no hay usuario original, obtener del backend
        await this.fetchUserData();
      }

      // Limpiar flags de impersonación
      localStorage.removeItem('isImpersonating');
      localStorage.removeItem('original_token');
      localStorage.removeItem('original_user');
      Cookies.remove('original_token');
      Cookies.remove('original_user');

      return this.getCurrentUser();
    } catch (error) {
      console.error('Error restaurando impersonación:', error);
      throw new Error('No se pudo restaurar la sesión original');
    }
  }
}; 