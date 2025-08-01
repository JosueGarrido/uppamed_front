import { authService } from './auth.service';
import { buildApiUrl, createAuthHeaders } from '@/lib/config';

interface Tenant {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

interface CreateTenantData {
  name: string;
  address: string;
}

export const tenantService = {
  async getAllTenants(): Promise<Tenant[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/tenants'), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener los tenants');
      }

      return response.json();
    } catch (error) {
      console.error('Error obteniendo tenants:', error);
      throw error;
    }
  },

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/tenants'), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el tenant');
      }

      return response.json();
    } catch (error) {
      console.error('Error creando tenant:', error);
      throw error;
    }
  },

  async getTenantById(id: number): Promise<Tenant> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/tenants/${id}`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener el tenant');
      }

      return response.json();
    } catch (error) {
      console.error('Error obteniendo tenant por ID:', error);
      throw error;
    }
  },

  async updateTenant(id: number, data: Partial<CreateTenantData>): Promise<Tenant> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/tenants/${id}`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el tenant');
      }

      return response.json();
    } catch (error) {
      console.error('Error actualizando tenant:', error);
      throw error;
    }
  },

  async deleteTenant(id: number): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/tenants/${id}`), {
        method: 'DELETE',
        headers: createAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar el tenant');
      }
    } catch (error) {
      console.error('Error eliminando tenant:', error);
      throw error;
    }
  },

  async getTenantConfig(tenantId: string | number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/tenants/${tenantId}/config`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener la configuración del tenant');
      }

      return response.json();
    } catch (error) {
      console.error('Error obteniendo configuración del tenant:', error);
      throw error;
    }
  },

  async updateTenantConfig(tenantId: string | number, configs: { key: string, value: string }[]) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/tenants/${tenantId}/config`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify({ configs })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la configuración del tenant');
      }

      return response.json();
    } catch (error) {
      console.error('Error actualizando configuración del tenant:', error);
      throw error;
    }
  },
}; 