export interface MedicalExam {
  id: number;
  patient_id: number;
  specialist_id: number;
  tenant_id: number;
  type: string;
  results: string;
  attachments?: any;
  date: string;
  createdAt: string;
  updatedAt: string;
  title?: string;
  description?: string;
  status?: string;
} 