import { api } from '@/lib/api';
import { MedicalCertificate, MedicalCertificateFormData, MedicalCertificateResponse } from '@/types/medicalCertificate';

export class MedicalCertificateService {
  // Crear certificado médico
  async createMedicalCertificate(data: MedicalCertificateFormData): Promise<MedicalCertificate> {
    const response = await api.post<MedicalCertificateResponse>('/medicalCertificates', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al crear el certificado médico');
    }
    
    return response.data.data as MedicalCertificate;
  }

  // Obtener certificados del especialista
  async getSpecialistCertificates(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<{
    certificates: MedicalCertificate[];
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
    
    const url = `/medicalCertificates/specialist?${queryParams.toString()}`;
    console.log('📋 Obteniendo certificados del especialista:', url);
    console.log('🔍 Parámetros:', params);
    
    try {
      const response = await api.get<MedicalCertificateResponse>(url);
      
      console.log('✅ Respuesta recibida:', JSON.stringify(response.data, null, 2));
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener los certificados médicos');
      }
      
      const result = response.data.data as {
        certificates: MedicalCertificate[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
      
      console.log('📊 Certificados encontrados:', result.certificates.length);
      console.log('📄 Paginación:', result.pagination);
      
      return result;
    } catch (error) {
      console.error('❌ Error en getSpecialistCertificates:', error);
      throw error;
    }
  }

  // Obtener certificados del paciente
  async getPatientCertificates(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    certificates: MedicalCertificate[];
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
    
    const response = await api.get<MedicalCertificateResponse>(
      `/medicalCertificates/patient?${queryParams.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener los certificados médicos');
    }
    
    return response.data.data as {
      certificates: MedicalCertificate[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }

  // Obtener certificado por ID
  async getCertificateById(id: number): Promise<MedicalCertificate> {
    const response = await api.get<MedicalCertificateResponse>(`/medicalCertificates/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener el certificado médico');
    }
    
    return response.data.data as MedicalCertificate;
  }

  // Actualizar certificado médico
  async updateMedicalCertificate(id: number, data: Partial<MedicalCertificateFormData>): Promise<MedicalCertificate> {
    const response = await api.put<MedicalCertificateResponse>(`/medicalCertificates/${id}`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al actualizar el certificado médico');
    }
    
    return response.data.data as MedicalCertificate;
  }

  // Anular certificado médico
  async voidMedicalCertificate(id: number): Promise<void> {
    const response = await api.patch<MedicalCertificateResponse>(`/medicalCertificates/${id}/void`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al anular el certificado médico');
    }
  }
}

export const medicalCertificateService = new MedicalCertificateService();
