// Tipos para Historia Clínica Completa
export interface ClinicalHistory {
  id: number;
  patient_id: number;
  specialist_id: number;
  tenant_id: number;
  
  // Información General
  establishment: string;
  clinical_history_number: string;
  
  // Motivo de Consulta
  consultation_reason_a?: string;
  consultation_reason_b?: string;
  consultation_reason_c?: string;
  consultation_reason_d?: string;
  
  // Antecedentes
  family_history?: string;
  clinical_history?: string;
  surgical_history?: string;
  gynecological_history?: string;
  habits?: string;
  
  // Enfermedad Actual
  current_illness?: string;
  
  // Revisión de Sistemas
  systems_review: SystemsReview;
  
  // Signos Vitales
  blood_pressure?: string;
  oxygen_saturation?: string;
  heart_rate?: string;
  respiratory_rate?: string;
  temperature?: string;
  weight?: string;
  height?: string;
  head_circumference?: string;
  
  // Examen Físico
  physical_examination: PhysicalExamination;
  
  // Diagnósticos
  diagnoses: Diagnosis[];
  
  // Planes de Tratamiento
  treatment_plans?: string;
  
  // Evolución y Prescripciones
  evolution_entries: EvolutionEntry[];
  
  // Fecha y Hora de Consulta
  consultation_date: string;
  consultation_time: string;
  
  // Estado del Registro
  status: 'borrador' | 'completado' | 'archivado';
  
  // Campos de compatibilidad
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  date?: string;
  
  createdAt: string;
  updatedAt: string;
  
  // Campos de relaciones (opcionales)
  patient?: {
    id: number;
    username: string;
    identification_number: string;
    gender?: string;
    age?: number;
  };
  specialist?: {
    id: number;
    username: string;
    specialty?: string;
  };
}

export interface SystemsReview {
  sense_organs: 'CP' | 'SP';
  respiratory: 'CP' | 'SP';
  cardiovascular: 'CP' | 'SP';
  digestive: 'CP' | 'SP';
  genital: 'CP' | 'SP';
  urinary: 'CP' | 'SP';
  musculoskeletal: 'CP' | 'SP';
  endocrine: 'CP' | 'SP';
  hemolymphatic: 'CP' | 'SP';
  nervous: 'CP' | 'SP';
}

export interface PhysicalExamination {
  skin_appendages: 'CP' | 'SP';
  head: 'CP' | 'SP';
  eyes: 'CP' | 'SP';
  ears: 'CP' | 'SP';
  nose: 'CP' | 'SP';
  mouth: 'CP' | 'SP';
  oropharynx: 'CP' | 'SP';
  neck: 'CP' | 'SP';
  axillae_breasts: 'CP' | 'SP';
  thorax: 'CP' | 'SP';
  abdomen: 'CP' | 'SP';
  vertebral_column: 'CP' | 'SP';
  groin_perineum: 'CP' | 'SP';
  upper_limbs: 'CP' | 'SP';
  lower_limbs: 'CP' | 'SP';
}

export interface Diagnosis {
  id: number;
  diagnosis: string;
  type: 'presuntivo' | 'definitivo';
  cie_code?: string;
  date: string;
  specialist_id: number;
}

export interface EvolutionEntry {
  id: number;
  evolution_note: string;
  prescription?: string;
  prescription_code?: string;
  date: string;
  time: string;
  specialist_id: number;
  specialist_name: string;
}

// Alias para compatibilidad
export type MedicalRecord = ClinicalHistory;

// Tipos para formularios
export interface ClinicalHistoryFormData {
  patient_id: number;
  specialist_id: number;
  clinical_history_number?: string;
  consultation_reason_a?: string;
  consultation_reason_b?: string;
  consultation_reason_c?: string;
  consultation_reason_d?: string;
  family_history?: string;
  clinical_history?: string;
  surgical_history?: string;
  gynecological_history?: string;
  habits?: string;
  current_illness?: string;
  systems_review?: Partial<SystemsReview>;
  blood_pressure?: string;
  oxygen_saturation?: string;
  heart_rate?: string;
  respiratory_rate?: string;
  temperature?: string;
  weight?: string;
  height?: string;
  head_circumference?: string;
  physical_examination?: Partial<PhysicalExamination>;
  diagnoses?: Diagnosis[];
  treatment_plans?: string;
  evolution_entries?: EvolutionEntry[];
  consultation_date?: string;
  consultation_time?: string;
  status?: 'borrador' | 'completado' | 'archivado';
}

// Tipos para respuestas de API
export interface ClinicalHistoryListResponse {
  medicalRecords: ClinicalHistory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Tipos para filtros
export interface ClinicalHistoryFilters {
  search?: string;
  patient_id?: number;
  specialist_id?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Tipos para estadísticas
export interface ClinicalHistoryStats {
  total: number;
  byStatus: {
    borrador: number;
    completado: number;
    archivado: number;
  };
  bySpecialist: Array<{
    specialist_id: number;
    specialist_name: string;
    count: number;
  }>;
  recentRecords: ClinicalHistory[];
} 