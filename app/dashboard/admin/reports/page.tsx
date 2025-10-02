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
  Pill,
  ChevronDown,
  ChevronUp
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
  const { user, isLoading: authLoading } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedArea, setSelectedArea] = useState('all');
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && user?.tenant_id) {
      const loadReportData = async () => {
        try {
          setLoading(true);
          setError(null);

          // Cargar todos los datos necesarios
          const [allUsers, allAppointments, allRecords, allExams] = await Promise.all([
            userService.getUsersByTenant(user.tenant_id!),
            appointmentService.getAppointmentsByTenant(user.tenant_id!),
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
          
          // Verificar si hay especialistas antes de usar reduce
          const mostRequested = specialistAppointmentCounts.length > 0 
            ? specialistAppointmentCounts.reduce((prev, current) => 
                prev.count > current.count ? prev : current
              )
            : { name: 'N/A', count: 0 };

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
          averageUtilization: specialistStats.length > 0 
            ? specialistStats.reduce((sum, s) => sum + s.utilizationRate, 0) / specialistStats.length 
            : 0,
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

      void loadReportData();
    } else if (!authLoading && !user) {
      setError('Usuario no autenticado');
      setLoading(false);
    }
  }, [authLoading, user, timeRange]);

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

  const toggleAreaExpansion = (areaName: string) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(areaName)) {
      newExpanded.delete(areaName);
    } else {
      newExpanded.add(areaName);
    }
    setExpandedAreas(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'Administrador') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="mt-2 text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Generando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-600">No hay datos disponibles</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Análisis detallado del rendimiento de especialistas y ocupación por áreas médicas
          </p>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Especialistas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{reportData.overallStats.totalSpecialists}</div>
            <p className="text-xs text-muted-foreground">
              Activos en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{reportData.overallStats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilización Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {reportData.overallStats.averageUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tasa de ocupación general
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Más Solicitada</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold">{reportData.overallStats.mostRequestedArea}</div>
            <p className="text-xs text-muted-foreground">
              Mayor demanda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Especialistas */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Star className="h-5 w-5" />
            Top 5 Especialistas Más Solicitados
          </CardTitle>
          <CardDescription>
            Especialistas con mayor tasa de utilización y mejor rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {reportData.topSpecialists.map((specialist, index) => (
              <div key={specialist.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-full font-bold text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <h3 className="font-semibold text-sm sm:text-base">{specialist.username}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{specialist.specialty}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="default" className="text-xs">{specialist.totalPatients} pacientes</Badge>
                      <Badge variant="default" className="text-xs">{specialist.totalAppointments} citas</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right mt-3 sm:mt-0 w-full sm:w-auto">
                  <div className={`text-lg sm:text-xl font-bold ${getUtilizationColor(specialist.utilizationRate)}`}>
                    {specialist.utilizationRate.toFixed(1)}%
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Utilización</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                    <span className="text-xs sm:text-sm">{specialist.averageRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis por Áreas */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BarChart3 className="h-5 w-5" />
            Análisis por Áreas Médicas
          </CardTitle>
          <CardDescription>
            Distribución de citas y ocupación por especialidad médica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {reportData.areas.map((area) => {
              const IconComponent = area.icon;
              const isExpanded = expandedAreas.has(area.name);
              
              return (
                <div key={area.name} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                      <h3 className="font-semibold text-sm sm:text-base">{area.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAreaExpansion(area.name)}
                      className="p-1 h-auto"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Citas:</span>
                      <span className="font-semibold text-sm sm:text-base">{area.totalAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Especialistas:</span>
                      <span className="font-semibold text-sm sm:text-base">{area.totalSpecialists}</span>
                    </div>
                    
                    {isExpanded && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Promedio/Especialista:</span>
                          <span className="font-semibold text-sm sm:text-base">{area.averageUtilization.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Crecimiento:</span>
                          <div className="flex items-center gap-1">
                            {getGrowthIcon(area.growthRate)}
                            <span className={`text-xs sm:text-sm font-semibold ${area.growthRate > 0 ? 'text-green-600' : area.growthRate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              {area.growthRate > 0 ? '+' : ''}{area.growthRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-600">
                            Más solicitado: <span className="font-medium">{area.mostRequestedSpecialist}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Especialistas */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <UserCheck className="h-5 w-5" />
            Detalle Completo de Especialistas
          </CardTitle>
          <CardDescription>
            Estadísticas detalladas de cada especialista
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Vista de escritorio */}
              <table className="w-full hidden lg:table">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium">Especialista</th>
                    <th className="text-left p-2 text-sm font-medium">Especialidad</th>
                    <th className="text-center p-2 text-sm font-medium">Citas Totales</th>
                    <th className="text-center p-2 text-sm font-medium">Completadas</th>
                    <th className="text-center p-2 text-sm font-medium">Pendientes</th>
                    <th className="text-center p-2 text-sm font-medium">Pacientes</th>
                    <th className="text-center p-2 text-sm font-medium">Utilización</th>
                    <th className="text-center p-2 text-sm font-medium">Registros</th>
                    <th className="text-center p-2 text-sm font-medium">Exámenes</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.specialists.map((specialist) => (
                    <tr key={specialist.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium text-sm">{specialist.username}</td>
                      <td className="p-2 text-sm text-gray-600">{specialist.specialty}</td>
                      <td className="p-2 text-center text-sm">{specialist.totalAppointments}</td>
                      <td className="p-2 text-center">
                        <Badge variant="success" className="text-xs">{specialist.completedAppointments}</Badge>
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant="warning" className="text-xs">{specialist.pendingAppointments}</Badge>
                      </td>
                      <td className="p-2 text-center text-sm">{specialist.totalPatients}</td>
                      <td className="p-2 text-center">
                        <span className={`font-semibold text-sm ${getUtilizationColor(specialist.utilizationRate)}`}>
                          {specialist.utilizationRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-2 text-center text-sm">{specialist.totalRecords}</td>
                      <td className="p-2 text-center text-sm">{specialist.totalExams}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Vista móvil/tablet */}
              <div className="lg:hidden space-y-4">
                {reportData.specialists.map((specialist) => (
                  <div key={specialist.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{specialist.username}</h3>
                        <p className="text-xs text-gray-600">{specialist.specialty}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-sm ${getUtilizationColor(specialist.utilizationRate)}`}>
                          {specialist.utilizationRate.toFixed(1)}%
                        </span>
                        <p className="text-xs text-gray-600">Utilización</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Citas Totales:</span>
                        <span className="font-medium">{specialist.totalAppointments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completadas:</span>
                        <Badge variant="success" className="text-xs">{specialist.completedAppointments}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pendientes:</span>
                        <Badge variant="warning" className="text-xs">{specialist.pendingAppointments}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pacientes:</span>
                        <span className="font-medium">{specialist.totalPatients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registros:</span>
                        <span className="font-medium">{specialist.totalRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exámenes:</span>
                        <span className="font-medium">{specialist.totalExams}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 