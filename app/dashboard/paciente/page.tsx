'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { appointmentService } from '@/services/appointment.service';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { medicalExamService } from '@/services/medicalExam.service';
import { Appointment } from '@/types/appointment';
import { MedicalRecord } from '@/types/medicalRecord';
import { MedicalExam } from '@/types/medicalExam';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  ClipboardList, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Stethoscope,
  Microscope,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function PacienteDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medicalExams, setMedicalExams] = useState<MedicalExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) {
          setError('No hay usuario autenticado');
          setLoading(false);
          return;
        }

        const [appointmentsData, recordsData, examsData] = await Promise.all([
          appointmentService.getPatientAppointments(),
          medicalRecordService.getMyMedicalRecords('Paciente'),
          medicalExamService.getMyMedicalExams()
        ]);

        setAppointments(appointmentsData);
        setMedicalRecords(recordsData);
        setMedicalExams(examsData.exams || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Error al cargar los datos del dashboard');
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const upcomingAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    return appDate > new Date() && app.status !== 'cancelada';
  }).slice(0, 5);

  const todayAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    return appDate.toDateString() === new Date().toDateString();
  });

  const recentMedicalRecords = medicalRecords.slice(0, 3);
  const recentMedicalExams = medicalExams.slice(0, 4);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelada':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pendiente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completada':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, string> = {
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'pendiente': 'Pendiente',
      'completada': 'Completada'
    };

    const statusColors: Record<string, string> = {
      'confirmada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800',
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'completada': 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
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
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
    <DashboardShell>
      <DashboardHeader
        heading="Panel del Paciente"
        text="Bienvenido a tu panel de control médico personal"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/dashboard/paciente/appointments">
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Mis Citas
            </Button>
          </Link>
          <Link href="/dashboard/paciente/medical-records">
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Historial Médico
            </Button>
          </Link>
          <Link href="/dashboard/paciente/medical-exams">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Mis Exámenes
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Próximas Citas</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Registros Médicos</p>
                <p className="text-2xl font-bold text-gray-900">{medicalRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Microscope className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Exámenes</p>
                <p className="text-2xl font-bold text-gray-900">{medicalExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Próximas Citas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
              Próximas Citas
            </CardTitle>
            <CardDescription>
              Tus próximas citas médicas programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
          {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                  <div>
                          <p className="font-medium text-gray-900">
                            Dr. {appointment.specialist?.username || `Especialista ${appointment.specialist_id}`}
                    </p>
                    <p className="text-sm text-gray-600">
                            {formatDate(appointment.date)} - {new Date(appointment.date).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                    </p>
                  </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                    {getStatusIcon(appointment.status)}
                      {getStatusBadge(appointment.status)}
                    </div>
                </div>
              ))}
            </div>
          ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tienes citas próximas</p>
                <Link href="/dashboard/paciente/appointments">
                  <Button variant="outline" className="mt-2">
                    Ver todas las citas
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos Registros Médicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Stethoscope className="mr-2 h-5 w-5 text-purple-600" />
              Últimos Registros Médicos
            </CardTitle>
            <CardDescription>
              Tus registros médicos más recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentMedicalRecords.length > 0 ? (
              <div className="space-y-4">
                {recentMedicalRecords.map((record) => (
                  <div key={record.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {record.diagnosis || 'Diagnóstico no especificado'}
                      </h4>
                      <Badge className="bg-green-100 text-green-800">Completado</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Dr. {record.specialist?.username || 'Especialista'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(record.consultation_date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay registros médicos</p>
                <Link href="/dashboard/paciente/medical-records">
                  <Button variant="outline" className="mt-2">
                    Ver historial completo
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Últimos Exámenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Microscope className="mr-2 h-5 w-5 text-orange-600" />
            Últimos Exámenes Médicos
          </CardTitle>
          <CardDescription>
            Tus exámenes médicos más recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentMedicalExams.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentMedicalExams.map((exam) => (
                <div key={exam.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {exam.title || 'Examen sin título'}
                      </h4>
                      <p className="text-sm text-gray-600">{exam.type}</p>
                    </div>
                    <Badge className={exam.status === 'completado' ? 'bg-green-100 text-green-800' : 
                                     exam.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-blue-100 text-blue-800'}>
                      {exam.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Dr. {exam.specialist?.username || 'Especialista'}</span>
                    <span>{formatDate(exam.date)}</span>
                  </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="text-center py-8">
              <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay exámenes registrados</p>
              <Link href="/dashboard/paciente/medical-exams">
                <Button variant="outline" className="mt-2">
                  Ver todos los exámenes
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accesos rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Activity className="mr-2 h-5 w-5 text-green-600" />
            Accesos Rápidos
          </CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/paciente/appointments">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <CalendarIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Mis Citas</h3>
                  <p className="text-sm text-gray-600">Gestiona tus citas médicas</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dashboard/paciente/medical-records">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Stethoscope className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Historial Médico</h3>
                  <p className="text-sm text-gray-600">Consulta tus registros médicos</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dashboard/paciente/medical-exams">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Microscope className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">Mis Exámenes</h3>
                  <p className="text-sm text-gray-600">Revisa tus exámenes médicos</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
} 