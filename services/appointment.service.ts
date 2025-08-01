import { Appointment } from '@/types/appointment';
import axios from 'axios';
import { authService } from '@/services/auth.service';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://uppamed.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = authService.getToken(); // Usar el servicio de auth para obtener el token
  console.log('🔍 Verificando token para petición:', {
    url: config.url,
    method: config.method,
    hasToken: !!token
  });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Token agregado al header');
  } else {
    console.warn('⚠️ No se encontró token de autenticación');
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Error de autenticación:', error.response.data);
      // Si el token es inválido, cerrar sesión
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AppointmentService {
  async getSpecialistAppointments(): Promise<Appointment[]> {
    try {
      console.log('🚀 Iniciando getSpecialistAppointments');
      const response = await api.get('/appointments');
      console.log('✅ Citas obtenidas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo citas del especialista:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Error al obtener las citas');
      }
      throw new Error('Error al conectar con el servidor');
    }
  }

  async getPatientAppointments(): Promise<Appointment[]> {
    try {
      console.log('🚀 Iniciando getPatientAppointments');
      const response = await api.get('/appointments/patient');
      console.log('✅ Citas del paciente obtenidas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo citas del paciente:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Error al obtener las citas');
      }
      throw new Error('Error al conectar con el servidor');
    }
  }

  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    try {
      const response = await api.get(`/appointments/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return null;
    }
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: Appointment['status']
  ): Promise<boolean> {
    try {
      await api.put(`/appointments/appointments/${appointmentId}`, { status });
      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  }

  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    try {
      // Necesitamos el tenantId para crear la cita
      const tenantId = localStorage.getItem('tenantId') || '1'; // Por defecto
      const response = await api.post(`/appointments/${tenantId}/appointments`, appointmentData);
      return response.data.appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      return null;
    }
  }

  async getAppointmentsByTenant(tenantId: string | number): Promise<Appointment[]> {
    try {
      const response = await api.get(`/appointments/${tenantId}/all`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo citas del tenant:', error);
      throw error;
    }
  }

  async updateAppointment(appointmentId: string | number, data: any): Promise<any> {
    try {
      const response = await api.put(`/appointments/appointments/${appointmentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error actualizando cita:', error);
      throw error;
    }
  }

  async deleteAppointment(appointmentId: string | number): Promise<any> {
    try {
      const response = await api.delete(`/appointments/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando cita:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService(); 