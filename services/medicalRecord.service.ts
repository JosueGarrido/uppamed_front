import axios from 'axios';
import { authService } from './auth.service';
import { MedicalRecord } from '@/types/medicalRecord';

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
  async getMyMedicalRecords(userRole?: string): Promise<MedicalRecord[]> {
    try {
      const endpoint = userRole === 'Especialista'
        ? '/medical-records/specialist'
        : '/medical-records';
      const response = await api.get<MedicalRecord[]>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo registros médicos:', error);
      throw new Error('Error al obtener los registros médicos');
    }
  }

  async createMedicalRecord(recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    try {
      const response = await api.post<MedicalRecord>('/medical-records', recordData);
      return response.data;
    } catch (error) {
      console.error('Error creando registro médico:', error);
      throw new Error('Error al crear el registro médico');
    }
  }
}

export const medicalRecordService = new MedicalRecordService(); 