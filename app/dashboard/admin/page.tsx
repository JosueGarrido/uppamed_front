'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { dashboardService } from '@/services/dashboard.service';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { appointmentService } from '@/services/appointment.service';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { medicalExamService } from '@/services/medicalExam.service';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  Plus,
  Settings,
  Stethoscope,
  UserPlus,
  CalendarPlus,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
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
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Users2,
  UserCog,
  ClipboardList,
  ActivitySquare,
  Building2,
  ChartBar,
  TargetIcon,
  TrendingUpIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSignIcon,
  Percent,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  MicroscopeIcon,
  X
} from 'lucide-react';
import Link from 'next/link';
import { User } from '@/types/auth';
import { Appointment } from '@/types/appointment';
import { MedicalRecord } from '@/types/medicalRecord';
import { MedicalExam } from '@/types/medicalExam';

interface HospitalMetrics {
  // KPIs Principales del Negocio
    totalUsers: number;
  totalSpecialists: number;
  totalPatients: number;
  totalAppointments: number;
  
  // Métricas de Crecimiento
  newUsersThisMonth: number;
  newPatientsThisMonth: number;
  newSpecialistsThisMonth: number;
  appointmentsThisMonth: number;
  
  // Métricas de Operación
  totalRecords: number;
  totalExams: number;
  recordsThisMonth: number;
  examsThisMonth: number;
  
  // Métricas de Rendimiento
  appointmentCompletionRate: number;
  specialistUtilization: number;
  patientSatisfaction: number;
  operationalEfficiency: number;
  
  // Métricas Financieras (simuladas)
  monthlyRevenue: number;
  averageAppointmentValue: number;
  costPerPatient: number;
  profitMargin: number;
  
  // Tendencias
  usersTrend: 'up' | 'down' | 'stable';
  appointmentsTrend: 'up' | 'down' | 'stable';
  revenueTrend: 'up' | 'down' | 'stable';
  
  // Distribución por Estado
  appointmentsByStatus: {
    confirmada: number;
    pendiente: number;
    completada: number;
    cancelada: number;
  };
  
  // Distribución por Especialidad
  specialistsByArea: {
    cardiologia: number;
    neurologia: number;
    pediatria: number;
    ginecologia: number;
    traumatologia: number;
    otros: number;
  };
  
  // Métricas de Calidad
  averageWaitTime: number;
  noShowRate: number;
  patientRetentionRate: number;
  specialistPerformance: number;
}

interface HospitalDashboardData {
  metrics: HospitalMetrics;
  recentUsers: User[];
  recentSpecialists: User[];
  recentPatients: User[];
  recentAppointments: Appointment[];
  recentRecords: MedicalRecord[];
  recentExams: MedicalExam[];
  upcomingAppointments: Appointment[];
  urgentCases: (Appointment | MedicalRecord)[];
  topPerformingSpecialists: User[];
  systemAlerts: Array<{
    id: string;
    type: 'urgent' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
    time: string;
  }>;
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<HospitalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('month');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'Administrador') {
      if (user.role === 'Super Admin') window.location.href = '/dashboard/super-admin';
      else if (user.role === 'Especialista') window.location.href = '/dashboard/specialist';
      else if (user.role === 'Paciente') window.location.href = '/dashboard/paciente';
    }
  }, [user, isLoading]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || user.role !== 'Administrador') return;
      
      setLoading(true);
      try {
        const userData = await authService.fetchUserData();
        if (!userData.tenant_id) throw new Error('No se encontró tenant_id');
        
        // Cargar todos los datos necesarios
        const [allUsers, allAppointments, allRecords, allExams] = await Promise.all([
          userService.getUsersByTenant(userData.tenant_id),
          appointmentService.getAppointmentsByTenant(userData.tenant_id),
          medicalRecordService.getMyMedicalRecords('Administrador'),
          medicalExamService.getMyMedicalExams(undefined, 'Administrador')
        ]);

        // Calcular métricas
        const metrics = calculateHospitalMetrics(allUsers, allAppointments, allRecords, allExams.exams || []);
        
        // Preparar datos para el dashboard
        const today = new Date();
        const upcomingAppointments = allAppointments
          .filter(app => new Date(app.date) > today && app.status !== 'cancelada')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);

        const urgentCases = [
          ...allAppointments.filter(app => app.status === 'pendiente' && new Date(app.date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)),
          ...allRecords.filter(record => record.diagnosis?.toLowerCase().includes('urgente') || record.diagnosis?.toLowerCase().includes('crítico'))
        ].slice(0, 3);

        const specialists = allUsers.filter(u => u.role === 'Especialista');
        const patients = allUsers.filter(u => u.role === 'Paciente');

        // Simular alertas del sistema
        const systemAlerts = generateSystemAlerts(allUsers, allAppointments, allRecords);

        setDashboardData({
          metrics,
          recentUsers: allUsers.slice(0, 5),
          recentSpecialists: specialists.slice(0, 5),
          recentPatients: patients.slice(0, 5),
          recentAppointments: allAppointments.slice(0, 5),
          recentRecords: allRecords.slice(0, 5),
          recentExams: allExams.exams?.slice(0, 5) || [],
          upcomingAppointments,
          urgentCases,
          topPerformingSpecialists: specialists.slice(0, 3), // Simplificado
          systemAlerts
        });
        
        setError(null);
      } catch (err: unknown) {
        setError('Error al cargar los datos del dashboard');
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user?.role === 'Administrador') {
      loadDashboardData();
    }
  }, [user, isLoading, timeRange]);

  const calculateHospitalMetrics = (
    users: User[], 
    appointments: Appointment[], 
    records: MedicalRecord[], 
    exams: MedicalExam[]
  ): HospitalMetrics => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // KPIs Principales
    const totalUsers = users.length;
    const totalSpecialists = users.filter(u => u.role === 'Especialista').length;
    const totalPatients = users.filter(u => u.role === 'Paciente').length;
    const totalAppointments = appointments.length;

    // Métricas de Crecimiento
    const newUsersThisMonth = users.filter(u => 
      new Date(u.createdAt || '') >= thisMonth
    ).length;
    const newPatientsThisMonth = users.filter(u => 
      u.role === 'Paciente' && new Date(u.createdAt || '') >= thisMonth
    ).length;
    const newSpecialistsThisMonth = users.filter(u => 
      u.role === 'Especialista' && new Date(u.createdAt || '') >= thisMonth
    ).length;
    const appointmentsThisMonth = appointments.filter(app => 
      new Date(app.date) >= thisMonth
    ).length;

    // Métricas de Operación
    const totalRecords = records.length;
    const totalExams = exams.length;
    const recordsThisMonth = records.filter(record => 
      new Date(record.date) >= thisMonth
    ).length;
    const examsThisMonth = exams.filter(exam => 
      new Date(exam.date) >= thisMonth
    ).length;

    // Métricas de Rendimiento
    const completedAppointments = appointments.filter(app => app.status === 'completada').length;
    const appointmentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
    const specialistUtilization = totalSpecialists > 0 ? (appointmentsThisMonth / (totalSpecialists * 20)) * 100 : 0; // 20 citas promedio por especialista
    const patientSatisfaction = 92; // Placeholder
    const operationalEfficiency = 85; // Placeholder

    // Métricas Financieras (simuladas)
    const monthlyRevenue = appointmentsThisMonth * 150; // $150 promedio por cita
    const averageAppointmentValue = totalAppointments > 0 ? monthlyRevenue / appointmentsThisMonth : 0;
    const costPerPatient = 80; // Placeholder
    const profitMargin = 35; // Placeholder

    // Tendencias
    const usersTrend = newUsersThisMonth > 0 ? 'up' : 'stable';
    const appointmentsTrend = appointmentsThisMonth > 0 ? 'up' : 'stable';
    const revenueTrend = monthlyRevenue > 0 ? 'up' : 'stable';

    // Distribución por Estado
    const appointmentsByStatus = {
      confirmada: appointments.filter(app => app.status === 'confirmada').length,
      pendiente: appointments.filter(app => app.status === 'pendiente').length,
      completada: appointments.filter(app => app.status === 'completada').length,
      cancelada: appointments.filter(app => app.status === 'cancelada').length
    };

    // Distribución por Especialidad
    const specialistsByArea = {
      cardiologia: users.filter(u => u.role === 'Especialista' && u.specialty === 'cardiologia').length,
      neurologia: users.filter(u => u.role === 'Especialista' && u.specialty === 'neurologia').length,
      pediatria: users.filter(u => u.role === 'Especialista' && u.specialty === 'pediatria').length,
      ginecologia: users.filter(u => u.role === 'Especialista' && u.specialty === 'ginecologia').length,
      traumatologia: users.filter(u => u.role === 'Especialista' && u.specialty === 'traumatologia').length,
      otros: users.filter(u => u.role === 'Especialista' && !['cardiologia', 'neurologia', 'pediatria', 'ginecologia', 'traumatologia'].includes(u.specialty || '')).length
    };

    // Métricas de Calidad
    const averageWaitTime = 15; // minutos
    const noShowRate = 8; // porcentaje
    const patientRetentionRate = 78; // porcentaje
    const specialistPerformance = 88; // porcentaje

    return {
      totalUsers,
      totalSpecialists,
      totalPatients,
      totalAppointments,
      newUsersThisMonth,
      newPatientsThisMonth,
      newSpecialistsThisMonth,
      appointmentsThisMonth,
      totalRecords,
      totalExams,
      recordsThisMonth,
      examsThisMonth,
      appointmentCompletionRate,
      specialistUtilization,
      patientSatisfaction,
      operationalEfficiency,
      monthlyRevenue,
      averageAppointmentValue,
      costPerPatient,
      profitMargin,
      usersTrend,
      appointmentsTrend,
      revenueTrend,
      appointmentsByStatus,
      specialistsByArea,
      averageWaitTime,
      noShowRate,
      patientRetentionRate,
      specialistPerformance
    };
  };

  const generateSystemAlerts = (
    users: User[], 
    appointments: Appointment[], 
    records: MedicalRecord[]
  ) => {
    const alerts = [];
    const today = new Date();

    // Alerta si hay muchos usuarios nuevos
    const newUsersThisMonth = users.filter(u => 
      new Date(u.createdAt || '') >= new Date(today.getFullYear(), today.getMonth(), 1)
    ).length;
    
    if (newUsersThisMonth > 50) {
      alerts.push({
        id: '1',
        type: 'success' as const,
        title: 'Crecimiento Exitoso',
        description: `${newUsersThisMonth} nuevos usuarios este mes`,
        time: 'Hace 2 horas'
      });
    }

    // Alerta si hay citas pendientes urgentes
    const urgentAppointments = appointments.filter(app => 
      app.status === 'pendiente' && new Date(app.date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    );
    
    if (urgentAppointments.length > 10) {
      alerts.push({
        id: '2',
        type: 'warning' as const,
        title: 'Citas Pendientes',
        description: `${urgentAppointments.length} citas requieren atención`,
        time: 'Hace 1 hora'
      });
    }

    // Alerta de rendimiento del sistema
    alerts.push({
      id: '3',
      type: 'info' as const,
      title: 'Sistema Operativo',
      description: 'Todos los servicios funcionando correctamente',
      time: 'Hace 30 minutos'
    });

    return alerts;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  if (user.role !== 'Administrador') return null;

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard hospitalario...</p>
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
        heading="Panel de Administración Hospitalaria"
        text={`Bienvenido, ${user?.username || 'Administrador'}. Gestión integral del centro médico.`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/dashboard/admin/users">
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Gestionar Usuarios
            </Button>
          </Link>
          <Link href="/dashboard/admin/appointments">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Gestionar Citas
            </Button>
          </Link>
          <Link href="/dashboard/admin/reports">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reportes
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* KPIs Principales del Negocio */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData?.metrics.monthlyRevenue || 0)}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(dashboardData?.metrics.revenueTrend || 'stable')}
                  <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Citas del Mes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.metrics.appointmentsThisMonth || 0}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(dashboardData?.metrics.appointmentsTrend || 'stable')}
                  <span className="text-xs text-gray-500 ml-1">+{dashboardData?.metrics.newPatientsThisMonth || 0} nuevos pacientes</span>
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
                <p className="text-sm font-medium text-gray-600">Tasa de Finalización</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.metrics.appointmentCompletionRate.toFixed(1) || 0}%</p>
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
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.metrics.patientSatisfaction || 0}%</p>
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

      {/* Métricas de Operación y Financieras */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ActivitySquare className="mr-2 h-5 w-5 text-blue-600" />
              Operaciones Hospitalarias
            </CardTitle>
            <CardDescription>Métricas clave de operación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{dashboardData?.metrics.totalSpecialists || 0}</p>
                <p className="text-sm text-gray-600">Especialistas</p>
                <p className="text-xs text-green-600">+{dashboardData?.metrics.newSpecialistsThisMonth || 0} este mes</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{dashboardData?.metrics.totalPatients || 0}</p>
                <p className="text-sm text-gray-600">Pacientes</p>
                <p className="text-xs text-green-600">+{dashboardData?.metrics.newPatientsThisMonth || 0} este mes</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Utilización de Especialistas</span>
                <span>{dashboardData?.metrics.specialistUtilization.toFixed(1) || 0}%</span>
              </div>
              <Progress value={dashboardData?.metrics.specialistUtilization || 0} className="h-2" />
          </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Eficiencia Operativa</span>
                <span>{dashboardData?.metrics.operationalEfficiency || 0}%</span>
              </div>
              <Progress value={dashboardData?.metrics.operationalEfficiency || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Métricas Financieras
            </CardTitle>
            <CardDescription>Análisis financiero del centro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Valor Promedio Cita</span>
                <span className="text-sm font-bold">{formatCurrency(dashboardData?.metrics.averageAppointmentValue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Costo por Paciente</span>
                <span className="text-sm font-bold">{formatCurrency(dashboardData?.metrics.costPerPatient || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Margen de Beneficio</span>
                <span className="text-sm font-bold">{dashboardData?.metrics.profitMargin || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tasa de Retención</span>
                <span className="text-sm font-bold">{dashboardData?.metrics.patientRetentionRate || 0}%</span>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ChartBar className="mr-2 h-5 w-5 text-purple-600" />
              Calidad del Servicio
            </CardTitle>
            <CardDescription>Indicadores de calidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Tiempo de Espera Promedio</span>
                <span className="text-sm font-bold">{dashboardData?.metrics.averageWaitTime || 0} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tasa de No Show</span>
                <span className="text-sm font-bold">{dashboardData?.metrics.noShowRate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rendimiento Especialistas</span>
                <span className="text-sm font-bold">{dashboardData?.metrics.specialistPerformance || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Satisfacción Pacientes</span>
                <span className="text-sm font-bold">{dashboardData?.metrics.patientSatisfaction || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de Citas y Especialistas */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <PieChart className="mr-2 h-5 w-5 text-blue-600" />
              Distribución de Citas
            </CardTitle>
            <CardDescription>Estado de las citas médicas</CardDescription>
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
              <Users2 className="mr-2 h-5 w-5 text-purple-600" />
              Especialistas por Área
            </CardTitle>
            <CardDescription>Distribución de especialidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cardiología</span>
                <span className="text-sm font-medium">{dashboardData?.metrics.specialistsByArea.cardiologia || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Neurología</span>
                <span className="text-sm font-medium">{dashboardData?.metrics.specialistsByArea.neurologia || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pediatría</span>
                <span className="text-sm font-medium">{dashboardData?.metrics.specialistsByArea.pediatria || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ginecología</span>
                <span className="text-sm font-medium">{dashboardData?.metrics.specialistsByArea.ginecologia || 0}</span>
          </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Otros</span>
                <span className="text-sm font-medium">{dashboardData?.metrics.specialistsByArea.otros || 0}</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Citas y Alertas del Sistema */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CalendarDays className="mr-2 h-5 w-5 text-blue-600" />
              Próximas Citas
            </CardTitle>
            <CardDescription>Agenda para los próximos días</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.patient?.username || `Paciente ${appointment.patient_id}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Dr. {appointment.specialist?.username || `Especialista ${appointment.specialist_id}`}
                          </p>
                          <p className="text-xs text-gray-500">
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
                <p className="text-gray-500">No hay citas próximas</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
              Alertas del Sistema
            </CardTitle>
            <CardDescription>Notificaciones importantes</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.systemAlerts && dashboardData.systemAlerts.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.systemAlerts.map((alert) => (
                  <div key={alert.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                    alert.type === 'urgent' ? 'bg-red-50 border-red-200' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    alert.type === 'success' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {alert.type === 'urgent' ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
                       alert.type === 'warning' ? <Clock className="h-4 w-4 text-yellow-500" /> :
                       alert.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                       <FileText className="h-4 w-4 text-blue-500" />}
                  <div>
                        <p className={`font-medium ${
                          alert.type === 'urgent' ? 'text-red-800' :
                          alert.type === 'warning' ? 'text-yellow-800' :
                          alert.type === 'success' ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {alert.title}
                        </p>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                  </div>
                    <Badge className={
                      alert.type === 'urgent' ? 'bg-red-100 text-red-800' :
                      alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      alert.type === 'success' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {alert.type === 'urgent' ? 'Urgente' :
                       alert.type === 'warning' ? 'Advertencia' :
                       alert.type === 'success' ? 'Éxito' : 'Información'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay alertas activas</p>
          </div>
        )}
          </CardContent>
      </Card>
      </div>

      {/* Acciones Rápidas y Gestión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Zap className="mr-2 h-5 w-5 text-yellow-600" />
            Gestión Rápida
          </CardTitle>
          <CardDescription>Acciones administrativas principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <Button 
              className="w-full h-auto p-4 flex flex-col items-center space-y-2" 
              variant="outline"
              onClick={() => setShowNewUserModal(true)}
            >
              <UserPlus className="h-6 w-6" />
              <span className="text-sm">Crear Usuario</span>
            </Button>
            <Button 
              className="w-full h-auto p-4 flex flex-col items-center space-y-2" 
              variant="outline"
              onClick={() => setShowNewAppointmentModal(true)}
            >
              <CalendarPlus className="h-6 w-6" />
              <span className="text-sm">Nueva Cita</span>
            </Button>
          <Link href="/dashboard/admin/users">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <Users className="h-6 w-6" />
                <span className="text-sm">Gestionar Usuarios</span>
            </Button>
          </Link>
          <Link href="/dashboard/admin/appointments">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Gestionar Citas</span>
              </Button>
            </Link>
            <Link href="/dashboard/admin/reports">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Reportes</span>
              </Button>
            </Link>
            <Link href="/dashboard/admin/settings">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <Settings className="h-6 w-6" />
                <span className="text-sm">Configuración</span>
            </Button>
          </Link>
        </div>
        </CardContent>
      </Card>

      {/* Modal Nueva Cita */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nueva Cita</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewAppointmentModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Esta funcionalidad abrirá el modal de creación de citas similar al usado en "Mis Citas".
                Por ahora, este es un placeholder para la funcionalidad.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewAppointmentModal(false)}>
                  Cancelar
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Cita
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Usuario */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Crear Nuevo Usuario</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewUserModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Esta funcionalidad abrirá el modal de creación de usuarios similar al usado en el módulo "Usuarios".
                Por ahora, este es un placeholder para la funcionalidad.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewUserModal(false)}>
                  Cancelar
                </Button>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
} 