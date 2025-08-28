'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Edit,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Stethoscope,
  Microscope,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Star,
  Heart,
  Zap,
  Shield,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  Clock3,
  UserPlus,
  FileCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

interface SpecialistMetrics {
  // KPIs Principales
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  
  // Métricas de Pacientes
  totalPatients: number;
  newPatientsThisMonth: number;
  returningPatients: number;
  activePatients: number;
  
  // Métricas de Productividad
  totalRecords: number;
  recordsThisMonth: number;
  totalExams: number;
  examsThisMonth: number;
  
  // Métricas de Rendimiento
  completionRate: number;
  satisfactionRate: number;
  averageAppointmentDuration: number;
  availabilityUtilization: number;
  
  // Tendencias
  appointmentsTrend: 'up' | 'down' | 'stable';
  patientsTrend: 'up' | 'down' | 'stable';
  recordsTrend: 'up' | 'down' | 'stable';
  
  // Distribución por Estado
  appointmentsByStatus: {
    confirmada: number;
    pendiente: number;
    completada: number;
    cancelada: number;
  };
  
  // Distribución por Categoría de Examen
  examsByCategory: {
    laboratorio: number;
    imagenologia: number;
    cardiologia: number;
    neurologia: number;
    otros: number;
  };
}

interface SpecialistDashboardData {
  metrics: SpecialistMetrics;
  recentAppointments: Appointment[];
  recentPatients: any[];
  recentRecords: MedicalRecord[];
  recentExams: MedicalExam[];
  upcomingSchedule: Appointment[];
  urgentCases: (Appointment | MedicalRecord)[];
}

export default function SpecialistDashboard() {
  const { user, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<SpecialistDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('month');

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
          const examsData = await medicalExamService.getMyMedicalExams();
          exams = examsData.exams || [];
        } catch (error) {
          console.error('Error cargando exámenes médicos:', error);
          exams = [];
        }
        
        // Calcular métricas
        const metrics = calculateMetrics(appointments, records, exams);
        
        // Preparar datos para el dashboard
        const today = new Date();
        const upcomingSchedule = appointments
          .filter(app => new Date(app.date) > today && app.status !== 'cancelada')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);

        const urgentCases = [
          ...appointments.filter(app => app.status === 'pendiente' && new Date(app.date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)),
          ...records.filter(record => record.diagnosis?.toLowerCase().includes('urgente') || record.diagnosis?.toLowerCase().includes('crítico'))
        ].slice(0, 3);

        setDashboardData({
          metrics,
          recentAppointments: appointments.slice(0, 5),
          recentPatients: extractUniquePatients(appointments).slice(0, 5),
          recentRecords: records.slice(0, 5),
          recentExams: exams.slice(0, 5),
          upcomingSchedule,
          urgentCases
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
  }, [user, isLoading, timeRange]);

  const calculateMetrics = (appointments: Appointment[], records: MedicalRecord[], exams: MedicalExam[]): SpecialistMetrics => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // KPIs Principales
    const totalAppointments = appointments.length;
    const todayAppointments = appointments.filter(app => 
      new Date(app.date).toDateString() === today.toDateString()
    ).length;
    const upcomingAppointments = appointments.filter(app => 
      new Date(app.date) > today && app.status !== 'cancelada'
    ).length;
    const completedAppointments = appointments.filter(app => app.status === 'completada').length;
    const pendingAppointments = appointments.filter(app => app.status === 'pendiente').length;
    const cancelledAppointments = appointments.filter(app => app.status === 'cancelada').length;

    // Métricas de Pacientes
    const uniquePatients = extractUniquePatients(appointments);
    const totalPatients = uniquePatients.length;
    const newPatientsThisMonth = uniquePatients.filter((patient: any) => 
      new Date(patient.createdAt || '') >= thisMonth
    ).length;
    const returningPatients = uniquePatients.filter((patient: any) => 
      appointments.filter(app => app.patient_id === patient.id).length > 1
    ).length;
    const activePatients = uniquePatients.filter((patient: any) => 
      appointments.filter(app => app.patient_id === patient.id && new Date(app.date) >= lastMonth).length > 0
    ).length;

    // Métricas de Productividad
    const totalRecords = records.length;
    const recordsThisMonth = records.filter(record => 
              new Date(record.consultation_date) >= thisMonth
    ).length;
    const totalExams = exams.length;
    const examsThisMonth = exams.filter(exam => 
      new Date(exam.date) >= thisMonth
    ).length;

    // Métricas de Rendimiento
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
    const satisfactionRate = 95; // Placeholder - en un sistema real vendría de encuestas
    const averageAppointmentDuration = 45; // Placeholder - en minutos
    const availabilityUtilization = 78; // Placeholder - porcentaje de tiempo ocupado

    // Tendencias (simplificado)
    const appointmentsTrend = appointments.length > 0 ? 'up' : 'stable';
    const patientsTrend = uniquePatients.length > 0 ? 'up' : 'stable';
    const recordsTrend = records.length > 0 ? 'up' : 'stable';

    // Distribución por Estado
    const appointmentsByStatus = {
      confirmada: appointments.filter(app => app.status === 'confirmada').length,
      pendiente: appointments.filter(app => app.status === 'pendiente').length,
      completada: appointments.filter(app => app.status === 'completada').length,
      cancelada: appointments.filter(app => app.status === 'cancelada').length
    };

    // Distribución por Categoría de Examen
    const examsByCategory = {
      laboratorio: exams.filter(exam => exam.category === 'laboratorio').length,
      imagenologia: exams.filter(exam => exam.category === 'imagenologia').length,
      cardiologia: exams.filter(exam => exam.category === 'cardiologia').length,
      neurologia: exams.filter(exam => exam.category === 'neurologia').length,
      otros: exams.filter(exam => !['laboratorio', 'imagenologia', 'cardiologia', 'neurologia'].includes(exam.category || '')).length
    };

    return {
      totalAppointments,
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalPatients,
      newPatientsThisMonth,
      returningPatients,
      activePatients,
      totalRecords,
      recordsThisMonth,
      totalExams,
      examsThisMonth,
      completionRate,
      satisfactionRate,
      averageAppointmentDuration,
      availabilityUtilization,
      appointmentsTrend,
      patientsTrend,
      recordsTrend,
      appointmentsByStatus,
      examsByCategory
    };
  };

  const extractUniquePatients = (appointments: Appointment[]): any[] => {
    const uniquePatients = appointments.reduce((acc: any[], app) => {
      if (app.appointmentPatient && !acc.find(p => p.id === app.appointmentPatient?.id)) {
        acc.push(app.appointmentPatient);
      }
      return acc;
    }, []);
    return uniquePatients;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmada: { label: 'Confirmada', className: 'bg-green-100 text-green-800' },
      pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      completada: { label: 'Completada', className: 'bg-blue-100 text-blue-800' },
      cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
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
            <p className="text-gray-600">Cargando dashboard especializado...</p>
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
        text={`Bienvenido, Dr. ${user?.username || 'Especialista'}. Aquí tienes un resumen completo de tu actividad médica.`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/dashboard/specialist/appointments">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Mis Citas
            </Button>
          </Link>
          <Link href="/dashboard/specialist/patients">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Mis Pacientes
            </Button>
          </Link>
          <Link href="/dashboard/specialist/availability">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Disponibilidad
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* KPIs Principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.metrics.todayAppointments || 0}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(dashboardData?.metrics.appointmentsTrend || 'stable')}
                  <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.metrics.activePatients || 0}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(dashboardData?.metrics.patientsTrend || 'stable')}
                  <span className="text-xs text-gray-500 ml-1">+{dashboardData?.metrics.newPatientsThisMonth || 0} este mes</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Finalización</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.metrics.completionRate.toFixed(1) || 0}%</p>
                <div className="flex items-center mt-1">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-gray-500 ml-1">Meta: 90%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.metrics.satisfactionRate || 0}%</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-gray-500 ml-1">Excelente</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Productividad */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Stethoscope className="mr-2 h-5 w-5 text-blue-600" />
              Actividad Médica
            </CardTitle>
            <CardDescription>Resumen de tu actividad profesional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{dashboardData?.metrics.totalRecords || 0}</p>
                <p className="text-sm text-gray-600">Registros</p>
                <p className="text-xs text-green-600">+{dashboardData?.metrics.recordsThisMonth || 0} este mes</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{dashboardData?.metrics.totalExams || 0}</p>
                <p className="text-sm text-gray-600">Exámenes</p>
                <p className="text-xs text-green-600">+{dashboardData?.metrics.examsThisMonth || 0} este mes</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Utilización de Horarios</span>
                <span>{dashboardData?.metrics.availabilityUtilization || 0}%</span>
              </div>
              <Progress value={dashboardData?.metrics.availabilityUtilization || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Duración Promedio Cita</span>
                <span>{dashboardData?.metrics.averageAppointmentDuration || 0} min</span>
              </div>
              <Progress value={(dashboardData?.metrics.averageAppointmentDuration || 0) / 60 * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
              Distribución de Citas
            </CardTitle>
            <CardDescription>Estado de tus citas médicas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Confirmadas</span>
                </div>
                <span className="text-sm font-medium">{dashboardData?.metrics.appointmentsByStatus.confirmada || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Pendientes</span>
                </div>
                <span className="text-sm font-medium">{dashboardData?.metrics.appointmentsByStatus.pendiente || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Completadas</span>
                </div>
                <span className="text-sm font-medium">{dashboardData?.metrics.appointmentsByStatus.completada || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Canceladas</span>
                </div>
                <span className="text-sm font-medium">{dashboardData?.metrics.appointmentsByStatus.cancelada || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Microscope className="mr-2 h-5 w-5 text-orange-600" />
              Exámenes por Categoría
            </CardTitle>
            <CardDescription>Distribución de exámenes médicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Laboratorio</span>
                </div>
                <span className="text-sm font-medium">{dashboardData?.metrics.examsByCategory.laboratorio || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Imagenología</span>
                </div>
                <span className="text-sm font-medium">{dashboardData?.metrics.examsByCategory.imagenologia || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Cardiología</span>
                </div>
                <span className="text-sm font-medium">{dashboardData?.metrics.examsByCategory.cardiologia || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Otros</span>
                </div>
                <span className="text-sm font-medium">{dashboardData?.metrics.examsByCategory.otros || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Citas y Casos Urgentes */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CalendarDays className="mr-2 h-5 w-5 text-blue-600" />
              Próximas Citas
            </CardTitle>
            <CardDescription>Tu agenda para los próximos días</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.upcomingSchedule && dashboardData.upcomingSchedule.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingSchedule.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.appointmentPatient?.username || `Paciente ${appointment.patient_id}`}
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
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tienes citas próximas</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
              Casos Urgentes
            </CardTitle>
            <CardDescription>Casos que requieren atención inmediata</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.urgentCases && dashboardData.urgentCases.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.urgentCases.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {'appointmentPatient' in item 
                            ? item.appointmentPatient?.username || `Paciente ${item.patient_id}`
                            : 'Registro Médico'
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          {'date' in item ? formatDate(item.date) : 'Urgente'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Urgente</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay casos urgentes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas y Enlaces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Zap className="mr-2 h-5 w-5 text-yellow-600" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>Accede rápidamente a las funciones más importantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <Link href="/dashboard/specialist/appointments">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Mis Citas</span>
              </Button>
            </Link>
            <Link href="/dashboard/specialist/patients">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <Users className="h-6 w-6" />
                <span className="text-sm">Mis Pacientes</span>
              </Button>
            </Link>
            <Link href="/dashboard/specialist/availability">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <Clock className="h-6 w-6" />
                <span className="text-sm">Disponibilidad</span>
              </Button>
            </Link>
            <Link href="/medical-records">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <ClipboardList className="h-6 w-6" />
                <span className="text-sm">Registros</span>
              </Button>
            </Link>
            <Link href="/medical-exams">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <Microscope className="h-6 w-6" />
                <span className="text-sm">Exámenes</span>
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <UserCheck className="h-6 w-6" />
                <span className="text-sm">Mi Perfil</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
} 