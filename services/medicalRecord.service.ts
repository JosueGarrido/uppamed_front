import { authService } from './auth.service';
import { buildApiUrl, createAuthHeaders } from '@/lib/config';
import { MedicalRecord } from '@/types/medicalRecord';

class MedicalRecordService {
  async getMyMedicalRecords(userRole?: string): Promise<MedicalRecord[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // El backend tiene endpoints específicos por rol
      const endpoint = userRole === 'Especialista'
        ? '/medical-records/specialist'
        : '/medical-records';
      
      const response = await fetch(buildApiUrl(endpoint), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener los registros médicos');
      }

      return response.json();
    } catch (error) {
      console.error('Error obteniendo registros médicos:', error);
      throw error;
    }
  }

  async createMedicalRecord(recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/medical-records'), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        throw new Error('Error al crear el registro médico');
      }

      return response.json();
    } catch (error) {
      console.error('Error creando registro médico:', error);
      throw error;
    }
  }
}

export const medicalRecordService = new MedicalRecordService(); 