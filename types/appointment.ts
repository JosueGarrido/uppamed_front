export interface Patient {
  id: number;
  username: string;
  email: string;
  identification_number: string;
}

export interface Specialist {
  id: number;
  username: string;
  email: string;
  specialty?: string;
}

export interface Appointment {
  id: number;
  date: string;
  time?: string;
  reason: string;
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  patient: Patient;
  specialist: Specialist;
  appointmentPatient?: Patient;
  appointmentSpecialist?: Specialist;
  specialist_id: number;
  patient_id: number;
  tenant_id: number;
  notes?: string;
} 