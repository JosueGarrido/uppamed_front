export interface MedicalRecord {
  id: number;
  patient_id: number;
  specialist_id: number;
  tenant_id: number;
  diagnosis: string;
  treatment: string;
  observations?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  // Campos de relaciones (opcionales)
  patient?: {
    id: number;
    username: string;
    identification_number: string;
  };
  specialist?: {
    id: number;
    username: string;
    specialty?: string;
  };
} 