import { authService } from './auth.service';
import { buildApiUrl, createAuthHeaders } from '@/lib/config';
import { User } from '@/types/auth';

export const userService = {
  async getUsersByTenant(tenantId: string | number): Promise<User[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/users/${tenantId}/users`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios del tenant');
      }

      const data = await response.json();
      if (Array.isArray(data)) return data;
      if ('users' in data) return data.users;
      return [];
    } catch (error) {
      console.error('Error obteniendo usuarios del tenant:', error);
      throw error;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/users/all'), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener todos los usuarios');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo todos los usuarios:', error);
      throw error;
    }
  },

  async getUserById(id: string | number): Promise<User> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/users/users/${id}`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener el usuario');
      }

      return response.json();
    } catch (error) {
      console.error('Error obteniendo usuario por ID:', error);
      throw error;
    }
  },

  async createUser(userData: Partial<User> & { tenant_id?: number }): Promise<User> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Si no hay tenant_id, usar endpoint global, sino endpoint específico del tenant
      const url = userData.tenant_id 
        ? buildApiUrl(`/users/${userData.tenant_id}/users`)
        : buildApiUrl('/users');

      const response = await fetch(url, {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el usuario');
      }

      return response.json();
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  },

  async updateUser(id: string | number, userData: Partial<User>): Promise<User> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/users/users/${id}`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el usuario');
      }

      return response.json();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  },

  async deleteUser(id: string | number): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/users/users/${id}`), {
        method: 'DELETE',
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }
}; 