import axios from 'axios';
import { authService } from './auth.service';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://uppamed.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

class MedicalRecordService {
  async getMyMedicalRecords(userRole?: string) {
    try {
      // Si el usuario es especialista, usa la ruta /medical-records/specialist
      const endpoint = userRole === 'Especialista'
        ? '/medical-records/specialist'
        : '/medical-records';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo registros médicos:', error);
      throw new Error('Error al obtener los registros médicos');
    }
  }
}

export const medicalRecordService = new MedicalRecordService(); 