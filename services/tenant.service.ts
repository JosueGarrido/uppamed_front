import { authService } from './auth.service';
import { buildApiUrl, createAuthHeaders } from '@/lib/config';

interface TenantConfigItem {
  key: string;
  value: string;
}

class TenantService {
  async getTenantConfig(tenantId: number): Promise<TenantConfigItem[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/tenants/${tenantId}/config`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener la configuración del tenant');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo configuración del tenant:', error);
      throw error;
    }
  }

  async updateTenantConfig(tenantId: number, configs: TenantConfigItem[]): Promise<TenantConfigItem[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/tenants/${tenantId}/config`), {
        method: 'PUT',
        headers: {
          ...createAuthHeaders(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ configs })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar la configuración del tenant');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando configuración del tenant:', error);
      throw error;
    }
  }

  async getTenantById(tenantId: number): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/tenants/${tenantId}`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener el tenant');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo tenant:', error);
      throw error;
    }
  }

  async updateTenant(tenantId: number, tenantData: { name?: string; address?: string }): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/tenants/${tenantId}`), {
        method: 'PUT',
        headers: {
          ...createAuthHeaders(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tenantData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el tenant');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando tenant:', error);
      throw error;
    }
  }
}

export const tenantService = new TenantService(); 