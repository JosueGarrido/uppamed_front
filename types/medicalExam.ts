export interface MedicalExam {
  id: number;
  patient_id: number;
  specialist_id: number;
  tenant_id: number;
  title: string;
  type: string;
  category: 'laboratorio' | 'imagenologia' | 'cardiologia' | 'neurologia' | 'gastroenterologia' | 'otorrinolaringologia' | 'oftalmologia' | 'dermatologia' | 'otros';
  description?: string;
  results: string;
  status: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  priority: 'baja' | 'normal' | 'alta' | 'urgente';
  scheduled_date?: string;
  performed_date?: string;
  report_date?: string;
  cost?: number;
  insurance_coverage: boolean;
  insurance_provider?: string;
  attachments?: Attachment[];
  notes?: string;
  is_abnormal: boolean;
  requires_followup: boolean;
  followup_date?: string;
  lab_reference?: string;
  technician?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  
  // Campos de relaciones (opcionales)
  patient?: {
    id: number;
    username: string;
    email: string;
    identification_number: string;
  };
  specialist?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface Attachment {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
}

export interface ExamStatistics {
  total: number;
  byStatus: {
    pendiente: number;
    en_proceso: number;
    completado: number;
    cancelado: number;
  };
  byCategory: {
    laboratorio: number;
    imagenologia: number;
    cardiologia: number;
    neurologia: number;
    gastroenterologia: number;
    otorrinolaringologia: number;
    oftalmologia: number;
    dermatologia: number;
    otros: number;
  };
  byPriority: {
    baja: number;
    normal: number;
    alta: number;
    urgente: number;
  };
  abnormal: number;
  requiresFollowup: number;
  totalCost: number;
}

export interface ExamFilters {
  status?: string;
  category?: string;
  type?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ExamPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExamListResponse {
  exams: MedicalExam[];
  pagination: ExamPagination;
} 