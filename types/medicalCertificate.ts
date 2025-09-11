export interface MedicalCertificate {
  id: number;
  patient_id: number;
  specialist_id: number;
  tenant_id: number;
  certificate_number: string;
  
  // Datos del paciente
  patient_name: string;
  patient_age: number;
  patient_address?: string;
  patient_phone?: string;
  patient_institution?: string;
  patient_occupation?: string;
  patient_cedula?: string;
  patient_clinical_history?: string;
  
  // Motivos de la enfermedad
  diagnosis: string;
  cie_code?: string;
  contingency_type: 'Enfermedad general' | 'Accidente de trabajo' | 'Enfermedad profesional' | 'Accidente común';
  rest_hours: number;
  rest_days: number;
  rest_from_date: string;
  rest_to_date: string;
  
  // Firma de responsabilidad
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

export interface MedicalCertificateFormData {
  patient_id: number;
  
  // Datos del paciente
  patient_name: string;
  patient_age: number;
  patient_address?: string;
  patient_phone?: string;
  patient_institution?: string;
  patient_occupation?: string;
  patient_cedula?: string;
  patient_clinical_history?: string;
  
  // Motivos de la enfermedad
  diagnosis: string;
  cie_code?: string;
  contingency_type: 'Enfermedad general' | 'Accidente de trabajo' | 'Enfermedad profesional' | 'Accidente común';
  rest_hours: number;
  rest_days: number;
  rest_from_date: string;
  rest_to_date: string;
  
  // Firma de responsabilidad
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

export interface MedicalCertificateResponse {
  success: boolean;
  message?: string;
  data: MedicalCertificate | {
    certificates: MedicalCertificate[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}
