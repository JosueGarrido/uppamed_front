import { authService } from './auth.service';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://uppamed.vercel.app';

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
    const token = authService.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/tenants`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener los tenants');
    }

    return response.json();
  },

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear el tenant');
    }

    return response.json();
  },

  async getTenantById(id: number): Promise<Tenant> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/tenants/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener el tenant');
    }

    return response.json();
  },

  async updateTenant(id: number, data: Partial<CreateTenantData>): Promise<Tenant> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/tenants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el tenant');
    }

    return response.json();
  },

  async deleteTenant(id: number): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_URL}/tenants/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar el tenant');
    }
  },

  async getTenantConfig(tenantId: string | number) {
    const { data } = await axios.get(`${API_URL}/tenants/${tenantId}/config`, { headers: getAuthHeader() });
    return data;
  },

  async updateTenantConfig(tenantId: string | number, configs: { key: string, value: string }[]) {
    const { data } = await axios.put(`${API_URL}/tenants/${tenantId}/config`, { configs }, { headers: getAuthHeader() });
    return data;
  },
};

function getAuthHeader() {
  const token = Cookies.get('token') || authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
} 