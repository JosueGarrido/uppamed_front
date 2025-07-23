import axios from 'axios';
import { authService } from './auth.service';
import { MedicalExam } from '@/types/medicalExam';

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

class MedicalExamService {
  async getMyMedicalExams(): Promise<MedicalExam[]> {
    try {
      const response = await api.get<MedicalExam[]>('/medical-exams');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo exámenes médicos:', error);
      throw new Error('Error al obtener los exámenes médicos');
    }
  }
}

export const medicalExamService = new MedicalExamService(); 