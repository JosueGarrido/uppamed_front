import { buildApiUrl, createAuthHeaders } from '@/lib/config';
import { authService } from './auth.service';

export interface SpecialistSchedule {
  id: number;
  specialist_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  tenant_id: number;
}

export interface SpecialistBreak {
  id: number;
  specialist_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  description: string;
  tenant_id: number;
}

export interface AvailabilityResponse {
  available: boolean;
  reason?: string;
}

export interface AvailableSlotsResponse {
  availableSlots: string[];
}

export interface ScheduleResponse {
  schedules: SpecialistSchedule[];
  breaks: SpecialistBreak[];
}

class SpecialistService {
  // Obtener horarios de un especialista
  async getSpecialistSchedule(tenantId: string | number, specialistId: string | number) {
    const response = await fetch(buildApiUrl(`/specialists/${tenantId}/specialists/${specialistId}/schedule`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener horarios del especialista');
    }

    return response.json();
  }

  // Actualizar horarios de un especialista
  async updateSpecialistSchedule(tenantId: string | number, specialistId: string | number, schedules: Partial<SpecialistSchedule>[]) {
    const response = await fetch(buildApiUrl(`/specialists/${tenantId}/specialists/${specialistId}/schedule`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(schedules)
    });

    if (!response.ok) {
      throw new Error('Error al actualizar horarios del especialista');
    }

    return response.json();
  }

  // Verificar disponibilidad de un especialista
  async checkSpecialistAvailability(tenantId: string | number, specialistId: string | number, date: string, time: string): Promise<AvailabilityResponse> {
    const response = await fetch(buildApiUrl(`/specialists/${tenantId}/specialists/${specialistId}/availability?date=${date}&time=${time}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al verificar disponibilidad');
    }

    return response.json();
  }

  // Obtener slots disponibles de un especialista para una fecha
  async getAvailableSlots(tenantId: string | number, specialistId: string | number, date: string): Promise<AvailableSlotsResponse> {
    const response = await fetch(buildApiUrl(`/specialists/${tenantId}/specialists/${specialistId}/available-slots?date=${date}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener slots disponibles');
    }

    return response.json();
  }

  // Método para que el especialista obtenga su propio horario
  async getMySchedule(): Promise<ScheduleResponse> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const user = await authService.fetchUserData();
      if (!user?.tenant_id) {
        throw new Error('Usuario no tiene tenant asignado');
      }

      const response = await fetch(buildApiUrl(`/specialists/${user.tenant_id}/specialists/${user.id}/schedule`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener el horario');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting my schedule:', error);
      throw error;
    }
  }

  // Método para que el especialista actualice su propio horario
  async updateMySchedule(schedules: SpecialistSchedule[]): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const user = await authService.fetchUserData();
      if (!user?.tenant_id) {
        throw new Error('Usuario no tiene tenant asignado');
      }

      const response = await fetch(buildApiUrl(`/specialists/${user.tenant_id}/specialists/${user.id}/schedule`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(schedules)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el horario');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating my schedule:', error);
      throw error;
    }
  }

  // Método para que el especialista verifique su propia disponibilidad
  async checkMyAvailability(date: string, time: string): Promise<AvailabilityResponse> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/specialists/my-availability?date=${date}&time=${time}`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al verificar disponibilidad');
      }

      return response.json();
    } catch (error) {
      console.error('Error checking my availability:', error);
      throw error;
    }
  }

  // Método para que el especialista obtenga sus slots disponibles
  async getMyAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/specialists/my-available-slots?date=${date}`), {
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al obtener slots disponibles');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting my available slots:', error);
      throw error;
    }
  }
}

export const specialistService = new SpecialistService(); 