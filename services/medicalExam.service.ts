import { authService } from './auth.service';
import { buildApiUrl, createAuthHeaders } from '@/lib/config';
import { MedicalExam, ExamStatistics, ExamFilters, ExamListResponse } from '@/types/medicalExam';

class MedicalExamService {
  async getMyMedicalExams(filters?: ExamFilters): Promise<ExamListResponse> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir query parameters
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const url = filters ? `${buildApiUrl('/medical-exams')}?${params.toString()}` : buildApiUrl('/medical-exams');
      
      const response = await fetch(url, {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener los exámenes médicos');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo exámenes médicos:', error);
      throw error;
    }
  }

  async getMedicalExamById(id: number): Promise<MedicalExam> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/medical-exams/${id}`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener el examen médico');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo examen médico:', error);
      throw error;
    }
  }

  async createMedicalExam(examData: Partial<MedicalExam>, files?: File[]): Promise<MedicalExam> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Creating medical exam:', examData);

      const formData = new FormData();
      
      // Agregar datos del examen
      Object.entries(examData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Agregar archivos si existen
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(buildApiUrl('/medical-exams'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No incluir Content-Type para que el navegador lo establezca automáticamente con el boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el examen médico');
      }

      const data = await response.json();
      console.log('Medical exam created:', data);
      return data.medicalExam || data;
    } catch (error) {
      console.error('Error creando examen médico:', error);
      throw error;
    }
  }

  async updateMedicalExam(id: number, examData: Partial<MedicalExam>, files?: File[]): Promise<MedicalExam> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Updating medical exam:', id, examData);

      const formData = new FormData();
      
      // Agregar datos del examen
      Object.entries(examData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Agregar archivos si existen
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(buildApiUrl(`/medical-exams/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el examen médico');
      }

      const data = await response.json();
      console.log('Medical exam updated:', data);
      return data.medicalExam || data;
    } catch (error) {
      console.error('Error actualizando examen médico:', error);
      throw error;
    }
  }

  async deleteMedicalExam(id: number): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Deleting medical exam:', id);

      const response = await fetch(buildApiUrl(`/medical-exams/${id}`), {
        method: 'DELETE',
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar el examen médico');
      }

      console.log('Medical exam deleted successfully');
    } catch (error) {
      console.error('Error eliminando examen médico:', error);
      throw error;
    }
  }

  async getExamStatistics(filters?: { startDate?: string; endDate?: string }): Promise<ExamStatistics> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir query parameters
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const url = filters ? `${buildApiUrl('/medical-exams/statistics/summary')}?${params.toString()}` : buildApiUrl('/medical-exams/statistics/summary');
      
      const response = await fetch(url, {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  async getExamsRequiringFollowup(): Promise<MedicalExam[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/medical-exams/followup/required'), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener exámenes con seguimiento');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo exámenes con seguimiento:', error);
      throw error;
    }
  }

  // Método para obtener tipos de exámenes predefinidos
  getExamTypes() {
    return [
      { value: 'analisis_sangre', label: 'Análisis de Sangre', category: 'laboratorio' },
      { value: 'analisis_orina', label: 'Análisis de Orina', category: 'laboratorio' },
      { value: 'analisis_heces', label: 'Análisis de Heces', category: 'laboratorio' },
      { value: 'rayos_x', label: 'Rayos X', category: 'imagenologia' },
      { value: 'resonancia_magnetica', label: 'Resonancia Magnética', category: 'imagenologia' },
      { value: 'tomografia', label: 'Tomografía', category: 'imagenologia' },
      { value: 'ecografia', label: 'Ecografía', category: 'imagenologia' },
      { value: 'electrocardiograma', label: 'Electrocardiograma', category: 'cardiologia' },
      { value: 'ecocardiograma', label: 'Ecocardiograma', category: 'cardiologia' },
      { value: 'prueba_esfuerzo', label: 'Prueba de Esfuerzo', category: 'cardiologia' },
      { value: 'eeg', label: 'Electroencefalograma (EEG)', category: 'neurologia' },
      { value: 'emg', label: 'Electromiografía (EMG)', category: 'neurologia' },
      { value: 'endoscopia', label: 'Endoscopia', category: 'gastroenterologia' },
      { value: 'colonoscopia', label: 'Colonoscopia', category: 'gastroenterologia' },
      { value: 'audiometria', label: 'Audiometría', category: 'otorrinolaringologia' },
      { value: 'rinoscopia', label: 'Rinoscopia', category: 'otorrinolaringologia' },
      { value: 'examen_oftalmologico', label: 'Examen Oftalmológico', category: 'oftalmologia' },
      { value: 'biopsia_piel', label: 'Biopsia de Piel', category: 'dermatologia' },
      { value: 'dermatoscopia', label: 'Dermatoscopia', category: 'dermatologia' },
      { value: 'otro', label: 'Otro', category: 'otros' }
    ];
  }

  // Método para obtener categorías de exámenes
  getExamCategories() {
    return [
      { value: 'laboratorio', label: 'Laboratorio' },
      { value: 'imagenologia', label: 'Imagenología' },
      { value: 'cardiologia', label: 'Cardiología' },
      { value: 'neurologia', label: 'Neurología' },
      { value: 'gastroenterologia', label: 'Gastroenterología' },
      { value: 'otorrinolaringologia', label: 'Otorrinolaringología' },
      { value: 'oftalmologia', label: 'Oftalmología' },
      { value: 'dermatologia', label: 'Dermatología' },
      { value: 'otros', label: 'Otros' }
    ];
  }

  // Método para obtener estados de exámenes
  getExamStatuses() {
    return [
      { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
      { value: 'en_proceso', label: 'En Proceso', color: 'blue' },
      { value: 'completado', label: 'Completado', color: 'green' },
      { value: 'cancelado', label: 'Cancelado', color: 'red' }
    ];
  }

  // Método para obtener prioridades
  getExamPriorities() {
    return [
      { value: 'baja', label: 'Baja', color: 'gray' },
      { value: 'normal', label: 'Normal', color: 'blue' },
      { value: 'alta', label: 'Alta', color: 'orange' },
      { value: 'urgente', label: 'Urgente', color: 'red' }
    ];
  }
}

export const medicalExamService = new MedicalExamService(); 