'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { appointmentService } from '@/services/appointment.service';
import { useAuth } from '@/context/AuthContext';
import { Appointment } from '@/types/appointment';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  CalendarDays
} from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Redirigir especialistas al calendario
  useEffect(() => {
    if (user?.role === 'Especialista') {
      router.push('/dashboard/specialist/appointments');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.id && user?.role !== 'Especialista') {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let appointmentsData: Appointment[] = [];

      if (user?.role === 'Paciente') {
        appointmentsData = await appointmentService.getPatientAppointments();
      } else {
        // Para administradores, obtener todas las citas del tenant
        if (user?.tenant_id) {
          appointmentsData = await appointmentService.getAppointmentsByTenant(user.tenant_id);
        }
      }

      setAppointments(appointmentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Error al cargar las citas');
      setLoading(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pendiente':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'completada':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelada':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.appointmentPatient?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentSpecialist?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Mostrar mensaje de redirección para especialistas
  if (user?.role === 'Especialista') {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirigiendo al calendario...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando citas...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Mis Citas"
        text={`Gestiona tus citas médicas. Total: ${appointments.length} citas`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/appointments/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5 text-blue-600" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, especialista o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de citas */}
      <div className="grid gap-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Cita #{appointment.id}
                          </h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{formatTime(appointment.date)}</span>
                          </div>
                          {user?.role !== 'Paciente' && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              <span className="truncate">
                                {appointment.appointmentPatient?.username || `Paciente ${appointment.patient_id}`}
                              </span>
                            </div>
                          )}
                          {user?.role !== 'Especialista' && (
                            <div className="flex items-center">
                              <Stethoscope className="h-4 w-4 mr-2" />
                              <span className="truncate">
                                {appointment.appointmentSpecialist?.username || `Especialista ${appointment.specialist_id}`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {appointment.reason && (
                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Motivo:</strong> {appointment.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <div className="flex flex-col space-y-2">
                      <Link href={`/appointments/${appointment.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Button>
                      </Link>
                      <Link href={`/appointments/${appointment.id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron citas' : 'No hay citas programadas'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Las citas aparecerán aquí cuando sean programadas'
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