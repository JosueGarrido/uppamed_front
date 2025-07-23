import axios from 'axios';
import Cookies from 'js-cookie';
import { User } from '@/types/auth';

const API_URL = 'https://uppamed.vercel.app';

function getAuthHeader() {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const userService = {
  async getUsersByTenant(tenantId: string | number): Promise<User[]> {
    const { data } = await axios.get<{ users: User[] } | User[]>(`${API_URL}/users/${tenantId}/users`, { headers: getAuthHeader() });
    // Si la API devuelve { users: User[] }, extrae el array; si es User[], retorna directo
    if (Array.isArray(data)) return data;
    if ('users' in data) return data.users;
    return [];
  },
  async getUserById(id: string | number): Promise<User> {
    const { data } = await axios.get<User>(`${API_URL}/users/users/${id}`, { headers: getAuthHeader() });
    return data;
  },
  async createUser(tenantId: string | number, user: Partial<User>): Promise<User> {
    const { data } = await axios.post<User>(`${API_URL}/users/${tenantId}/users`, user, { headers: getAuthHeader() });
    return data;
  },
  async updateUser(id: string | number, user: Partial<User>): Promise<User> {
    const { data } = await axios.put<User>(`${API_URL}/users/users/${id}`, user, { headers: getAuthHeader() });
    return data;
  },
  async deleteUser(id: string | number): Promise<{ message: string }> {
    const { data } = await axios.delete<{ message: string }>(`${API_URL}/users/users/${id}`, { headers: getAuthHeader() });
    return data;
  },
}; 