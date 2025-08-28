import { authService } from './auth.service';
import { buildApiUrl, createAuthHeaders } from '@/lib/config';
import { 
  ClinicalHistory, 
  ClinicalHistoryFormData, 
  ClinicalHistoryListResponse,
  Diagnosis,
  EvolutionEntry,
  SystemsReview,
  PhysicalExamination
} from '@/types/medicalRecord';

class MedicalRecordService {
  async getMyMedicalRecords(userRole?: string): Promise<ClinicalHistory[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // El backend tiene endpoints específicos por rol
      let endpoint;
      if (userRole === 'Administrador') {
        endpoint = '/medical-records/admin';
      } else if (userRole === 'Especialista') {
        endpoint = '/medical-records/specialist';
      } else {
        endpoint = '/medical-records';
      }
      
      const response = await fetch(buildApiUrl(endpoint), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener las historias clínicas');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.medicalRecords || data.records || [];
    } catch (error) {
      console.error('Error obteniendo historias clínicas:', error);
      throw error;
    }
  }

  async createMedicalRecord(recordData: ClinicalHistoryFormData): Promise<ClinicalHistory> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Creating clinical history:', recordData);

      const response = await fetch(buildApiUrl('/medical-records'), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error response:', response.status, errorData);
        throw new Error(errorData.message || `Error al crear la historia clínica (${response.status})`);
      }

      const data = await response.json();
      console.log('Clinical history created:', data);
      return data.medicalRecord || data;
    } catch (error) {
      console.error('Error creando historia clínica:', error);
      throw error;
    }
  }

  async updateMedicalRecord(id: number, recordData: Partial<ClinicalHistoryFormData>): Promise<ClinicalHistory> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Updating clinical history:', id, recordData);

      const response = await fetch(buildApiUrl(`/medical-records/${id}`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar la historia clínica');
      }

      const data = await response.json();
      console.log('Clinical history updated:', data);
      return data.medicalRecord || data;
    } catch (error) {
      console.error('Error actualizando historia clínica:', error);
      throw error;
    }
  }

  async getMedicalRecordById(id: number): Promise<ClinicalHistory> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/medical-records/${id}`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener la historia clínica');
      }

      return response.json();
    } catch (error) {
      console.error('Error obteniendo historia clínica:', error);
      throw error;
    }
  }

  async deleteMedicalRecord(id: number): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/medical-records/${id}`), {
        method: 'DELETE',
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar la historia clínica');
      }
    } catch (error) {
      console.error('Error eliminando historia clínica:', error);
      throw error;
    }
  }

  // Nuevos métodos para funcionalidades avanzadas de historia clínica

  async addDiagnosis(recordId: number, diagnosis: Omit<Diagnosis, 'id' | 'date' | 'specialist_id'>): Promise<Diagnosis> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/medical-records/${recordId}/diagnosis`), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(diagnosis)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al agregar el diagnóstico');
      }

      const data = await response.json();
      return data.diagnosis;
    } catch (error) {
      console.error('Error agregando diagnóstico:', error);
      throw error;
    }
  }

  async addEvolutionEntry(recordId: number, evolution: Omit<EvolutionEntry, 'id' | 'date' | 'time' | 'specialist_id' | 'specialist_name'>): Promise<EvolutionEntry> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/medical-records/${recordId}/evolution`), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(evolution)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al agregar la entrada de evolución');
      }

      const data = await response.json();
      return data.entry;
    } catch (error) {
      console.error('Error agregando entrada de evolución:', error);
      throw error;
    }
  }

  async updateSystemsReview(recordId: number, systemsReview: SystemsReview): Promise<SystemsReview> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/medical-records/${recordId}/systems-review`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify({ systems_review: systemsReview })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar la revisión de sistemas');
      }

      const data = await response.json();
      return data.systems_review;
    } catch (error) {
      console.error('Error actualizando revisión de sistemas:', error);
      throw error;
    }
  }

  async updatePhysicalExamination(recordId: number, physicalExamination: PhysicalExamination): Promise<PhysicalExamination> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/medical-records/${recordId}/physical-examination`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify({ physical_examination: physicalExamination })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el examen físico');
      }

      const data = await response.json();
      return data.physical_examination;
    } catch (error) {
      console.error('Error actualizando examen físico:', error);
      throw error;
    }
  }

  async updateStatus(recordId: number, status: 'borrador' | 'completado' | 'archivado'): Promise<string> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/medical-records/${recordId}/status`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el estado');
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  }
}

export const medicalRecordService = new MedicalRecordService(); 