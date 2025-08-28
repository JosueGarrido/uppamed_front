"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { userService } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { ClinicalHistory, ClinicalHistoryFormData, SystemsReview, PhysicalExamination } from '@/types/medicalRecord';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import CIE10Search from '@/components/CIE10Search';
import { CIE10Result } from '@/services/cie10.service';
import { 
  FileText, 
  Calendar, 
  Plus, 
  Eye, 
  Edit, 
  Search,
  Filter,
  Stethoscope,
  ClipboardList,
  Save,
  X,
  User as UserIcon,
  Trash2,
  Clock,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Heart,
  Activity,
  Thermometer,
  Ruler,
  Scale,
  Brain,
  Eye as EyeIcon,
  Ear,
  UserCheck,
  Hand,
  Users
} from 'lucide-react';

type SortField = 'consultation_date' | 'clinical_history_number' | 'patient';
type SortOrder = 'asc' | 'desc';

export default function ClinicalHistoryPage() {
  const [records, setRecords] = useState<ClinicalHistory[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('consultation_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalHistory | null>(null);
  const [formData, setFormData] = useState<ClinicalHistoryFormData>({
    patient_id: 0,
    specialist_id: 0,
    clinical_history_number: '',
    consultation_reason_a: '',
    consultation_reason_b: '',
    consultation_reason_c: '',
    consultation_reason_d: '',
    family_history: '',
    clinical_history: '',
    surgical_history: '',
    gynecological_history: '',
    habits: '',
    current_illness: '',
    systems_review: {
      sense_organs: 'SP',
      respiratory: 'SP',
      cardiovascular: 'SP',
      digestive: 'SP',
      genital: 'SP',
      urinary: 'SP',
      musculoskeletal: 'SP',
      endocrine: 'SP',
      hemolymphatic: 'SP',
      nervous: 'SP'
    },
    blood_pressure: '',
    oxygen_saturation: '',
    heart_rate: '',
    respiratory_rate: '',
    temperature: '',
    weight: '',
    height: '',
    head_circumference: '',
    physical_examination: {
      skin_appendages: 'SP',
      head: 'SP',
      eyes: 'SP',
      ears: 'SP',
      nose: 'SP',
      mouth: 'SP',
      oropharynx: 'SP',
      neck: 'SP',
      axillae_breasts: 'SP',
      thorax: 'SP',
      abdomen: 'SP',
      vertebral_column: 'SP',
      groin_perineum: 'SP',
      upper_limbs: 'SP',
      lower_limbs: 'SP'
    },
    diagnoses: [],
    treatment_plans: '',
    evolution_entries: [],
    consultation_date: new Date().toISOString().split('T')[0],
    consultation_time: new Date().toTimeString().split(' ')[0],
    status: 'borrador'
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const ITEMS_PER_PAGE = 5;

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recordsData, patientsData] = await Promise.all([
          medicalRecordService.getMyMedicalRecords(user?.role),
          userService.getUsersByTenant(user?.tenant_id || 0)
        ]);
        
        setRecords(recordsData);
        const patientsOnly = patientsData.filter(u => u.role === 'Paciente');
        setPatients(patientsOnly);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        setError('Error al obtener los datos');
        toast.error('Error al cargar los datos');
        setLoading(false);
      }
    };
    
    if (user?.role && user?.tenant_id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Filtrado y ordenamiento optimizado con useMemo
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(record => {
      const matchesSearch = 
        record.current_illness?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.treatment_plans?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.clinical_history_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPatient = !selectedPatientFilter || 
        record.patient_id?.toString() === selectedPatientFilter;
      
      return matchesSearch && matchesPatient;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'consultation_date':
          aValue = new Date(a.consultation_date || '').getTime();
          bValue = new Date(b.consultation_date || '').getTime();
          break;
        case 'clinical_history_number':
          aValue = a.clinical_history_number || '';
          bValue = b.clinical_history_number || '';
          break;
        case 'patient':
          aValue = a.patient?.username || '';
          bValue = b.patient?.username || '';
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [records, searchTerm, selectedPatientFilter, sortField, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecords = filteredAndSortedRecords.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPatientFilter, statusFilter, sortField, sortOrder]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openCreateModal = () => {
    setFormData({
      patient_id: 0,
      specialist_id: user?.id || 0,
      clinical_history_number: `HCL-${Date.now()}`,
      consultation_reason_a: '',
      consultation_reason_b: '',
      consultation_reason_c: '',
      consultation_reason_d: '',
      family_history: '',
      clinical_history: '',
      surgical_history: '',
      gynecological_history: '',
      habits: '',
      current_illness: '',
      systems_review: {
        sense_organs: 'SP',
        respiratory: 'SP',
        cardiovascular: 'SP',
        digestive: 'SP',
        genital: 'SP',
        urinary: 'SP',
        musculoskeletal: 'SP',
        endocrine: 'SP',
        hemolymphatic: 'SP',
        nervous: 'SP'
      },
      blood_pressure: '',
      oxygen_saturation: '',
      heart_rate: '',
      respiratory_rate: '',
      temperature: '',
      weight: '',
      height: '',
      head_circumference: '',
      physical_examination: {
        skin_appendages: 'SP',
        head: 'SP',
        eyes: 'SP',
        ears: 'SP',
        nose: 'SP',
        mouth: 'SP',
        oropharynx: 'SP',
        neck: 'SP',
        axillae_breasts: 'SP',
        thorax: 'SP',
        abdomen: 'SP',
        vertebral_column: 'SP',
        groin_perineum: 'SP',
        upper_limbs: 'SP',
        lower_limbs: 'SP'
      },
      diagnoses: [],
      treatment_plans: '',
      evolution_entries: [],
      consultation_date: new Date().toISOString().split('T')[0],
      consultation_time: new Date().toTimeString().split(' ')[0],
      status: 'borrador'
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (record: ClinicalHistory) => {
    setSelectedRecord(record);
    setFormData({
      patient_id: record.patient_id || 0,
      specialist_id: record.specialist_id || 0,
      clinical_history_number: record.clinical_history_number || '',
      consultation_reason_a: record.consultation_reason_a || '',
      consultation_reason_b: record.consultation_reason_b || '',
      consultation_reason_c: record.consultation_reason_c || '',
      consultation_reason_d: record.consultation_reason_d || '',
      family_history: record.family_history || '',
      clinical_history: record.clinical_history || '',
      surgical_history: record.surgical_history || '',
      gynecological_history: record.gynecological_history || '',
      habits: record.habits || '',
      current_illness: record.current_illness || '',
      systems_review: record.systems_review || {
        sense_organs: 'SP',
        respiratory: 'SP',
        cardiovascular: 'SP',
        digestive: 'SP',
        genital: 'SP',
        urinary: 'SP',
        musculoskeletal: 'SP',
        endocrine: 'SP',
        hemolymphatic: 'SP',
        nervous: 'SP'
      },
      blood_pressure: record.blood_pressure || '',
      oxygen_saturation: record.oxygen_saturation || '',
      heart_rate: record.heart_rate || '',
      respiratory_rate: record.respiratory_rate || '',
      temperature: record.temperature || '',
      weight: record.weight || '',
      height: record.height || '',
      head_circumference: record.head_circumference || '',
      physical_examination: record.physical_examination || {
        skin_appendages: 'SP',
        head: 'SP',
        eyes: 'SP',
        ears: 'SP',
        nose: 'SP',
        mouth: 'SP',
        oropharynx: 'SP',
        neck: 'SP',
        axillae_breasts: 'SP',
        thoracic: 'SP',
        abdomen: 'SP',
        vertebral_column: 'SP',
        groin_perineum: 'SP',
        upper_limbs: 'SP',
        lower_limbs: 'SP'
      },
      diagnoses: record.diagnoses || [],
      treatment_plans: record.treatment_plans || '',
      evolution_entries: record.evolution_entries || [],
      consultation_date: record.consultation_date ? new Date(record.consultation_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      consultation_time: record.consultation_time || new Date().toTimeString().split(' ')[0],
      status: record.status || 'borrador'
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (record: ClinicalHistory) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (record: ClinicalHistory) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditModalOpen && selectedRecord) {
        await medicalRecordService.updateMedicalRecord(selectedRecord.id, {
          ...formData,
          patient_id: formData.patient_id,
          specialist_id: formData.specialist_id
        });
        toast.success('Historia clínica actualizada correctamente');
      } else {
        await medicalRecordService.createMedicalRecord({
          ...formData,
          patient_id: formData.patient_id,
          specialist_id: formData.specialist_id
        });
        toast.success('Historia clínica creada correctamente');
      }

      // Recargar datos
      const updatedRecords = await medicalRecordService.getMyMedicalRecords(user?.role);
      setRecords(updatedRecords);

      // Cerrar modal y limpiar formulario
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({
        patient_id: 0,
        specialist_id: user?.id || 0,
        clinical_history_number: `HCL-${Date.now()}`,
        consultation_reason_a: '',
        consultation_reason_b: '',
        consultation_reason_c: '',
        consultation_reason_d: '',
        family_history: '',
        clinical_history: '',
        surgical_history: '',
        gynecological_history: '',
        habits: '',
        current_illness: '',
        systems_review: {
          sense_organs: 'SP',
          respiratory: 'SP',
          cardiovascular: 'SP',
          digestive: 'SP',
          genital: 'SP',
          urinary: 'SP',
          musculoskeletal: 'SP',
          endocrine: 'SP',
          hemolymphatic: 'SP',
          nervous: 'SP'
        },
        blood_pressure: '',
        oxygen_saturation: '',
        heart_rate: '',
        respiratory_rate: '',
        temperature: '',
        weight: '',
        height: '',
        head_circumference: '',
        physical_examination: {
          skin_appendages: 'SP',
          head: 'SP',
          eyes: 'SP',
          ears: 'SP',
          nose: 'SP',
          mouth: 'SP',
          oropharynx: 'SP',
          neck: 'SP',
          axillae_breasts: 'SP',
          thorax: 'SP',
          abdomen: 'SP',
          vertebral_column: 'SP',
          groin_perineum: 'SP',
          upper_limbs: 'SP',
          lower_limbs: 'SP'
        },
        diagnoses: [],
        treatment_plans: '',
        evolution_entries: [],
        consultation_date: new Date().toISOString().split('T')[0],
        consultation_time: new Date().toTimeString().split(' ')[0],
        status: 'borrador'
      });
    } catch (error) {
      toast.error('Error al guardar el registro médico');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    
    setSubmitting(true);
    try {
      await medicalRecordService.deleteMedicalRecord(selectedRecord.id);
      toast.success('Registro médico eliminado correctamente');
      
      // Actualizar lista local
      setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      toast.error('Error al eliminar el registro médico');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiagnosisSelect = (diagnosis: CIE10Result) => {
    setFormData(prev => ({
      ...prev,
      diagnosis: `${diagnosis.id} - ${diagnosis.title}`
    }));
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.username} (${patient.identification_number})` : `Paciente #${patientId}`;
  };

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando historias clínicas...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell className="medical-records-responsive">
      <DashboardHeader
        heading="Historia Clínica"
        text={`Historial de historias clínicas. Mostrando ${currentRecords.length} de ${filteredAndSortedRecords.length} historias (página ${currentPage} de ${totalPages})`}
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Registro</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </DashboardHeader>

      {/* Filtros Avanzados */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5 text-purple-600" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="medical-records-filters">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por diagnóstico, tratamiento o observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros adicionales */}
          <div className="space-y-4">
            {/* Filtro por paciente */}
            <div>
              <Label htmlFor="patient-filter">Filtrar por Paciente</Label>
              <select
                id="patient-filter"
                value={selectedPatientFilter}
                onChange={(e) => setSelectedPatientFilter(e.target.value)}
                className="w-full p-2 border rounded-md mt-1"
              >
                <option value="">Todos los pacientes</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id.toString()}>
                    {patient.username} - {patient.identification_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <Label>Ordenar por</Label>
              <div className="medical-records-sort-buttons">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort('consultation_date')}
                  className="flex items-center gap-1 flex-1 sm:flex-none"
                >
                  Fecha
                  {sortField === 'consultation_date' ? (
                    sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  ) : <SortAsc className="h-3 w-3" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort('clinical_history_number')}
                  className="flex items-center gap-1 flex-1 sm:flex-none"
                >
                  Diagnóstico
                  {sortField === 'clinical_history_number' ? (
                    sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  ) : <SortAsc className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <div className="grid gap-4">
        {currentRecords.length > 0 ? (
          currentRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 medical-record-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Información principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 medical-record-info">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 medical-record-header">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Registro #{record.id}
                          </h3>
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 w-fit medical-record-badge">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            Consulta
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                            <span className="truncate">{formatDate(record.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                            <span>{formatTime(record.date)}</span>
                          </div>
                          {user?.role !== 'Paciente' && (
                            <div className="flex items-center sm:col-span-2">
                              <UserIcon className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                              <span className="truncate">{getPatientName(record.patient_id)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <strong className="text-sm text-gray-700 flex items-center">
                              <ClipboardList className="h-4 w-4 mr-1 text-purple-500 flex-shrink-0" />
                              N° Historia:
                            </strong>
                            <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded border-l-2 border-purple-200 break-words medical-record-text">
                              {record.diagnosis}
                            </p>
                          </div>
                          
                          {record.treatment && (
                            <div>
                              <strong className="text-sm text-gray-700">Tratamiento:</strong>
                              <p className="text-sm text-gray-600 mt-1 bg-blue-50 p-2 rounded border-l-2 border-blue-200 break-words medical-record-text">
                                {record.treatment}
                              </p>
                            </div>
                          )}
                          
                          {record.observations && (
                            <div>
                              <strong className="text-sm text-gray-700">Observaciones:</strong>
                              <p className="text-sm text-gray-600 mt-1 bg-yellow-50 p-2 rounded border-l-2 border-yellow-200 break-words line-clamp-2 medical-record-text">
                                {record.observations}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:gap-2 lg:ml-6 medical-record-actions">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 lg:flex-none lg:w-full"
                      onClick={() => openViewModal(record)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Ver Detalles</span>
                      <span className="sm:hidden">Ver</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 lg:flex-none lg:w-full"
                      onClick={() => openEditModal(record)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Editar</span>
                      <span className="sm:hidden">Editar</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 lg:flex-none lg:w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDeleteModal(record)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                      <span className="sm:hidden">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedPatientFilter ? 'No se encontraron historias' : 'No hay historias clínicas'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedPatientFilter 
                  ? 'Intenta con otros filtros o términos de búsqueda'
                  : 'Los registros médicos aparecerán aquí cuando sean creados'
                }
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Registro
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 medical-records-pagination">
              <div className="text-sm text-gray-600 text-center sm:text-left medical-records-pagination-info">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAndSortedRecords.length)} de {filteredAndSortedRecords.length} registros
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 medical-records-pagination-controls">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="hidden sm:flex pagination-first"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8 text-xs sm:text-sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="hidden sm:flex pagination-last"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Crear Historia Clínica */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Nueva Historia Clínica
            </DialogTitle>
            <DialogDescription>
              Crear una nueva historia clínica completa para un paciente
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sección 1: Datos del Paciente */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                Datos del Paciente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_id">Paciente *</Label>
                  <select
                    id="patient_id"
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md mt-1"
                    required
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.username} - {patient.identification_number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="clinical_history_number">N° Historia Clínica *</Label>
                  <Input
                    id="clinical_history_number"
                    name="clinical_history_number"
                    value={formData.clinical_history_number}
                    onChange={handleChange}
                    placeholder="Número de historia clínica"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Motivo de Consulta */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Motivo de Consulta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consultation_reason_a">A. Motivo Principal *</Label>
                  <Textarea
                    id="consultation_reason_a"
                    name="consultation_reason_a"
                    value={formData.consultation_reason_a}
                    onChange={handleChange}
                    placeholder="Motivo principal de la consulta"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="consultation_reason_b">B. Motivo Secundario</Label>
                  <Textarea
                    id="consultation_reason_b"
                    name="consultation_reason_b"
                    value={formData.consultation_reason_b}
                    onChange={handleChange}
                    placeholder="Motivo secundario (opcional)"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="consultation_reason_c">C. Motivo Adicional</Label>
                  <Textarea
                    id="consultation_reason_c"
                    name="consultation_reason_c"
                    value={formData.consultation_reason_c}
                    onChange={handleChange}
                    placeholder="Motivo adicional (opcional)"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="consultation_reason_d">D. Motivo Adicional</Label>
                  <Textarea
                    id="consultation_reason_d"
                    name="consultation_reason_d"
                    value={formData.consultation_reason_d}
                    onChange={handleChange}
                    placeholder="Otro motivo (opcional)"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Antecedentes */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Antecedentes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="family_history">Antecedentes Familiares</Label>
                  <Textarea
                    id="family_history"
                    name="family_history"
                    value={formData.family_history}
                    onChange={handleChange}
                    placeholder="Historia familiar relevante"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="clinical_history">Antecedentes Clínicos</Label>
                  <Textarea
                    id="clinical_history"
                    name="clinical_history"
                    value={formData.clinical_history}
                    onChange={handleChange}
                    placeholder="Historia clínica previa"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="surgical_history">Antecedentes Quirúrgicos</Label>
                  <Textarea
                    id="surgical_history"
                    name="surgical_history"
                    value={formData.surgical_history}
                    onChange={handleChange}
                    placeholder="Cirugías previas"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="gynecological_history">Antecedentes Gineco-Obstétricos</Label>
                  <Textarea
                    id="gynecological_history"
                    name="gynecological_history"
                    value={formData.gynecological_history}
                    onChange={handleChange}
                    placeholder="Historia gineco-obstétrica (si aplica)"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="habits">Hábitos</Label>
                  <Textarea
                    id="habits"
                    name="habits"
                    value={formData.habits}
                    onChange={handleChange}
                    placeholder="Hábitos del paciente (alimentación, ejercicio, tabaco, alcohol, etc.)"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Enfermedad Actual */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                <Stethoscope className="mr-2 h-5 w-5" />
                Enfermedad o Problema Actual
              </h3>
              <div>
                <Label htmlFor="current_illness">Descripción de la Enfermedad Actual *</Label>
                <Textarea
                  id="current_illness"
                  name="current_illness"
                  value={formData.current_illness}
                  onChange={handleChange}
                  placeholder="Describa detalladamente la enfermedad o problema actual del paciente"
                  rows={4}
                  required
                />
                <div className="mt-2">
                  <Label>Buscar Código CIE-10</Label>
                  <CIE10Search
                    onSelect={handleDiagnosisSelect}
                    placeholder="Buscar enfermedad en CIE-10 (mínimo 3 caracteres)..."
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Sección 5: Signos Vitales */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Signos Vitales y Mediciones
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="blood_pressure">Presión Arterial</Label>
                  <Input
                    id="blood_pressure"
                    name="blood_pressure"
                    value={formData.blood_pressure}
                    onChange={handleChange}
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <Label htmlFor="oxygen_saturation">Sat. O2</Label>
                  <Input
                    id="oxygen_saturation"
                    name="oxygen_saturation"
                    value={formData.oxygen_saturation}
                    onChange={handleChange}
                    placeholder="98%"
                  />
                </div>
                <div>
                  <Label htmlFor="heart_rate">Frec. Cardíaca</Label>
                  <Input
                    id="heart_rate"
                    name="heart_rate"
                    value={formData.heart_rate}
                    onChange={handleChange}
                    placeholder="72 bpm"
                  />
                </div>
                <div>
                  <Label htmlFor="respiratory_rate">Frec. Respiratoria</Label>
                  <Input
                    id="respiratory_rate"
                    name="respiratory_rate"
                    value={formData.respiratory_rate}
                    onChange={handleChange}
                    placeholder="16 rpm"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    placeholder="36.5°C"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso</Label>
                  <Input
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="70 kg"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Talla</Label>
                  <Input
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="170 cm"
                  />
                </div>
                <div>
                  <Label htmlFor="head_circumference">Perímetro Cefálico</Label>
                  <Input
                    id="head_circumference"
                    name="head_circumference"
                    value={formData.head_circumference}
                    onChange={handleChange}
                    placeholder="55 cm"
                  />
                </div>
              </div>
            </div>

            {/* Sección 6: Planes de Tratamiento */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Planes de Tratamiento
              </h3>
              <div>
                <Label htmlFor="treatment_plans">Planes de Tratamiento, Terapéuticos y Educacionales *</Label>
                <Textarea
                  id="treatment_plans"
                  name="treatment_plans"
                  value={formData.treatment_plans}
                  onChange={handleChange}
                  placeholder="Describa detalladamente los planes de tratamiento, terapéuticos y educacionales"
                  rows={4}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'Guardando...' : 'Guardar Historia Clínica'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Registro */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5" />
              Editar Registro Médico
            </DialogTitle>
            <DialogDescription>
              Modificar el registro médico seleccionado
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_patient_id">Paciente *</Label>
              <select
                id="edit_patient_id"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md mt-1"
                required
              >
                <option value="">Seleccionar paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.username} - {patient.identification_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="edit_current_illness">Enfermedad Actual (CIE-10) *</Label>
              <CIE10Search
                onSelect={handleDiagnosisSelect}
                placeholder="Buscar enfermedad en CIE-10 (mínimo 3 caracteres)..."
                className="w-full"
              />
              <input type="hidden" required value={formData.current_illness} onChange={() => {}} />
            </div>

            <div>
              <Label htmlFor="edit_treatment_plans">Planes de Tratamiento *</Label>
              <Textarea
                id="edit_treatment_plans"
                name="treatment_plans"
                value={formData.treatment_plans}
                onChange={handleChange}
                placeholder="Describa los planes de tratamiento, terapéuticos y educacionales"
                required
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit_current_illness">Enfermedad Actual</Label>
              <Textarea
                id="edit_current_illness"
                name="current_illness"
                value={formData.current_illness}
                onChange={handleChange}
                placeholder="Describa la enfermedad o problema actual del paciente"
                rows={3}
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'Guardando...' : 'Actualizar Registro'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Ver Detalles */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Detalles del Registro Médico
            </DialogTitle>
            <DialogDescription>
              Información completa del registro médico
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">ID del Registro</Label>
                  <p className="text-sm text-gray-900">#{selectedRecord.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Fecha</Label>
                  <p className="text-sm text-gray-900">{formatDate(selectedRecord.date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Hora</Label>
                  <p className="text-sm text-gray-900">{formatTime(selectedRecord.date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Paciente</Label>
                  <p className="text-sm text-gray-900">{getPatientName(selectedRecord.patient_id)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Diagnóstico</Label>
                <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded border-l-2 border-purple-200">
                  {selectedRecord.diagnosis}
                </p>
              </div>

              {selectedRecord.treatment && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tratamiento</Label>
                  <p className="text-sm text-gray-900 mt-1 bg-blue-50 p-3 rounded border-l-2 border-blue-200">
                    {selectedRecord.treatment}
                  </p>
                </div>
              )}

              {selectedRecord.observations && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Observaciones</Label>
                  <p className="text-sm text-gray-900 mt-1 bg-yellow-50 p-3 rounded border-l-2 border-yellow-200">
                    {selectedRecord.observations}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar Registro
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este registro médico? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Registro #{selectedRecord.id}</strong> - {selectedRecord.diagnosis}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={submitting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {submitting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}