'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  UserCheck, 
  UserX, 
  Clock, 
  Plus,
  ClipboardList, 
  FileText, 
  Users, 
  Activity,
  Eye,
  Edit
} from 'lucide-react';
import Link from 'next/link';

interface SpecialistSummary {
  kpis: {
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  totalRecords: number;
  totalExams: number;
  };
  ultimasCitas: Appointment[];
  ultimosPacientes: User[];
  ultimosRegistros: MedicalRecord[];
  ultimosExamenes: MedicalExam[];
}

export default function SpecialistDashboard() {
  const { user, isLoading } = useAuth();
  const [summary, setSummary] = useState<SpecialistSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'Especialista') {
      if (user.role === 'Super Admin') window.location.href = '/dashboard/super-admin';
      else if (user.role === 'Administrador') window.location.href = '/dashboard/admin';
      else if (user.role === 'Paciente') window.location.href = '/dashboard/paciente';
    }
  }, [user, isLoading]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || user.role !== 'Especialista') return;
      
      setLoading(true);
      try {
        // Cargar datos de forma individual para manejar errores por separado
        let appointments: Appointment[] = [];
        let records: MedicalRecord[] = [];
        let exams: MedicalExam[] = [];

        try {
          appointments = await appointmentService.getSpecialistAppointments();
        } catch (error) {
          console.error('Error cargando citas:', error);
          appointments = [];
        }

        try {
          records = await medicalRecordService.getMyMedicalRecords('Especialista');
        } catch (error) {
          console.error('Error cargando registros médicos:', error);
          records = [];
        }

        try {
          exams = await medicalExamService.getMyMedicalExams();
        } catch (error) {
          console.error('Error cargando exámenes médicos:', error);
          exams = [];
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

        // Extraer pacientes únicos de las citas
        const uniquePatients = appointments.reduce((acc: any[], app) => {
          if (app.appointmentPatient && !acc.find(p => p.id === app.appointmentPatient?.id)) {
            acc.push(app.appointmentPatient);
          }
          return acc;
        }, []);

        // Calcular estadísticas
        const completed = appointments.filter(app => app.status === 'completada').length;
        const pending = appointments.filter(app => app.status === 'pendiente').length;

        setSummary({
          kpis: {
          totalAppointments: appointments.length,
          todayAppointments: today_appointments.length,
          upcomingAppointments: upcoming.length,
          completedAppointments: completed,
          pendingAppointments: pending,
          totalPatients: uniquePatients.length,
          totalRecords: records.length,
            totalExams: exams.length
          },
          ultimasCitas: appointments.slice(0, 5),
          ultimosPacientes: uniquePatients.slice(0, 5),
          ultimosRegistros: records.slice(0, 5),
          ultimosExamenes: exams.slice(0, 5)
        });
        
        setError(null);
      } catch (err: unknown) {
        setError('Error al cargar los datos del dashboard');
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user?.role === 'Especialista') {
      loadDashboardData();
    }
  }, [user, isLoading]);

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

  if (isLoading || !user) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (user.role !== 'Especialista') return null;

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/dashboard/specialist/appointments" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Mis Citas</span>
              <span className="sm:hidden">Citas</span>
            </Button>
          </Link>
          <Link href="/medical-records/new" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <ClipboardList className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Registro</span>
              <span className="sm:hidden">Registro</span>
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* KPIs Principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Citas Hoy</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis.todayAppointments || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Próximas Citas</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis.upcomingAppointments || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Pacientes</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis.totalPatients || 0}</div>
            </div>
            </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-orange-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Total Citas</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis.totalAppointments || 0}</div>
            </div>
            </div>
        </Card>
                </div>

      {/* Últimos Registros */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Últimas Citas</h3>
            <Link href="/dashboard/specialist/appointments">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Ver todas
              </Button>
            </Link>
              </div>
          {summary?.ultimasCitas && summary.ultimasCitas.length > 0 ? (
            <div className="space-y-2">
              {summary.ultimasCitas.map((cita) => (
                <div key={cita.id} className="p-2 border rounded">
                  <p className="font-medium">{cita.appointmentPatient?.username || `Paciente ${cita.patient_id}`}</p>
                  <p className="text-sm text-gray-600">{new Date(cita.date).toLocaleDateString()}</p>
                  <div className="mt-1">{getStatusBadge(cita.status)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay citas registradas</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Últimos Pacientes</h3>
            <Link href="/dashboard/specialist/patients">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Ver todos
              </Button>
            </Link>
      </div>
          {summary?.ultimosPacientes && summary.ultimosPacientes.length > 0 ? (
            <div className="space-y-2">
              {summary.ultimosPacientes.map((paciente) => (
                <div key={paciente.id} className="p-2 border rounded">
                  <p className="font-medium">{paciente.username}</p>
                  <p className="text-sm text-gray-600">ID: {paciente.identification_number}</p>
                  </div>
                ))}
              </div>
            ) : (
            <p className="text-gray-500 text-center py-4">No hay pacientes registrados</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Últimos Registros</h3>
            <Link href="/medical-records">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Ver todos
                        </Button>
                      </Link>
                    </div>
          {summary?.ultimosRegistros && summary.ultimosRegistros.length > 0 ? (
            <div className="space-y-2">
              {summary.ultimosRegistros.map((registro) => (
                <div key={registro.id} className="p-2 border rounded">
                  <p className="font-medium">{registro.diagnosis}</p>
                  <p className="text-sm text-gray-600">{new Date(registro.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
            <p className="text-gray-500 text-center py-4">No hay registros médicos</p>
          )}
        </Card>
      </div>

      {/* Estadísticas Detalladas */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">Estadísticas de Citas</h2>
          <Link href="/dashboard/specialist/appointments">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              Ver todas
                        </Button>
                      </Link>
                    </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary?.kpis.completedAppointments || 0}</div>
            <p className="text-sm text-gray-600">Completadas</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{summary?.kpis.pendingAppointments || 0}</div>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{summary?.kpis.totalRecords || 0}</div>
            <p className="text-sm text-gray-600">Registros</p>
                  </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{summary?.kpis.totalExams || 0}</div>
            <p className="text-sm text-gray-600">Exámenes</p>
              </div>
              </div>
        </Card>

      {/* Acciones Rápidas */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/specialist/appointments">
            <Button className="w-full" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ver Citas</span>
              <span className="sm:hidden">Citas</span>
            </Button>
          </Link>
          <Link href="/dashboard/specialist/availability">
            <Button className="w-full" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Disponibilidad</span>
              <span className="sm:hidden">Horarios</span>
                </Button>
              </Link>
          <Link href="/dashboard/specialist/patients">
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Mis Pacientes</span>
              <span className="sm:hidden">Pacientes</span>
                        </Button>
                      </Link>
          <Link href="/dashboard/specialist/profile">
            <Button className="w-full" variant="outline">
              <UserCheck className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Mi Perfil</span>
              <span className="sm:hidden">Perfil</span>
                  </Button>
                </Link>
              </div>
        </Card>
    </DashboardShell>
  );
} 