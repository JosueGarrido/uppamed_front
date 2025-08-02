import { authService } from './auth.service';
import { buildApiUrl, createAuthHeaders } from '@/lib/config';
import { MedicalExam } from '@/types/medicalExam';

class MedicalExamService {
  async getMyMedicalExams(): Promise<MedicalExam[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // El backend usa el mismo endpoint para todos los roles, pero filtra por rol internamente
      const response = await fetch(buildApiUrl('/medical-exams'), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener los exámenes médicos');
      }

      return response.json();
    } catch (error) {
      console.error('Error obteniendo exámenes médicos:', error);
      throw error;
    }
  }

  async createMedicalExam(examData: Partial<MedicalExam>): Promise<MedicalExam> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/medical-exams'), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(examData)
      });

      if (!response.ok) {
        throw new Error('Error al crear el examen médico');
      }

      return response.json();
    } catch (error) {
      console.error('Error creando examen médico:', error);
      throw error;
    }
  }
}

export const medicalExamService = new MedicalExamService(); 