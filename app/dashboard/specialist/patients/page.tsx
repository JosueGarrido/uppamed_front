'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { appointmentService } from '@/services/appointment.service';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { medicalExamService } from '@/services/medicalExam.service';
import { specialistService } from '@/services/specialist.service';
import { Appointment } from '@/types/appointment';
import { MedicalRecord } from '@/types/medicalRecord';
import { MedicalExam } from '@/types/medicalExam';
import { User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  Calendar, 
  FileText, 
  Microscope, 
  Eye, 
  Plus,
  Mail,
  Phone,
  User as UserIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  SortAsc,
  SortDesc,
  Heart,
  Activity,
  Stethoscope,
  X,
  ChevronRight,
  CalendarDays,
  FileText as FileTextIcon,
  TestTube
} from 'lucide-react';
import Link from 'next/link';

interface PatientData {
  patient: any;
  appointments: Appointment[];
  records: MedicalRecord[];
  exams: MedicalExam[];
  lastVisit?: Date;
  nextAppointment?: Date;
}

interface PatientCardProps {
  patientData: PatientData;
  onViewProfile: (patientData: PatientData) => void;
  onViewAppointments: (patientData: PatientData) => void;
  onViewRecords: (patientData: PatientData) => void;
  onViewExams: (patientData: PatientData) => void;
}

const PatientCard = ({ patientData, onViewProfile, onViewAppointments, onViewRecords, onViewExams }: PatientCardProps) => {
  const getPatientStatus = (patientData: PatientData) => {
    if (patientData.lastVisit) {
      const daysSinceLastVisit = Math.floor((new Date().getTime() - patientData.lastVisit.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastVisit <= 30) {
        return { status: 'recent', label: 'Reciente', color: 'bg-green-100 text-green-800' };
      } else if (daysSinceLastVisit <= 90) {
        return { status: 'moderate', label: 'Moderado', color: 'bg-yellow-100 text-yellow-800' };
      } else {
        return { status: 'inactive', label: 'Inactivo', color: 'bg-gray-100 text-gray-800' };
      }
    }
    
    return { status: 'new', label: 'Nuevo', color: 'bg-purple-100 text-purple-800' };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const status = getPatientStatus(patientData);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          {/* Información básica del paciente */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-4 w-4 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {patientData.patient.username}
                </h3>
                <Badge className={`text-xs ${status.color} mt-1 sm:mt-0`}>
                  {status.label}
                </Badge>
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{patientData.patient.email}</span>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="flex items-center justify-center lg:justify-end space-x-4 text-xs lg:mr-4">
            <div className="text-center">
              <p className="font-semibold text-blue-600">{patientData.appointments.length}</p>
              <p className="text-gray-500">Citas</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-purple-600">{patientData.records.length}</p>
              <p className="text-gray-500">Registros</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-orange-600">{patientData.exams.length}</p>
              <p className="text-gray-500">Exámenes</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-center lg:justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(patientData)}
              className="h-7 px-2 text-xs shadow-sm hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 flex-shrink-0"
            >
              <Eye className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Ficha</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewAppointments(patientData)}
              className="h-7 px-2 text-xs shadow-sm hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 flex-shrink-0"
            >
              <Calendar className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Citas</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewRecords(patientData)}
              className="h-7 px-2 text-xs shadow-sm hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 flex-shrink-0"
            >
              <FileText className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Registros</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewExams(patientData)}
              className="h-7 px-2 text-xs shadow-sm hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 flex-shrink-0"
            >
              <Microscope className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Exámenes</span>
            </Button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {patientData.lastVisit 
                  ? `Última visita: ${formatDate(patientData.lastVisit)}`
                  : 'Sin visitas previas'
                }
              </span>
            </div>
            {patientData.nextAppointment && patientData.nextAppointment > new Date() && (
              <div className="flex items-center text-green-600">
                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Próxima: {formatDate(patientData.nextAppointment)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SpecialistPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'appointments'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'upcoming'>('all');

  // Estados para modales
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showExamsModal, setShowExamsModal] = useState(false);

  // Estados para modales de creación
  const [showCreateAppointmentModal, setShowCreateAppointmentModal] = useState(false);
  const [showCreateRecordModal, setShowCreateRecordModal] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);

  // Estados para formularios
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '09:00',
    reason: '',
    notes: ''
  });
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    diagnosis: '',
    treatment: '',
    observations: ''
  });
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    type: '',
    status: 'pendiente'
  });
  const [creating, setCreating] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadPatients();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortPatients();
  }, [patients, searchTerm, sortBy, sortOrder, selectedFilter]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las citas del especialista
      const appointments = await appointmentService.getSpecialistAppointments();
      
      // Obtener registros médicos
      const records = await medicalRecordService.getMyMedicalRecords('Especialista');
      
      // Obtener exámenes
      const exams = await medicalExamService.getMyMedicalExams();
      
      // Agrupar datos por paciente
      const patientMap = new Map<number, PatientData>();
      
      // Procesar citas
      appointments.forEach(appointment => {
        if (appointment.appointmentPatient) {
          const patientId = appointment.appointmentPatient.id;
          
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              patient: appointment.appointmentPatient,
              appointments: [],
              records: [],
              exams: []
            });
          }
          
          const patientData = patientMap.get(patientId)!;
          patientData.appointments.push(appointment);
          
          // Actualizar última visita y próxima cita
          const appointmentDate = new Date(appointment.date);
          if (!patientData.lastVisit || appointmentDate > patientData.lastVisit) {
            patientData.lastVisit = appointmentDate;
          }
          
          if (appointmentDate > new Date() && (!patientData.nextAppointment || appointmentDate < patientData.nextAppointment)) {
            patientData.nextAppointment = appointmentDate;
          }
        }
      });
      
      // Procesar registros médicos
      records.forEach(record => {
        if (record.patient_id) {
        const patientId = record.patient_id;
        if (patientMap.has(patientId)) {
          patientMap.get(patientId)!.records.push(record);
          }
        }
      });
      
      // Procesar exámenes
      exams.forEach(exam => {
        if (exam.patient_id) {
        const patientId = exam.patient_id;
        if (patientMap.has(patientId)) {
          patientMap.get(patientId)!.exams.push(exam);
          }
        }
      });
      
      setPatients(Array.from(patientMap.values()));
      setLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Error al cargar los pacientes');
      setLoading(false);
    }
  };

  const filterAndSortPatients = () => {
    let filtered = [...patients];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(patientData =>
        patientData.patient.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientData.patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por estado
    if (selectedFilter === 'recent') {
      filtered = filtered.filter(patientData => {
        if (!patientData.lastVisit) return false;
        const daysSinceLastVisit = Math.floor((new Date().getTime() - patientData.lastVisit.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceLastVisit <= 30;
      });
    } else if (selectedFilter === 'upcoming') {
        filtered = filtered.filter(patientData =>
          patientData.nextAppointment && patientData.nextAppointment > new Date()
        );
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.patient.username.localeCompare(b.patient.username);
          break;
        case 'lastVisit':
          const aLastVisit = a.lastVisit ? a.lastVisit.getTime() : 0;
          const bLastVisit = b.lastVisit ? b.lastVisit.getTime() : 0;
          comparison = aLastVisit - bLastVisit;
          break;
        case 'appointments':
          comparison = a.appointments.length - b.appointments.length;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredPatients(filtered);
  };

  // Funciones para manejar modales
  const handleViewProfile = (patientData: PatientData) => {
    setSelectedPatient(patientData);
    setShowProfileModal(true);
  };

  const handleViewAppointments = (patientData: PatientData) => {
    setSelectedPatient(patientData);
    setShowAppointmentsModal(true);
  };

  const handleViewRecords = (patientData: PatientData) => {
    setSelectedPatient(patientData);
    setShowRecordsModal(true);
  };

  const handleViewExams = (patientData: PatientData) => {
    setSelectedPatient(patientData);
    setShowExamsModal(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funciones para crear nuevos elementos
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !user?.id) return;

    // Validar disponibilidad antes de crear la cita
    if (newAppointment.date && newAppointment.time) {
      try {
        const availability = await specialistService.checkMyAvailability(
          newAppointment.date,
          newAppointment.time
        );
        
        if (!availability.available) {
          toast.error(`No disponible: ${availability.reason}`);
          return;
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        toast.error('Error al verificar disponibilidad');
        return;
      }
    }

    setCreating(true);
    try {
      const appointmentData = {
        patient_id: selectedPatient.patient.id,
        specialist_id: user.id,
        date: `${newAppointment.date}T${newAppointment.time}:00`,
        reason: newAppointment.reason,
        status: 'pendiente' as any,
        notes: newAppointment.notes || undefined,
      };

      await appointmentService.createAppointment(appointmentData);
      toast.success('Cita creada exitosamente');
      setShowCreateAppointmentModal(false);
      setNewAppointment({ date: '', time: '09:00', reason: '', notes: '' });
      await loadPatients(); // Recargar datos
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear la cita');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !user?.id) return;

    setCreating(true);
    try {
      const recordData = {
        patient_id: selectedPatient.patient.id,
        specialist_id: user.id,
        title: newRecord.title,
        description: newRecord.description,
        diagnosis: newRecord.diagnosis,
        treatment: newRecord.treatment,
        observations: newRecord.observations,
      };

      await medicalRecordService.createMedicalRecord(recordData);
      toast.success('Registro médico creado exitosamente');
      setShowCreateRecordModal(false);
      setNewRecord({ title: '', description: '', diagnosis: '', treatment: '', observations: '' });
      await loadPatients(); // Recargar datos
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Error al crear el registro médico');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !user?.id) return;

    setCreating(true);
    try {
      const examData = {
        patient_id: selectedPatient.patient.id,
        specialist_id: user.id,
        title: newExam.title,
        description: newExam.description,
        type: newExam.type,
        status: newExam.status,
      };

      await medicalExamService.createMedicalExam(examData);
      toast.success('Examen médico creado exitosamente');
      setShowCreateExamModal(false);
      setNewExam({ title: '', description: '', type: '', status: 'pendiente' });
      await loadPatients(); // Recargar datos
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Error al crear el examen médico');
    } finally {
      setCreating(false);
    }
  };



  // Verificar disponibilidad cuando cambia la fecha
  const checkAvailability = async (date: string) => {
    if (!date) return;
    
    setLoadingSlots(true);
    setAvailabilityError(null);
    
    try {
      const response = await specialistService.getMyAvailableSlots(date);
      
      if (response.availableSlots && response.availableSlots.length > 0) {
        setAvailableSlots(response.availableSlots);
        setAvailabilityError(null);
      } else {
        setAvailableSlots([]);
        setAvailabilityError('No hay horarios disponibles para esta fecha');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityError('Error al verificar disponibilidad');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Mis Pacientes"
        text={`Gestiona y revisa la información de tus ${patients.length} pacientes`}
      />

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5 text-blue-600" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de estado */}
            <div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los pacientes</option>
                <option value="recent">Visitados recientemente</option>
                <option value="upcoming">Con citas próximas</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Ordenar por nombre</option>
                <option value="lastVisit">Ordenar por última visita</option>
                <option value="appointments">Ordenar por número de citas</option>
              </select>
            </div>

            {/* Dirección del ordenamiento */}
            <div>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <SortAsc className="mr-2 h-4 w-4" />
                    Ascendente
                  </>
                ) : (
                  <>
                    <SortDesc className="mr-2 h-4 w-4" />
                    Descendente
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Citas Próximas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.nextAppointment && p.nextAppointment > new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Registros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.reduce((total, p) => total + p.records.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Microscope className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Exámenes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.reduce((total, p) => total + p.exams.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de pacientes */}
      <div className="grid gap-3">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patientData) => (
            <PatientCard
              key={patientData.patient.id}
              patientData={patientData}
              onViewProfile={handleViewProfile}
              onViewAppointments={handleViewAppointments}
              onViewRecords={handleViewRecords}
              onViewExams={handleViewExams}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes asignados'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Los pacientes aparecerán aquí cuando tengas citas programadas'
                }
              </p>
              <Link href="/appointments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Programar Primera Cita
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Ficha del Paciente */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              Ficha del Paciente
            </DialogTitle>
            <DialogDescription>
              Información completa del paciente
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Información básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre</label>
                      <p className="text-lg font-semibold">{selectedPatient.patient.username}</p>
                          </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg">{selectedPatient.patient.email}</p>
                        </div>
                    {(selectedPatient.patient as any).phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Teléfono</label>
                        <p className="text-lg">{(selectedPatient.patient as any).phone}</p>
                      </div>
                    )}
                    {(selectedPatient.patient as any).identification_number && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Identificación</label>
                        <p className="text-lg">{(selectedPatient.patient as any).identification_number}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumen de actividad */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{selectedPatient.appointments.length}</p>
                      <p className="text-sm text-gray-600">Citas Totales</p>
                          </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">{selectedPatient.records.length}</p>
                      <p className="text-sm text-gray-600">Registros</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <Microscope className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">{selectedPatient.exams.length}</p>
                      <p className="text-sm text-gray-600">Exámenes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Últimas citas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Últimas Citas</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.appointments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPatient.appointments
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium">{formatDateTime(new Date(appointment.date))}</p>
                                <p className="text-sm text-gray-600">{appointment.reason || 'Sin motivo especificado'}</p>
                            </div>
                              </div>
                            <Badge className={`${
                              appointment.status === 'completada' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay citas registradas</p>
                  )}
                </CardContent>
              </Card>

              {/* Últimos registros médicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Últimos Registros Médicos</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.records.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPatient.records
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3)
                        .map((record) => (
                          <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-purple-600" />
                                <p className="font-medium">{record.title}</p>
                          </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(new Date(record.createdAt))}
                              </span>
                        </div>
                                                         <p className="text-sm text-gray-600 line-clamp-2">
                               {record.observations || record.description || 'Sin observaciones'}
                             </p>
                      </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay registros médicos</p>
                  )}
                </CardContent>
              </Card>

              {/* Últimos exámenes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Últimos Exámenes</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.exams.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPatient.exams
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3)
                        .map((exam) => (
                          <div key={exam.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Microscope className="h-4 w-4 text-orange-600" />
                                <p className="font-medium">{exam.title}</p>
                        </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(new Date(exam.createdAt))}
                              </span>
                            </div>
                                                         <p className="text-sm text-gray-600 line-clamp-2">
                               {exam.results || exam.description || 'Sin resultados'}
                             </p>
                        </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay exámenes registrados</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Citas del Paciente */}
      <Dialog open={showAppointmentsModal} onOpenChange={setShowAppointmentsModal}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Citas de {selectedPatient?.patient.username}
              </div>
              <Button 
                onClick={() => setShowCreateAppointmentModal(true)}
                size="sm"
                className="ml-2"
              >
                <Plus className="mr-1 h-3 w-3" />
                Nueva Cita
              </Button>
            </DialogTitle>
            <DialogDescription>
              Historial completo de citas del paciente
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              {selectedPatient.appointments.length > 0 ? (
                selectedPatient.appointments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                              <p className="font-medium">{formatDateTime(new Date(appointment.date))}</p>
                              <p className="text-sm text-gray-600">{appointment.reason || 'Sin motivo especificado'}</p>
                              {appointment.notes && (
                                <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                              )}
                        </div>
                      </div>
                          <Badge className={`${
                            appointment.status === 'completada' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </Badge>
                    </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay citas registradas para este paciente</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Registros del Paciente */}
      <Dialog open={showRecordsModal} onOpenChange={setShowRecordsModal}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Registros Médicos de {selectedPatient?.patient.username}
                          </div>
              <Button 
                onClick={() => setShowCreateRecordModal(true)}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <Plus className="mr-1 h-3 w-3" />
                Nuevo Registro
              </Button>
            </DialogTitle>
            <DialogDescription>
              Historial completo de registros médicos del paciente
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              {selectedPatient.records.length > 0 ? (
                selectedPatient.records
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((record) => (
                    <Card key={record.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-5 w-5 text-purple-600" />
                              <h3 className="font-medium">{record.title}</h3>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(new Date(record.createdAt))}
                            </span>
                          </div>
                                                     {(record.observations || record.description) && (
                             <p className="text-gray-600">{record.observations || record.description}</p>
                           )}
                          {record.diagnosis && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-blue-800 mb-1">Diagnóstico:</p>
                              <p className="text-sm text-blue-700">{record.diagnosis}</p>
                          </div>
                        )}
                          {record.treatment && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-green-800 mb-1">Tratamiento:</p>
                              <p className="text-sm text-green-700">{record.treatment}</p>
                      </div>
                          )}
                    </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay registros médicos para este paciente</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Exámenes del Paciente */}
      <Dialog open={showExamsModal} onOpenChange={setShowExamsModal}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Microscope className="mr-2 h-5 w-5" />
                Exámenes de {selectedPatient?.patient.username}
              </div>
              <Button 
                onClick={() => setShowCreateExamModal(true)}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <Plus className="mr-1 h-3 w-3" />
                Nuevo Examen
                          </Button>
            </DialogTitle>
            <DialogDescription>
              Historial completo de exámenes del paciente
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              {selectedPatient.exams.length > 0 ? (
                selectedPatient.exams
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((exam) => (
                    <Card key={exam.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Microscope className="h-5 w-5 text-orange-600" />
                              <h3 className="font-medium">{exam.title}</h3>
                      </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(new Date(exam.createdAt))}
                            </span>
                    </div>
                                                     {(exam.results || exam.description) && (
                             <p className="text-gray-600">{exam.results || exam.description}</p>
                           )}
                                                     {(exam.results || exam.description) && (
                             <div className="bg-orange-50 p-3 rounded-lg">
                               <p className="text-sm font-medium text-orange-800 mb-1">Resultados:</p>
                               <p className="text-sm text-orange-700">{exam.results || exam.description}</p>
                             </div>
                           )}
                          {exam.status && (
                            <Badge className={`${
                              exam.status === 'completado' ? 'bg-green-100 text-green-800' :
                              exam.status === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {exam.status}
                            </Badge>
                          )}
                  </div>
                </CardContent>
              </Card>
                  ))
              ) : (
                <div className="text-center py-8">
                  <Microscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay exámenes registrados para este paciente</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Nueva Cita */}
      <Dialog open={showCreateAppointmentModal} onOpenChange={setShowCreateAppointmentModal}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Nueva Cita - {selectedPatient?.patient.username}
            </DialogTitle>
            <DialogDescription>
              Crear una nueva cita para este paciente
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Paciente:</strong> {selectedPatient.patient.username}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Email:</strong> {selectedPatient.patient.email}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={newAppointment.date}
                    onChange={(e) => {
                      setNewAppointment({ ...newAppointment, date: e.target.value });
                      checkAvailability(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora *
                  </label>
                  <select
                    required
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingSlots || availableSlots.length === 0}
                  >
                    {availableSlots.length > 0 ? (
                      availableSlots.map(slot => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))
                    ) : (
                      <option value="">No hay horarios disponibles</option>
                    )}
                  </select>
                  {loadingSlots && (
                    <div className="text-xs text-blue-500 flex items-center mt-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-1"></div>
                      Verificando disponibilidad...
                    </div>
                  )}
                  {availabilityError && (
                    <div className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {availabilityError}
                    </div>
                  )}
                  {availableSlots.length > 0 && !loadingSlots && (
                    <div className="text-xs text-green-500 mt-1">
                      ✓ {availableSlots.length} horario(s) disponible(s)
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la consulta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Control rutinario, Revisión, Consulta específica..."
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  placeholder="Información adicional sobre la cita..."
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateAppointmentModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                >
                  {creating ? 'Creando...' : 'Crear Cita'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Nuevo Registro */}
      <Dialog open={showCreateRecordModal} onOpenChange={setShowCreateRecordModal}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Nuevo Registro - {selectedPatient?.patient.username}
            </DialogTitle>
            <DialogDescription>
              Crear un nuevo registro médico para este paciente
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Paciente:</strong> {selectedPatient.patient.username}
                </p>
                <p className="text-sm text-purple-700">
                  <strong>Email:</strong> {selectedPatient.patient.email}
                </p>
      </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del registro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Consulta de rutina, Revisión post-tratamiento..."
                  value={newRecord.title}
                  onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción general
                </label>
                <textarea
                  placeholder="Descripción general del registro médico..."
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico
                </label>
                <textarea
                  placeholder="Diagnóstico del paciente..."
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tratamiento
                </label>
                <textarea
                  placeholder="Tratamiento prescrito..."
                  value={newRecord.treatment}
                  onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  placeholder="Observaciones adicionales..."
                  value={newRecord.observations}
                  onChange={(e) => setNewRecord({ ...newRecord, observations: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateRecordModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                >
                  {creating ? 'Creando...' : 'Crear Registro'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Nuevo Examen */}
      <Dialog open={showCreateExamModal} onOpenChange={setShowCreateExamModal}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Microscope className="mr-2 h-5 w-5" />
              Nuevo Examen - {selectedPatient?.patient.username}
            </DialogTitle>
            <DialogDescription>
              Crear un nuevo examen médico para este paciente
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Paciente:</strong> {selectedPatient.patient.username}
                </p>
                <p className="text-sm text-orange-700">
                  <strong>Email:</strong> {selectedPatient.patient.email}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del examen *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Análisis de sangre, Radiografía, Ecografía..."
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de examen
                </label>
                <input
                  type="text"
                  placeholder="Ej: Laboratorio, Imagenología, Funcional..."
                  value={newExam.type}
                  onChange={(e) => setNewExam({ ...newExam, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  placeholder="Descripción del examen a realizar..."
                  value={newExam.description}
                  onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={newExam.status}
                  onChange={(e) => setNewExam({ ...newExam, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateExamModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                >
                  {creating ? 'Creando...' : 'Crear Examen'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
} 