'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { appointmentService } from '@/services/appointment.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { Appointment } from '@/types/appointment';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: '#F59E0B' },
  { value: 'confirmada', label: 'Confirmada', color: '#10B981' },
  { value: 'completada', label: 'Completada', color: '#3B82F6' },
  { value: 'cancelada', label: 'Cancelada', color: '#EF4444' },
];

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getPatientAppointments();
      console.log('📅 Citas cargadas en el componente:', data);
      console.log('📅 Número de citas:', data.length);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return '#10b981';
      case 'cancelada':
        return '#ef4444';
      case 'pendiente':
        return '#f59e0b';
      case 'completada':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = appointment.appointmentSpecialist?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointmentSpecialist?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  console.log('🔍 Citas filtradas:', filteredAppointments.length);
  console.log('🔍 Filtro actual:', filter);
  console.log('🔍 Término de búsqueda:', searchTerm);

  const calendarEvents = filteredAppointments.map(appointment => {
    const status = STATUS_OPTIONS.find(s => s.value === appointment.status);
    const specialistName = appointment.appointmentSpecialist?.username || 'Especialista';
    const eventColor = status?.color || '#6B7280';
    
    return {
      id: appointment.id.toString(),
      title: `${specialistName} - ${appointment.status}`,
      start: appointment.date,
      end: new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000), // 1 hora
      backgroundColor: eventColor,
      textColor: '#FFFFFF',
      classNames: ['custom-event'],
      'data-status': appointment.status,
      extendedProps: {
        status: appointment.status,
        specialist: appointment.appointmentSpecialist?.username,
        notes: appointment.notes
      }
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelada':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pendiente':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
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

  const showAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

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
        text="Gestiona y visualiza todas tus citas médicas"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {view === 'calendar' ? (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Vista Lista
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Vista Calendario
              </>
            )}
          </Button>
        </div>
      </DashboardHeader>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por especialista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las citas</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="confirmada">Confirmadas</SelectItem>
                  <SelectItem value="completada">Completadas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {view === 'calendar' ? (
        /* Vista Calendario */
        <Card>
          <CardContent className="p-4">
            <div className="calendar-responsive">
              <style jsx>{`
                .calendar-responsive {
                  min-width: 300px;
                }
                
                .calendar-responsive :global(.fc-event),
                .calendar-responsive :global(.fc-daygrid-event),
                .calendar-responsive :global(.fc-timegrid-event),
                .calendar-responsive :global(.fc-list-event),
                .calendar-responsive :global(.fc-event-main),
                .calendar-responsive :global(.fc-event-main-frame),
                .calendar-responsive :global(.fc-event-main-body),
                .calendar-responsive :global(.fc-event-title),
                .calendar-responsive :global(.fc-event-time),
                .calendar-responsive :global(.fc-event-dot),
                .calendar-responsive :global(.fc-event-bg),
                .calendar-responsive :global(.fc-event-fg),
                .calendar-responsive :global(.fc-event-inner),
                .calendar-responsive :global(.fc-event-outer),
                .calendar-responsive :global(.fc-event-selected),
                .calendar-responsive :global(.fc-event-selected .fc-event-main),
                .calendar-responsive :global(.fc-event-selected .fc-event-main-frame),
                .calendar-responsive :global(.fc-event-selected .fc-event-main-body),
                .calendar-responsive :global(.fc-daygrid-event-dot),
                .calendar-responsive :global(.fc-daygrid-event-selected),
                .calendar-responsive :global(.fc-daygrid-event-selected .fc-event-main),
                .calendar-responsive :global(.fc-daygrid-event-selected .fc-event-main-frame),
                .calendar-responsive :global(.fc-daygrid-event-selected .fc-event-main-body),
                .calendar-responsive :global(.fc-timegrid-event-selected),
                .calendar-responsive :global(.fc-timegrid-event-selected .fc-event-main),
                .calendar-responsive :global(.fc-timegrid-event-selected .fc-event-main-frame),
                .calendar-responsive :global(.fc-timegrid-event-selected .fc-event-main-body) {
                  border: none !important;
                  box-shadow: none !important;
                  outline: none !important;
                  border-radius: 3px !important;
                }
                
                .calendar-responsive :global(.fc-daygrid-event) {
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
                
                .calendar-responsive :global(.fc-event:hover) {
                  opacity: 0.8;
                }
                
                @media (max-width: 768px) {
                  .calendar-responsive :global(.fc) {
                    min-width: 280px;
                  }
                  .calendar-responsive :global(.fc-event) {
                    font-size: 10px;
                    padding: 1px 2px;
                  }
                  .calendar-responsive :global(.fc-toolbar-title) {
                    font-size: 14px !important;
                  }
                  .calendar-responsive :global(.fc-button) {
                    font-size: 11px !important;
                    padding: 3px 6px !important;
                  }
                  .calendar-responsive :global(.fc-daygrid-day-number) {
                    font-size: 12px !important;
                  }
                  .calendar-responsive :global(.fc-col-header-cell) {
                    font-size: 11px !important;
                  }
                }
                @media (max-width: 480px) {
                  .calendar-responsive :global(.fc-toolbar) {
                    flex-direction: column;
                    gap: 8px;
                  }
                  .calendar-responsive :global(.fc-toolbar-chunk) {
                    display: flex;
                    justify-content: center;
                  }
                }
              `}</style>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={esLocale}
                events={calendarEvents}
                height="auto"
                eventDisplay="block"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
                slotMinTime="07:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelInterval="01:00"
                dayHeaderFormat={{ weekday: 'long' }}
                titleFormat={{ year: 'numeric', month: 'long' }}
                eventClick={(info) => {
                  const appointment = appointments.find(a => a.id.toString() === info.event.id);
                  if (appointment) {
                    showAppointmentDetails(appointment);
                  }
                }}
                eventContent={(arg) => {
                  const status = arg.event.extendedProps.status;
                  const statusOption = STATUS_OPTIONS.find(s => s.value === status);
                  const eventColor = statusOption?.color || '#6B7280';
                  
                  return {
                    html: `
                      <div style="
                        background-color: ${eventColor} !important;
                        border: none !important;
                        color: white !important;
                        padding: 2px 4px;
                        border-radius: 3px;
                        font-size: 10px;
                        line-height: 1.2;
                        margin: 1px;
                        display: block;
                        width: 100%;
                        box-sizing: border-box;
                      ">
                        ${arg.event.title}
                      </div>
                    `
                  };
                }}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Vista Lista */
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-lg">
                              {appointment.appointmentSpecialist?.username || `Especialista ${appointment.specialist_id}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {appointment.appointmentSpecialist?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {new Date(appointment.date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {new Date(appointment.date).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Notas:</p>
                              <p className="text-sm text-gray-600">{appointment.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showAppointmentDetails(appointment)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay citas encontradas
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filter !== 'all' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No tienes citas programadas en este momento'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'pendiente').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'confirmada').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'completada').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'cancelada').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalles de la cita */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalles de la Cita</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAppointment(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Especialista</h3>
                  <p className="text-gray-600">
                    Dr. {selectedAppointment.appointmentSpecialist?.username || 'No especificado'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedAppointment.appointmentSpecialist?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedAppointment.appointmentSpecialist?.specialty || 'Especialidad no especificada'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Estado</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedAppointment.status)}
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Fecha</h3>
                  <p className="text-gray-600">{formatDate(selectedAppointment.date)}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Hora</h3>
                  <p className="text-gray-600">{formatTime(selectedAppointment.date)}</p>
                </div>
              </div>
              
              {selectedAppointment.reason && (
                <div>
                  <h3 className="font-semibold text-gray-700">Motivo</h3>
                  <p className="text-gray-600">{selectedAppointment.reason}</p>
                </div>
              )}
              
              {selectedAppointment.notes && (
                <div>
                  <h3 className="font-semibold text-gray-700">Notas</h3>
                  <p className="text-gray-600">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
} 