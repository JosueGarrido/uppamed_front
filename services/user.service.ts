import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://uppamed.vercel.app';

function getAuthHeader() {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const userService = {
  async getUsersByTenant(tenantId: string | number) {
    const { data } = await axios.get(`${API_URL}/users/${tenantId}/users`, { headers: getAuthHeader() });
    return data;
  },
  async getUserById(id: string | number) {
    const { data } = await axios.get(`${API_URL}/users/users/${id}`, { headers: getAuthHeader() });
    return data;
  },
  async createUser(tenantId: string | number, user: any) {
    const { data } = await axios.post(`${API_URL}/users/${tenantId}/users`, user, { headers: getAuthHeader() });
    return data;
  },
  async updateUser(id: string | number, user: any) {
    const { data } = await axios.put(`${API_URL}/users/users/${id}`, user, { headers: getAuthHeader() });
    return data;
  },
  async deleteUser(id: string | number) {
    const { data } = await axios.delete(`${API_URL}/users/users/${id}`, { headers: getAuthHeader() });
    return data;
  },
}; 