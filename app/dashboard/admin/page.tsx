'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboardService } from '@/services/dashboard.service';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
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
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { User } from '@/types/auth';
import { Appointment } from '@/types/appointment';

interface AdminSummary {
  kpis: {
    totalUsers: number;
    totalEspecialistas: number;
    totalPacientes: number;
    totalCitas: number;
  };
  ultimosUsuarios: User[];
  ultimosEspecialistas: User[];
  ultimosPacientes: User[];
  ultimasCitas: Appointment[];
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        const [allUsers, allCitas] = await Promise.all([
          userService.getUsersByTenant(userData.tenant_id),
          dashboardService.getAppointmentsForTenant(userData.tenant_id)
        ]);

        const especialistas = allUsers.filter((u: User) => u.role === 'Especialista');
        const pacientes = allUsers.filter((u: User) => u.role === 'Paciente');

        setSummary({
          kpis: {
            totalUsers: allUsers.length,
            totalEspecialistas: especialistas.length,
            totalPacientes: pacientes.length,
            totalCitas: allCitas.length
          },
          ultimosUsuarios: allUsers.slice(0, 5),
          ultimosEspecialistas: especialistas.slice(0, 5),
          ultimosPacientes: pacientes.slice(0, 5),
          ultimasCitas: allCitas.slice(0, 5)
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
  }, [user, isLoading]);

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
        heading="Panel de Administrador"
        text="Gestión de usuarios y citas del centro médico"
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/dashboard/admin/users" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Gestionar Usuarios</span>
              <span className="sm:hidden">Usuarios</span>
            </Button>
          </Link>
          <Link href="/dashboard/admin/appointments" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Gestionar Citas</span>
              <span className="sm:hidden">Citas</span>
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* KPIs Principales */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Total Usuarios</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis.totalUsers || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Especialistas</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis.totalEspecialistas || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-purple-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Pacientes</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis.totalPacientes || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-500 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Total Citas</h3>
              <div className="text-xl sm:text-2xl font-bold">{summary?.kpis.totalCitas || 0}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Últimos Registros */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Últimos Usuarios</h3>
            <Link href="/dashboard/admin/users">
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
            <h3 className="font-semibold text-sm sm:text-base">Últimos Especialistas</h3>
            <Link href="/dashboard/admin/specialists">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Ver todos
              </Button>
            </Link>
          </div>
          {summary?.ultimosEspecialistas && summary.ultimosEspecialistas.length > 0 ? (
            <div className="space-y-2">
              {summary.ultimosEspecialistas.map((especialista) => (
                <div key={especialista.id} className="p-2 border rounded">
                  <p className="font-medium">{especialista.username}</p>
                  <p className="text-sm text-gray-600">{especialista.specialty || especialista.area}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay especialistas registrados</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Últimos Pacientes</h3>
            <Link href="/dashboard/admin/patients">
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
      </div>

      {/* Últimas Citas */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">Últimas Citas</h2>
          <Link href="/dashboard/admin/appointments">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              Ver todas
            </Button>
          </Link>
        </div>
        {summary?.ultimasCitas && summary.ultimasCitas.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {summary.ultimasCitas.map((cita) => (
              <div key={cita.id} className="p-3 sm:p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Cita #{cita.id}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-600">Paciente:</span>
                    <span className="ml-1 font-medium">{cita.patient?.username || cita.patient_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Especialista:</span>
                    <span className="ml-1 font-medium">{cita.specialist?.username || cita.specialist_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <span className="ml-1 font-medium">{new Date(cita.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <span className="ml-1 font-medium">{cita.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay citas registradas</p>
        )}
      </Card>

      {/* Acciones Rápidas */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/admin/users/new">
            <Button className="w-full" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Crear Usuario</span>
              <span className="sm:hidden">Usuario</span>
            </Button>
          </Link>
          <Link href="/dashboard/admin/appointments/new">
            <Button className="w-full" variant="outline">
              <CalendarPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nueva Cita</span>
              <span className="sm:hidden">Cita</span>
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Gestionar Usuarios</span>
              <span className="sm:hidden">Usuarios</span>
            </Button>
          </Link>
          <Link href="/dashboard/admin/appointments">
            <Button className="w-full" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ver Citas</span>
              <span className="sm:hidden">Citas</span>
            </Button>
          </Link>
        </div>
      </Card>
    </DashboardShell>
  );
} 