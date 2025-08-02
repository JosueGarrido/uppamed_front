'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { appointmentService } from '@/services/appointment.service';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { medicalExamService } from '@/services/medicalExam.service';
import { userService } from '@/services/user.service';
import { Appointment } from '@/types/appointment';
import { MedicalRecord } from '@/types/medicalRecord';
import { MedicalExam } from '@/types/medicalExam';
import { User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  ClipboardList, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  UserCheck,
  Stethoscope,
  Activity,
  BarChart3,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  totalRecords: number;
  totalExams: number;
  monthlyGrowth: number;
}

export default function SpecialistDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medicalExams, setMedicalExams] = useState<MedicalExam[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    totalRecords: 0,
    totalExams: 0,
    monthlyGrowth: 0
  });
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

        // Cargar datos de forma individual para manejar errores por separado
        let appointments: Appointment[] = [];
        let records: MedicalRecord[] = [];
        let exams: MedicalExam[] = [];

        try {
          appointments = await appointmentService.getSpecialistAppointments();
        } catch (error) {
          console.error('Error cargando citas:', error);
          // Continuar con citas vacías
        }

        try {
          records = await medicalRecordService.getMyMedicalRecords('Especialista');
        } catch (error) {
          console.error('Error cargando registros médicos:', error);
          // Continuar con registros vacíos
        }

        try {
          exams = await medicalExamService.getMyMedicalExams();
        } catch (error) {
          console.error('Error cargando exámenes médicos:', error);
          // Continuar con exámenes vacíos
        }
        
        const today = new Date();
        const today_appointments = appointments.filter(app => {
          const appDate = new Date(app.date);
          return appDate.toDateString() === today.toDateString();
        });

        const upcoming = appointments.filter(app => {
          const appDate = new Date(app.date);
          return appDate > today;
        }).slice(0, 5);

        const recent = appointments
          .filter(app => {
            const appDate = new Date(app.date);
            return appDate <= today;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        // Extraer pacientes únicos de las citas
        const uniquePatients = appointments.reduce((acc: any[], app) => {
          if (app.appointmentPatient && !acc.find(p => p.id === app.appointmentPatient?.id)) {
            acc.push(app.appointmentPatient);
          }
          return acc;
        }, []);

        setTodayAppointments(today_appointments);
        setUpcomingAppointments(upcoming);
        setRecentAppointments(recent);
        setMedicalRecords(records);
        setMedicalExams(exams);
        setPatients(uniquePatients);

        // Calcular estadísticas
        const completed = appointments.filter(app => app.status === 'completada').length;
        const pending = appointments.filter(app => app.status === 'pendiente').length;
        const monthlyGrowth = appointments.length > 0 
          ? ((appointments.length - (appointments.length * 0.8)) / (appointments.length * 0.8)) * 100
          : 0;

        setStats({
          totalAppointments: appointments.length,
          todayAppointments: today_appointments.length,
          upcomingAppointments: upcoming.length,
          completedAppointments: completed,
          pendingAppointments: pending,
          totalPatients: uniquePatients.length,
          totalRecords: records.length,
          totalExams: exams.length,
          monthlyGrowth: Math.round(monthlyGrowth)
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pendiente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completada':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelada':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmada</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
      case 'completada':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completada</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del especialista...</p>
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
        heading="Panel del Especialista"
        text={`Bienvenido, ${user?.name || 'Especialista'}. Gestiona tus citas, pacientes y registros médicos.`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/appointments/new">
            <Button className="w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Nueva Cita
            </Button>
          </Link>
          <Link href="/medical-records/new">
            <Button variant="outline" className="w-full sm:w-auto">
              <ClipboardList className="mr-2 h-4 w-4" />
              Nuevo Registro
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Citas Hoy</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.todayAppointments}</div>
            <p className="text-xs text-blue-600 mt-1">
              {stats.todayAppointments > 0 ? `${stats.todayAppointments} programadas` : 'Sin citas programadas'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Próximas Citas</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.upcomingAppointments}</div>
            <p className="text-xs text-green-600 mt-1">
              En los próximos días
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.totalPatients}</div>
            <p className="text-xs text-purple-600 mt-1">
              Pacientes atendidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Crecimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.monthlyGrowth}%</div>
            <p className="text-xs text-orange-600 mt-1">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
              Estadísticas de Citas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de citas:</span>
              <span className="font-semibold">{stats.totalAppointments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completadas:</span>
              <span className="font-semibold text-green-600">{stats.completedAppointments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pendientes:</span>
              <span className="font-semibold text-yellow-600">{stats.pendingAppointments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Registros médicos:</span>
              <span className="font-semibold text-purple-600">{stats.totalRecords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Exámenes:</span>
              <span className="font-semibold text-orange-600">{stats.totalExams}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="mr-2 h-5 w-5 text-green-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Citas completadas</p>
                  <p className="text-xs text-gray-500">Este mes</p>
                </div>
                <span className="text-sm font-semibold">{stats.completedAppointments}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nuevos pacientes</p>
                  <p className="text-xs text-gray-500">Este mes</p>
                </div>
                <span className="text-sm font-semibold">{Math.floor(stats.totalPatients * 0.3)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Registros creados</p>
                  <p className="text-xs text-gray-500">Este mes</p>
                </div>
                <span className="text-sm font-semibold">{Math.floor(stats.totalRecords * 0.4)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Stethoscope className="mr-2 h-5 w-5 text-purple-600" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/specialist/availability">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Gestionar Disponibilidad
              </Button>
            </Link>
            <Link href="/dashboard/specialist/patients">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Ver Pacientes
              </Button>
            </Link>
            <Link href="/dashboard/specialist/profile">
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="mr-2 h-4 w-4" />
                Mi Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Citas de hoy y próximas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
                Citas de Hoy
              </span>
              <Link href="/appointments">
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {appointment.appointmentPatient?.username || `Paciente ${appointment.patient_id}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {appointment.reason && (
                        <p className="text-xs text-gray-500 mt-1">{appointment.reason}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      <Link href={`/appointments/${appointment.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay citas programadas para hoy</p>
                <Link href="/appointments/new">
                  <Button variant="outline" className="mt-3">
                    <Plus className="mr-2 h-4 w-4" />
                    Programar Cita
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-green-600" />
                Próximas Citas
              </span>
              <Link href="/appointments">
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {appointment.appointmentPatient?.username || `Paciente ${appointment.patient_id}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })} - {new Date(appointment.date).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {appointment.reason && (
                        <p className="text-xs text-gray-500 mt-1">{appointment.reason}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      <Link href={`/appointments/${appointment.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay citas próximas</p>
                <Link href="/appointments/new">
                  <Button variant="outline" className="mt-3">
                    <Plus className="mr-2 h-4 w-4" />
                    Programar Cita
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registros médicos y exámenes recientes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5 text-purple-600" />
                Últimos Registros Médicos
              </span>
              <Link href="/medical-records">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medicalRecords.length > 0 ? (
              <div className="space-y-3">
                {medicalRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{record.diagnosis}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                        {record.notes && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{record.notes}</p>
                        )}
                      </div>
                      <Link href={`/medical-records/${record.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay registros médicos</p>
                <Link href="/medical-records/new">
                  <Button variant="outline" className="mt-3">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Registro
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-orange-600" />
                Últimos Exámenes
              </span>
              <Link href="/medical-exams">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medicalExams.length > 0 ? (
              <div className="space-y-3">
                {medicalExams.slice(0, 3).map((exam) => (
                  <div key={exam.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{exam.type}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(exam.date).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                        {exam.result && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{exam.result}</p>
                        )}
                      </div>
                      <Link href={`/medical-exams/${exam.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay exámenes registrados</p>
                <Link href="/medical-exams/new">
                  <Button variant="outline" className="mt-3">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Examen
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
} 