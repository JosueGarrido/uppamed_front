export interface MedicalRecord {
  id: number;
  date: string;
  diagnosis: string;
  patient_id: number;
  specialist_id: number;
  notes?: string;
} 