import { buildApiUrl } from '@/lib/config';

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
}

export const specialistService = new SpecialistService(); 