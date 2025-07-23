import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://uppamed.vercel.app/auth';

function getAuthHeader() {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const dashboardService = {
  async getSuperAdminSummary() {
    const { data } = await axios.get(`${API_URL}/dashboard/super-admin/summary`, { headers: getAuthHeader() });
    return data;
  },
  async getTenantsActivity() {
    const { data } = await axios.get(`${API_URL}/dashboard/super-admin/tenants-activity`, { headers: getAuthHeader() });
    return data;
  },
  async getAppointmentsForTenant(tenantId: string | number) {
    const token = Cookies.get('token');
    const { data } = await axios.get(`https://uppamed.vercel.app/appointments/${tenantId}/all`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data;
  },
}; 