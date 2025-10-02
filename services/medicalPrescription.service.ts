import { api } from '@/lib/api';
import { MedicalPrescription, MedicalPrescriptionFormData, MedicalPrescriptionResponse } from '@/types/medicalPrescription';

export class MedicalPrescriptionService {
  // Crear receta médica
  async createMedicalPrescription(data: MedicalPrescriptionFormData): Promise<MedicalPrescription> {
    const response = await api.post<MedicalPrescriptionResponse>('/medicalPrescriptions', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al crear la receta médica');
    }
    
    return response.data.data as MedicalPrescription;
  }

  // Obtener recetas del especialista
  async getSpecialistPrescriptions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<{
    prescriptions: MedicalPrescription[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    
    const url = `/medicalPrescriptions/specialist?${queryParams.toString()}`;
    
    try {
      const response = await api.get<MedicalPrescriptionResponse>(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener las recetas médicas');
      }
      
      return response.data.data as {
        prescriptions: MedicalPrescription[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    } catch (error) {
      console.error('Error al obtener recetas del especialista:', error);
      throw error;
    }
  }

  // Obtener recetas del paciente
  async getPatientPrescriptions(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    prescriptions: MedicalPrescription[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<MedicalPrescriptionResponse>(
      `/medicalPrescriptions/patient?${queryParams.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener las recetas médicas');
    }
    
    return response.data.data as {
      prescriptions: MedicalPrescription[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }

  // Obtener receta por ID
  async getPrescriptionById(id: number): Promise<MedicalPrescription> {
    try {
      const response = await api.get<MedicalPrescriptionResponse>(`/medicalPrescriptions/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener la receta médica');
      }
      
      return response.data.data as MedicalPrescription;
    } catch (error) {
      console.error('Error al obtener receta por ID:', error);
      throw error;
    }
  }

  // Actualizar receta médica
  async updateMedicalPrescription(id: number, data: Partial<MedicalPrescriptionFormData>): Promise<MedicalPrescription> {
    try {
      const response = await api.put<MedicalPrescriptionResponse>(`/medicalPrescriptions/${id}`, data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar la receta médica');
      }
      
      return response.data.data as MedicalPrescription;
    } catch (error) {
      console.error('Error al actualizar receta médica:', error);
      throw error;
    }
  }

  // Anular receta médica
  async voidMedicalPrescription(id: number, reason?: string): Promise<MedicalPrescription> {
    try {
      const response = await api.patch<MedicalPrescriptionResponse>(`/medicalPrescriptions/${id}/void`, {
        reason: reason || 'Anulada por el especialista'
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al anular la receta médica');
      }
      
      return response.data.data as MedicalPrescription;
    } catch (error) {
      console.error('Error al anular receta médica:', error);
      throw error;
    }
  }
}

export const medicalPrescriptionService = new MedicalPrescriptionService();
