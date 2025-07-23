'use client';

import { LoginCredentials, AuthResponse, User } from '../types/auth';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://uppamed.vercel.app';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }
      this.clearImpersonation();

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
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

    const response = await fetch(`${API_URL}/auth/impersonate/${tenantId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
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
    // 1. Llama al endpoint del backend para restaurar el token original
    const token = this.getToken();
    const response = await fetch(`${API_URL}/auth/restore-impersonation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Para enviar cookies
    });

    if (!response.ok) {
      throw new Error('No se pudo restaurar la sesión original');
    }

    const data = await response.json();
    // 2. Usa el token original devuelto por el backend
    this.setToken(data.token);
    // 3. Refresca el usuario desde el backend
    return await this.fetchUserData();
  }
}; 