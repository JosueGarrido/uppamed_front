import { Appointment } from '@/types/appointment';
import { authService } from '@/services/auth.service';
import { buildApiUrl, createAuthHeaders } from '@/lib/config';

class AppointmentService {
  async getSpecialistAppointments(): Promise<Appointment[]> {
    try {
      console.log('🚀 Iniciando getSpecialistAppointments');
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/appointments'), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener las citas');
      }

      const data = await response.json();
      console.log('✅ Citas obtenidas:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo citas del especialista:', error);
      throw error;
    }
  }

  async getPatientAppointments(): Promise<Appointment[]> {
    try {
      console.log('🚀 Iniciando getPatientAppointments');
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/appointments/patient'), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener las citas del paciente');
      }

      const data = await response.json();
      console.log('✅ Citas del paciente obtenidas:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo citas del paciente:', error);
      throw error;
    }
  }

  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/appointments/appointments/${appointmentId}`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
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
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/appointments/appointments/${appointmentId}`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify({ status })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  }

  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/appointments'), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        throw new Error('Error al crear la cita');
      }

      const data = await response.json();
      return data.appointment || data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async getAppointmentsByTenant(tenantId: string | number): Promise<Appointment[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/appointments/${tenantId}/all`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener las citas del tenant');
      }

      return response.json();
    } catch (error) {
      console.error('Error obteniendo citas del tenant:', error);
      throw error;
    }
  }

  async updateAppointment(appointmentId: string | number, data: any): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/appointments/appointments/${appointmentId}`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la cita');
      }

      return response.json();
    } catch (error) {
      console.error('Error actualizando cita:', error);
      throw error;
    }
  }

  async deleteAppointment(appointmentId: string | number): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/appointments/appointments/${appointmentId}`), {
        method: 'DELETE',
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la cita');
      }

      return response.json();
    } catch (error) {
      console.error('Error eliminando cita:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService(); 