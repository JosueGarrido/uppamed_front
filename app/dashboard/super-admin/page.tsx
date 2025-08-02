'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboardService, SuperAdminSummary, TenantActivity } from '@/services/dashboard.service';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  TrendingUp, 
  Activity,
  Plus,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState<SuperAdminSummary | null>(null);
  const [tenantActivity, setTenantActivity] = useState<TenantActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [summaryData, activityData] = await Promise.all([
          dashboardService.getSuperAdminSummary(),
          dashboardService.getTenantsActivity()
        ]);
        
        setSummary(summaryData);
        setTenantActivity(activityData);
        setLoading(false);
      } catch (error) {
        setError('Error al cargar los datos del dashboard');
        setLoading(false);
      }
    };

    if (user?.role === 'Super Admin') {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p>Cargando dashboard...</p>
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
        heading="Panel de Super Administrador"
        text="Gestión global de todos los centros médicos y usuarios"
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/dashboard/super-admin/tenants" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Building2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Gestionar Centros</span>
              <span className="sm:hidden">Centros</span>
            </Button>
          </Link>
          <Link href="/dashboard/super-admin/users" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Usuarios Globales</span>
              <span className="sm:hidden">Usuarios</span>
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* KPIs Principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Centros Médicos</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis?.totalTenants || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Total Usuarios</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis?.totalUsers || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-purple-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Especialistas</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis?.totalEspecialistas || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-orange-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Pacientes</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis?.totalPacientes || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-red-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Total Citas</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis?.totalCitas || 0}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actividad por Centro Médico */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">Actividad por Centro Médico</h2>
          <Link href="/dashboard/super-admin/tenants">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              Ver todos
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tenantActivity.slice(0, 6).map((tenant) => (
            <div key={tenant.tenantId} className="p-3 sm:p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">{tenant.tenantName}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-600">Usuarios:</span>
                  <span className="ml-1 font-medium">{tenant.users}</span>
                </div>
                <div>
                  <span className="text-gray-600">Especialistas:</span>
                  <span className="ml-1 font-medium">{tenant.especialistas}</span>
                </div>
                <div>
                  <span className="text-gray-600">Pacientes:</span>
                  <span className="ml-1 font-medium">{tenant.pacientes}</span>
                </div>
                <div>
                  <span className="text-gray-600">Citas:</span>
                  <span className="ml-1 font-medium">{tenant.citas}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Últimos Registros */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Últimos Centros</h3>
            <Link href="/dashboard/super-admin/tenants">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Ver todos
              </Button>
            </Link>
          </div>
          {summary?.ultimosTenants && summary.ultimosTenants.length > 0 ? (
            <div className="space-y-2">
              {summary.ultimosTenants.map((tenant) => (
                <div key={tenant.id} className="p-2 border rounded">
                  <p className="font-medium">{tenant.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay centros registrados</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Últimos Usuarios</h3>
            <Link href="/dashboard/super-admin/users">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Ver todos
              </Button>
            </Link>
          </div>
          {summary?.ultimosUsuarios && summary.ultimosUsuarios.length > 0 ? (
            <div className="space-y-2">
              {summary.ultimosUsuarios.map((user) => (
                <div key={user.id} className="p-2 border rounded">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-600">{user.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay usuarios registrados</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Últimas Citas</h3>
            <Link href="/appointments">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Ver todas
              </Button>
            </Link>
          </div>
          {summary?.ultimasCitas && summary.ultimasCitas.length > 0 ? (
            <div className="space-y-2">
              {summary.ultimasCitas.map((appointment) => (
                <div key={appointment.id} className="p-2 border rounded">
                  <p className="font-medium">Cita #{appointment.id}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay citas registradas</p>
          )}
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/super-admin/tenants">
            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Crear Centro</span>
              <span className="sm:hidden">Centro</span>
            </Button>
          </Link>
          <Link href="/dashboard/super-admin/users">
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Gestionar Usuarios</span>
              <span className="sm:hidden">Usuarios</span>
            </Button>
          </Link>
          <Link href="/dashboard/super-admin/tenants">
            <Button className="w-full" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ver Estadísticas</span>
              <span className="sm:hidden">Estadísticas</span>
            </Button>
          </Link>
          <Link href="/dashboard/super-admin/settings">
            <Button className="w-full" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Configuración</span>
              <span className="sm:hidden">Config</span>
            </Button>
          </Link>
        </div>
      </Card>
    </DashboardShell>
  );
} 