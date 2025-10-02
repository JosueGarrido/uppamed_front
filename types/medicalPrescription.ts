export interface Medication {
  name: string;
  quantity: number;
  quantity_text: string; // Para mostrar en texto (ej: "DIEZ", "UNO")
  instructions?: string; // Indicaciones específicas para este medicamento (ej: "Tomar cada 8 horas después de las comidas")
}

export interface Instruction {
  medication_name: string;
  instruction: string;
}

export interface MedicalPrescription {
  id: number;
  patient_id: number;
  specialist_id: number;
  tenant_id: number;
  prescription_number: string;
  
  // Datos del paciente
  patient_name: string;
  patient_age: number;
  patient_cedula?: string;
  patient_city?: string;
  
  // Medicamentos prescritos
  medications: Medication[];
  
  // Diagnóstico
  diagnosis: string;
  cie_code?: string;
  
  // Antecedentes de alergias
  allergy_history?: string;
  
  // Instrucciones de uso
  instructions: Instruction[];
  
  // Próxima cita
  next_appointment_date?: string;
  next_appointment_time?: string;
  
  // Recomendaciones no farmacológicas
  non_pharmacological_recommendations?: string;
  
  // Información del médico
  doctor_name: string;
  doctor_cedula: string;
  doctor_specialty: string;
  doctor_email?: string;
  
  // Información del establecimiento
  establishment_name: string;
  establishment_address?: string;
  establishment_phone?: string;
  establishment_ruc?: string;
  
  // Metadatos
  issue_date: string;
  status: 'activo' | 'anulado';
  observations?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relaciones
  patient?: {
    id: number;
    username: string;
    email: string;
    cedula?: string;
    phone?: string;
  };
  specialist?: {
    id: number;
    username: string;
    email: string;
    cedula?: string;
    speciality?: string;
  };
  tenant?: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    ruc?: string;
  };
}

export interface MedicalPrescriptionFormData {
  patient_id: number;
  
  // Datos del paciente
  patient_name: string;
  patient_age: number;
  patient_cedula?: string;
  patient_city?: string;
  
  // Medicamentos prescritos
  medications: Medication[];
  
  // Diagnóstico
  diagnosis: string;
  cie_code?: string;
  
  // Antecedentes de alergias
  allergy_history?: string;
  
  // Instrucciones de uso
  instructions: Instruction[];
  
  // Próxima cita
  next_appointment_date?: string;
  next_appointment_time?: string;
  
  // Recomendaciones no farmacológicas
  non_pharmacological_recommendations?: string;
  
  // Información del médico
  doctor_name: string;
  doctor_cedula: string;
  doctor_specialty: string;
  doctor_email?: string;
  
  // Información del establecimiento
  establishment_name: string;
  establishment_address?: string;
  establishment_phone?: string;
  establishment_ruc?: string;
  
  // Metadatos
  issue_date: string;
  observations?: string;
}

export interface MedicalPrescriptionResponse {
  success: boolean;
  message?: string;
  data: MedicalPrescription | {
    prescriptions: MedicalPrescription[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}
