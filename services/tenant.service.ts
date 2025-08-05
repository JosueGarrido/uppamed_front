import { authService } from './auth.service';
import { buildApiUrl, createAuthHeaders } from '@/lib/config';

interface TenantConfigItem {
  key: string;
  value: string;
}

class TenantService {
  async getTenantConfig(tenantId?: number): Promise<TenantConfigItem[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Si no se proporciona tenantId, usar la ruta para el tenant propio
      const endpoint = tenantId ? `/tenants/${tenantId}/config` : '/tenants/my/config';
      const response = await fetch(buildApiUrl(endpoint), {
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

  async updateTenantConfig(tenantId: number | undefined, configs: TenantConfigItem[]): Promise<TenantConfigItem[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Si no se proporciona tenantId, usar la ruta para el tenant propio
      const endpoint = tenantId ? `/tenants/${tenantId}/config` : '/tenants/my/config';
      const response = await fetch(buildApiUrl(endpoint), {
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

  async getTenantById(tenantId?: number): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Si no se proporciona tenantId, usar la ruta para el tenant propio
      const endpoint = tenantId ? `/tenants/${tenantId}` : '/tenants/my/tenant';
      const response = await fetch(buildApiUrl(endpoint), {
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

  async updateTenant(tenantId: number | undefined, tenantData: { name?: string; address?: string }): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Si no se proporciona tenantId, usar la ruta para el tenant propio
      const endpoint = tenantId ? `/tenants/${tenantId}` : '/tenants/my/tenant';
      const response = await fetch(buildApiUrl(endpoint), {
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