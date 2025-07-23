export interface MedicalExam {
  id: number;
  date: string;
  type: string;
  patient_id: number;
  specialist_id: number;
  result?: string;
} 