'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { appointmentService } from '@/services/appointment.service';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { medicalExamService } from '@/services/medicalExam.service';
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
  SortDesc
} from 'lucide-react';
import Link from 'next/link';

interface PatientData {
  patient: any; // Cambiado de User a any para evitar conflictos de tipos
  appointments: Appointment[];
  records: MedicalRecord[];
  exams: MedicalExam[];
  lastVisit?: Date;
  nextAppointment?: Date;
}

export default function SpecialistPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'appointments'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'upcoming'>('all');

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
          
          // Actualizar última visita
          const appointmentDate = new Date(appointment.date);
          if (!patientData.lastVisit || appointmentDate > patientData.lastVisit) {
            patientData.lastVisit = appointmentDate;
          }
          
          // Actualizar próxima cita
          if (appointmentDate > new Date() && 
              (!patientData.nextAppointment || appointmentDate < patientData.nextAppointment)) {
            patientData.nextAppointment = appointmentDate;
          }
        }
      });
      
      // Procesar registros médicos
      records.forEach(record => {
        const patientId = record.patient_id;
        if (patientMap.has(patientId)) {
          patientMap.get(patientId)!.records.push(record);
        }
      });
      
      // Procesar exámenes
      exams.forEach(exam => {
        const patientId = exam.patient_id;
        if (patientMap.has(patientId)) {
          patientMap.get(patientId)!.exams.push(exam);
        }
      });
      
      const patientsArray = Array.from(patientMap.values());
      setPatients(patientsArray);
      setLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Error al cargar los pacientes');
      setLoading(false);
    }
  };

  const filterAndSortPatients = () => {
    let filtered = [...patients];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(patientData =>
        patientData.patient.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientData.patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtros adicionales
    switch (selectedFilter) {
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(patientData =>
          patientData.lastVisit && patientData.lastVisit > thirtyDaysAgo
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(patientData =>
          patientData.nextAppointment && patientData.nextAppointment > new Date()
        );
        break;
    }
    
    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.patient.username.localeCompare(b.patient.username);
          break;
        case 'lastVisit':
          const aLastVisit = a.lastVisit || new Date(0);
          const bLastVisit = b.lastVisit || new Date(0);
          comparison = aLastVisit.getTime() - bLastVisit.getTime();
          break;
        case 'appointments':
          comparison = a.appointments.length - b.appointments.length;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredPatients(filtered);
  };

  const getPatientStatus = (patientData: PatientData) => {
    if (patientData.nextAppointment && patientData.nextAppointment > new Date()) {
      return { status: 'upcoming', label: 'Próxima cita', color: 'bg-blue-100 text-blue-800' };
    }
    
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
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/appointments/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Button>
          </Link>
          <Link href="/medical-records/new">
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Nuevo Registro
            </Button>
          </Link>
        </div>
      </DashboardHeader>

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
      <div className="grid gap-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patientData) => {
            const status = getPatientStatus(patientData);
            
            return (
              <Card key={patientData.patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Información del paciente */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {patientData.patient.username}
                            </h3>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              <span className="truncate">{patientData.patient.email}</span>
                            </div>
                            {(patientData.patient as any).phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>{(patientData.patient as any).phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas del paciente */}
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {patientData.appointments.length}
                          </p>
                          <p className="text-xs text-gray-500">Citas</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {patientData.records.length}
                          </p>
                          <p className="text-xs text-gray-500">Registros</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {patientData.exams.length}
                          </p>
                          <p className="text-xs text-gray-500">Exámenes</p>
                        </div>
                      </div>
                    </div>

                    {/* Fechas importantes */}
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <div className="space-y-2 text-sm">
                        {patientData.lastVisit && (
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Última visita: {formatDate(patientData.lastVisit)}</span>
                          </div>
                        )}
                        {patientData.nextAppointment && patientData.nextAppointment > new Date() && (
                          <div className="flex items-center text-green-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Próxima cita: {formatDate(patientData.nextAppointment)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <div className="flex flex-col space-y-2">
                        <Link href={`/appointments?patient=${patientData.patient.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Calendar className="mr-2 h-4 w-4" />
                            Ver Citas
                          </Button>
                        </Link>
                        <Link href={`/medical-records?patient=${patientData.patient.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Registros
                          </Button>
                        </Link>
                        <Link href={`/medical-exams?patient=${patientData.patient.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Microscope className="mr-2 h-4 w-4" />
                            Ver Exámenes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
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
    </DashboardShell>
  );
} 