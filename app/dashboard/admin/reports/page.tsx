"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { appointmentService } from '@/services/appointment.service';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { medicalExamService } from '@/services/medicalExam.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  UserCheck,
  Clock,
  Target,
  Award,
  Star,
  FileText,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  User,
  Eye,
  Bone,
  Pill
} from 'lucide-react';

interface SpecialistStats {
  id: number;
  username: string;
  email: string;
  specialty?: string;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalPatients: number;
  averageRating: number;
  totalRecords: number;
  totalExams: number;
  utilizationRate: number;
}

interface AreaStats {
  name: string;
  icon: any;
  totalAppointments: number;
  totalSpecialists: number;
  averageUtilization: number;
  mostRequestedSpecialist: string;
  growthRate: number;
}

interface ReportData {
  specialists: SpecialistStats[];
  areas: AreaStats[];
  topSpecialists: SpecialistStats[];
  topAreas: AreaStats[];
  overallStats: {
    totalSpecialists: number;
    totalAppointments: number;
    averageUtilization: number;
    mostRequestedArea: string;
    mostRequestedSpecialist: string;
  };
}

export default function AdminReports() {
  const { user, isLoading } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedArea, setSelectedArea] = useState('all');

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = await authService.fetchUserData();
        if (!userData.tenant_id) throw new Error('No se encontró tenant_id');

        // Cargar todos los datos necesarios
        const [allUsers, allAppointments, allRecords, allExams] = await Promise.all([
          userService.getUsersByTenant(userData.tenant_id),
          appointmentService.getAppointmentsByTenant(userData.tenant_id),
          medicalRecordService.getMyMedicalRecords('Administrador'),
          medicalExamService.getMyMedicalExams(undefined, 'Administrador')
        ]);

        // Procesar datos para generar reportes
        const specialists = allUsers.filter(u => u.role === 'Especialista');
        const patients = allUsers.filter(u => u.role === 'Paciente');

        // Calcular estadísticas por especialista
        const specialistStats: SpecialistStats[] = specialists.map(specialist => {
          const specialistAppointments = allAppointments.filter(app => app.specialist_id === specialist.id);
          const specialistRecords = allRecords.filter(record => record.specialist_id === specialist.id);
          const specialistExams = allExams.exams?.filter(exam => exam.specialist_id === specialist.id) || [];
          
          const totalAppointments = specialistAppointments.length;
          const completedAppointments = specialistAppointments.filter(app => app.status === 'completada').length;
          const pendingAppointments = specialistAppointments.filter(app => app.status === 'pendiente').length;
          const cancelledAppointments = specialistAppointments.filter(app => app.status === 'cancelada').length;
          
          const uniquePatients = new Set(specialistAppointments.map(app => app.patient_id)).size;
          const utilizationRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

          return {
            id: specialist.id,
            username: specialist.username,
            email: specialist.email,
            specialty: specialist.specialty || 'General',
            totalAppointments,
            completedAppointments,
            pendingAppointments,
            cancelledAppointments,
            totalPatients: uniquePatients,
            averageRating: 4.5, // Simulado
            totalRecords: specialistRecords.length,
            totalExams: specialistExams.length,
            utilizationRate
          };
        });

        // Definir áreas médicas
        const medicalAreas = [
          { name: 'Cardiología', icon: Heart, color: 'text-red-500' },
          { name: 'Neurología', icon: Brain, color: 'text-blue-500' },
          { name: 'Pediatría', icon: Baby, color: 'text-green-500' },
          { name: 'Oftalmología', icon: Eye, color: 'text-purple-500' },
          { name: 'Traumatología', icon: Bone, color: 'text-orange-500' },
          { name: 'Medicina General', icon: Stethoscope, color: 'text-gray-500' },
          { name: 'Farmacología', icon: Pill, color: 'text-indigo-500' }
        ];

        // Calcular estadísticas por área
        const areaStats: AreaStats[] = medicalAreas.map(area => {
          const areaSpecialists = specialists.filter(s => s.specialty === area.name);
          const areaAppointments = allAppointments.filter(app => 
            areaSpecialists.some(s => s.id === app.specialist_id)
          );

          const totalAppointments = areaAppointments.length;
          const totalSpecialists = areaSpecialists.length;
          const averageUtilization = totalSpecialists > 0 ? totalAppointments / totalSpecialists : 0;

          // Encontrar el especialista más solicitado en esta área
          const specialistAppointmentCounts = areaSpecialists.map(s => ({
            name: s.username,
            count: allAppointments.filter(app => app.specialist_id === s.id).length
          }));
          const mostRequested = specialistAppointmentCounts.reduce((prev, current) => 
            prev.count > current.count ? prev : current
          );

          return {
            name: area.name,
            icon: area.icon,
            totalAppointments,
            totalSpecialists,
            averageUtilization,
            mostRequestedSpecialist: mostRequested.name,
            growthRate: Math.random() * 20 - 10 // Simulado
          };
        });

        // Ordenar especialistas por rendimiento
        const topSpecialists = specialistStats
          .sort((a, b) => b.utilizationRate - a.utilizationRate)
          .slice(0, 5);

        // Ordenar áreas por ocupación
        const topAreas = areaStats
          .sort((a, b) => b.totalAppointments - a.totalAppointments)
          .slice(0, 5);

        // Estadísticas generales
        const overallStats = {
          totalSpecialists: specialists.length,
          totalAppointments: allAppointments.length,
          averageUtilization: specialistStats.reduce((sum, s) => sum + s.utilizationRate, 0) / specialistStats.length,
          mostRequestedArea: topAreas[0]?.name || 'N/A',
          mostRequestedSpecialist: topSpecialists[0]?.username || 'N/A'
        };

        setReportData({
          specialists: specialistStats,
          areas: areaStats,
          topSpecialists,
          topAreas,
          overallStats
        });

      } catch (err: unknown) {
        setError('Error al cargar los reportes');
        console.error('Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user?.role === 'Administrador') {
      loadReportData();
    }
  }, [user, isLoading, timeRange]);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rate < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'Administrador') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="mt-2 text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Generando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">No hay datos disponibles</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600 mt-2">
            Análisis detallado del rendimiento de especialistas y ocupación por áreas médicas
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Especialistas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.overallStats.totalSpecialists}</div>
            <p className="text-xs text-muted-foreground">
              Activos en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.overallStats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilización Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.overallStats.averageUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tasa de ocupación general
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Más Solicitada</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{reportData.overallStats.mostRequestedArea}</div>
            <p className="text-xs text-muted-foreground">
              Mayor demanda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Especialistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top 5 Especialistas Más Solicitados
          </CardTitle>
          <CardDescription>
            Especialistas con mayor tasa de utilización y mejor rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.topSpecialists.map((specialist, index) => (
              <div key={specialist.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{specialist.username}</h3>
                    <p className="text-sm text-gray-600">{specialist.specialty}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline">{specialist.totalPatients} pacientes</Badge>
                      <Badge variant="outline">{specialist.totalAppointments} citas</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getUtilizationColor(specialist.utilizationRate)}`}>
                    {specialist.utilizationRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Utilización</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{specialist.averageRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis por Áreas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análisis por Áreas Médicas
          </CardTitle>
          <CardDescription>
            Distribución de citas y ocupación por especialidad médica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.areas.map((area) => {
              const IconComponent = area.icon;
              return (
                <div key={area.name} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent className="h-6 w-6 text-blue-500" />
                    <h3 className="font-semibold">{area.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Citas:</span>
                      <span className="font-semibold">{area.totalAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Especialistas:</span>
                      <span className="font-semibold">{area.totalSpecialists}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Promedio/Especialista:</span>
                      <span className="font-semibold">{area.averageUtilization.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Crecimiento:</span>
                      <div className="flex items-center gap-1">
                        {getGrowthIcon(area.growthRate)}
                        <span className={`text-sm font-semibold ${area.growthRate > 0 ? 'text-green-600' : area.growthRate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {area.growthRate > 0 ? '+' : ''}{area.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600">
                        Más solicitado: <span className="font-medium">{area.mostRequestedSpecialist}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Especialistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Detalle Completo de Especialistas
          </CardTitle>
          <CardDescription>
            Estadísticas detalladas de cada especialista
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Especialista</th>
                  <th className="text-left p-2">Especialidad</th>
                  <th className="text-center p-2">Citas Totales</th>
                  <th className="text-center p-2">Completadas</th>
                  <th className="text-center p-2">Pendientes</th>
                  <th className="text-center p-2">Pacientes</th>
                  <th className="text-center p-2">Utilización</th>
                  <th className="text-center p-2">Registros</th>
                  <th className="text-center p-2">Exámenes</th>
                </tr>
              </thead>
              <tbody>
                {reportData.specialists.map((specialist) => (
                  <tr key={specialist.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{specialist.username}</td>
                    <td className="p-2 text-sm text-gray-600">{specialist.specialty}</td>
                    <td className="p-2 text-center">{specialist.totalAppointments}</td>
                    <td className="p-2 text-center">
                      <Badge variant="success">{specialist.completedAppointments}</Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="warning">{specialist.pendingAppointments}</Badge>
                    </td>
                    <td className="p-2 text-center">{specialist.totalPatients}</td>
                    <td className="p-2 text-center">
                      <span className={`font-semibold ${getUtilizationColor(specialist.utilizationRate)}`}>
                        {specialist.utilizationRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2 text-center">{specialist.totalRecords}</td>
                    <td className="p-2 text-center">{specialist.totalExams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 