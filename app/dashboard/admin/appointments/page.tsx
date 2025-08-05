"use client";
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { appointmentService } from '@/services/appointment.service';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { specialistService } from '@/services/specialist.service';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { User } from '@/types/auth';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  UserCheck, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  Search,
  AlertCircle
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: '#F59E0B' },
  { value: 'confirmada', label: 'Confirmada', color: '#10B981' },
  { value: 'completada', label: 'Completada', color: '#3B82F6' },
  { value: 'cancelada', label: 'Cancelada', color: '#EF4444' },
];

const AdminAppointmentsPage = () => {
  const [tenantId, setTenantId] = useState<string | number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id' | 'patient' | 'specialist' | 'tenant_id'> & { notes?: string; time?: string }>({
    patient_id: 0,
    specialist_id: 0,
    date: '',
    time: '09:00',
    reason: '',
    status: 'pendiente' as Appointment['status'],
    notes: undefined,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [patients, setPatients] = useState<User[]>([]);
  const [specialists, setSpecialists] = useState<User[]>([]);
  const [editingPatientId, setEditingPatientId] = useState<string>('');
  const [editingSpecialistId, setEditingSpecialistId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Estados para el modal de edición
  const [editAvailableSlots, setEditAvailableSlots] = useState<string[]>([]);
  const [editLoadingSlots, setEditLoadingSlots] = useState(false);
  const [editAvailabilityError, setEditAvailabilityError] = useState<string | null>(null);

  const fetchAppointments = async (tenantId: string | number) => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getAppointmentsByTenant(tenantId);
      setAppointments(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error al obtener las citas');
      }
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientsAndSpecialists = async (tenantId: string | number) => {
    try {
      const users = await userService.getUsersByTenant(tenantId);
      setPatients(users.filter((u: User) => u.role === 'Paciente'));
      setSpecialists(users.filter((u: User) => u.role === 'Especialista'));
    } catch {
      setPatients([]);
      setSpecialists([]);
    }
  };

  // Obtener slots disponibles cuando se selecciona especialista y fecha
  const fetchAvailableSlots = async (specialistId: number, date: string) => {
    if (!specialistId || !date || !tenantId) return;
    
    setLoadingSlots(true);
    setAvailabilityError(null);
    try {
      const response = await specialistService.getAvailableSlots(tenantId, specialistId, date);
      setAvailableSlots(response.availableSlots);
      
      if (response.availableSlots.length === 0) {
        setAvailabilityError('El especialista no trabaja este día o no hay horarios disponibles');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailabilityError('Error al cargar horarios disponibles');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchEditAvailableSlots = async (specialistId: number, date: string) => {
    if (!specialistId || !date || !tenantId) return;
    
    setEditLoadingSlots(true);
    setEditAvailabilityError(null);
    try {
      const response = await specialistService.getAvailableSlots(tenantId, specialistId, date);
      setEditAvailableSlots(response.availableSlots);
      
      if (response.availableSlots.length === 0) {
        setEditAvailabilityError('El especialista no trabaja este día o no hay horarios disponibles');
      }
    } catch (error) {
      console.error('Error fetching edit available slots:', error);
      setEditAvailabilityError('Error al cargar horarios disponibles');
      setEditAvailableSlots([]);
    } finally {
      setEditLoadingSlots(false);
    }
  };

  useEffect(() => {
    const getTenantId = async () => {
      setIsLoading(true);
      try {
        const user = await authService.fetchUserData();
        setTenantId(user.tenant_id ?? null);
        if (user.tenant_id) {
          await fetchAppointments(user.tenant_id);
          await fetchPatientsAndSpecialists(user.tenant_id);
        }
      } catch {
        setError('No se pudo obtener el tenant');
      } finally {
        setIsLoading(false);
      }
    };
    void getTenantId();
  }, []);

  // Cargar horarios disponibles cuando cambie la fecha o especialista en creación
  useEffect(() => {
    if (newAppointment.specialist_id && newAppointment.date) {
      fetchAvailableSlots(newAppointment.specialist_id, newAppointment.date);
    }
  }, [newAppointment.specialist_id, newAppointment.date]);

  // Cargar horarios disponibles cuando cambie la fecha o especialista en edición
  useEffect(() => {
    if (editingAppointment?.specialist_id && editingAppointment?.date) {
      fetchEditAvailableSlots(editingAppointment.specialist_id, editingAppointment.date);
    }
  }, [editingAppointment?.specialist_id, editingAppointment?.date]);

  // Convertir citas a formato de FullCalendar
  const calendarEvents = appointments.map(appointment => {
    const status = STATUS_OPTIONS.find(s => s.value === appointment.status);
    const patientName = appointment.appointmentPatient?.username || `Paciente ${appointment.patient_id}`;
    const specialistName = appointment.appointmentSpecialist?.username || `Especialista ${appointment.specialist_id}`;
    const eventColor = status?.color || '#6B7280';
    
    return {
      id: appointment.id.toString(),
      title: `${patientName} - ${specialistName}`,
      date: appointment.date,
      backgroundColor: eventColor,
      borderColor: eventColor,
      textColor: '#FFFFFF',
      classNames: ['custom-event'],
      'data-status': appointment.status,
      extendedProps: {
        reason: appointment.reason,
        status: appointment.status,
        patient: appointment.appointmentPatient,
        specialist: appointment.appointmentSpecialist,
        notes: appointment.notes
      }
    };
  });

  // Filtrar eventos por especialista
  const filteredEvents = selectedSpecialist === 'all' 
    ? calendarEvents 
    : calendarEvents.filter(event => {
        const appointment = appointments.find(a => a.id.toString() === event.id);
        return appointment?.specialist_id.toString() === selectedSpecialist;
      });

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    
    // Verificar disponibilidad antes de crear la cita
    if (newAppointment.specialist_id && newAppointment.date && newAppointment.time) {
      try {
        const availability = await specialistService.checkSpecialistAvailability(
          tenantId, 
          newAppointment.specialist_id, 
          newAppointment.date, 
          newAppointment.time
        );
        
        if (!availability.available) {
          toast.error(`No disponible: ${availability.reason}`);
          return;
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error('Error al verificar disponibilidad');
        }
        return;
      }
    }
    
    setCreating(true);
    try {
      const appointmentPayload = {
        patient_id: newAppointment.patient_id,
        specialist_id: newAppointment.specialist_id,
        date: `${newAppointment.date}T${newAppointment.time || '09:00'}:00`,
        reason: newAppointment.reason,
        status: newAppointment.status,
        ...(newAppointment.notes ? { notes: newAppointment.notes } : {}),
      };
      await appointmentService.createAppointment(appointmentPayload);
      toast.success('Cita creada exitosamente');
      setShowCreateModal(false);
      setNewAppointment({ patient_id: 0, specialist_id: 0, date: '', time: '09:00', reason: '', status: 'pendiente', notes: undefined });
      await fetchAppointments(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al crear la cita');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDateClick = (arg: any) => {
    const clickedDate = new Date(arg.dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // No permitir fechas pasadas
    if (clickedDate < today) {
      toast.error('No se pueden crear citas en fechas pasadas');
      return;
    }
    
    setSelectedDate(arg.dateStr);
    setNewAppointment(prev => ({ 
      ...prev, 
      date: arg.dateStr,
      time: '09:00' // Reset time when selecting new date
    }));
    setShowCreateModal(true);
  };

  const handleEventClick = (arg: any) => {
    const appointment = appointments.find(a => a.id.toString() === arg.event.id);
    if (appointment) {
      setDetailAppointment(appointment);
      setShowDetailModal(true);
    }
  };

  const openEditModal = async (appointment: Appointment) => {
    let date = '';
    let time = '09:00';
    if (appointment.date) {
      const appointmentDate = new Date(appointment.date);
      date = appointmentDate.toISOString().slice(0, 10);
      // Extraer la hora UTC correctamente
      const hours = String(appointmentDate.getUTCHours()).padStart(2, '0');
      const minutes = String(appointmentDate.getUTCMinutes()).padStart(2, '0');
      time = `${hours}:${minutes}`;
    }
    
    setEditingAppointment({
      ...appointment,
      date: date || appointment.date || '',
      time: time,
      reason: appointment.reason || '',
    });
    setEditingPatientId(String(appointment.patient_id));
    setEditingSpecialistId(String(appointment.specialist_id));
    setShowEditModal(true);
    
    // Cargar horarios disponibles para la fecha y especialista
    if (date && appointment.specialist_id) {
      await fetchEditAvailableSlots(appointment.specialist_id, date);
    }
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment || !tenantId) return;

    // Validar disponibilidad antes de actualizar la cita
    if (editingAppointment.specialist_id && editingAppointment.date && editingAppointment.time) {
      try {
        const availability = await specialistService.checkSpecialistAvailability(
          tenantId, 
          editingAppointment.specialist_id, 
          editingAppointment.date, 
          editingAppointment.time
        );
        
        if (!availability.available) {
          toast.error(`No disponible: ${availability.reason}`);
          return;
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error('Error al verificar disponibilidad');
        }
        return;
      }
    }

    setUpdating(true);
    try {
      const appointmentPayload = {
        patient_id: editingAppointment.patient_id,
        specialist_id: editingAppointment.specialist_id,
        date: `${editingAppointment.date}T${editingAppointment.time || '09:00'}:00`,
        reason: editingAppointment.reason,
        status: editingAppointment.status,
        ...(editingAppointment.notes ? { notes: editingAppointment.notes } : {}),
      };
      await appointmentService.updateAppointment(editingAppointment.id, appointmentPayload);
      toast.success('Cita actualizada exitosamente');
      setShowEditModal(false);
      setEditingAppointment(null);
      await fetchAppointments(tenantId!);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al actualizar la cita');
      }
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    setDeleting(true);
    try {
      await appointmentService.deleteAppointment(appointmentToDelete.id);
      toast.success('Cita eliminada exitosamente');
      setAppointmentToDelete(null);
      await fetchAppointments(tenantId!);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al eliminar la cita');
      }
    } finally {
      setDeleting(false);
    }
  };

  const openDetailModal = async (appointment: Appointment) => {
    setDetailAppointment(appointment);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.color || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.label || status;
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando citas...</p>
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
        heading="Gestión de Citas"
        text="Administra las citas médicas del centro"
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nueva Cita</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </DashboardHeader>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar citas por paciente o especialista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="w-full sm:w-48 flex-shrink-0">
            <select
              value={selectedSpecialist}
              onChange={(e) => setSelectedSpecialist(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <option value="all">Todos los especialistas</option>
              {specialists.map(specialist => (
                <option key={specialist.id} value={specialist.id}>
                  {specialist.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Calendario */}
      <Card className="p-2 sm:p-4">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Calendario de Citas
          </CardTitle>
          <CardDescription className="text-sm">
            Haz clic en una fecha para crear una nueva cita o en una cita existente para ver detalles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="calendar-container overflow-x-auto">
            <style jsx>{`
              .calendar-container :global(.fc-event) {
                border: none !important;
                box-shadow: none !important;
              }
              
              .calendar-container :global(.fc-daygrid-event) {
                border: none !important;
                box-shadow: none !important;
              }
              
              .calendar-container :global(.fc-event-main) {
                border: none !important;
              }
              
              .calendar-container :global(.fc-timegrid-event) {
                border: none !important;
                box-shadow: none !important;
              }
              
              .calendar-container :global(.fc-list-event) {
                border: none !important;
                box-shadow: none !important;
              }
              
              .calendar-container :global(.fc-event-main-frame) {
                border: none !important;
              }
              
              .calendar-container :global(.fc-event-main-body) {
                border: none !important;
              }
              
              @media (max-width: 768px) {
                .calendar-container :global(.fc-event) {
                  border: none !important;
                  box-shadow: none !important;
                }
                .calendar-container :global(.fc-daygrid-event) {
                  border: none !important;
                  box-shadow: none !important;
                }
                .calendar-container :global(.fc-event-main) {
                  border: none !important;
                }
              }
              
              @media (max-width: 480px) {
                .calendar-container :global(.fc-event) {
                  border: none !important;
                  box-shadow: none !important;
                }
                .calendar-container :global(.fc-daygrid-event) {
                  border: none !important;
                  box-shadow: none !important;
                }
              }
            `}</style>
            <div className="min-w-[280px] sm:min-w-[320px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: window.innerWidth < 768 ? 'prev,next' : 'prev,next today',
                  center: 'title',
                  right: window.innerWidth < 768 ? 'dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={filteredEvents}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                height="auto"
                locale="es"
                timeZone="UTC"
                buttonText={{
                  today: 'Hoy',
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día'
                }}
                moreLinkClick="popover"
                selectable={true}
                selectMirror={true}
                weekends={true}
                editable={false}
                droppable={false}
                views={{
                  dayGridMonth: {
                    titleFormat: { year: 'numeric', month: 'long' }
                  },
                  timeGridWeek: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                  },
                  timeGridDay: {
                    titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
                  }
                }}
                aspectRatio={window.innerWidth < 768 ? 1.2 : 1.35}
                windowResizeDelay={100}
                handleWindowResize={true}
                dayMaxEvents={window.innerWidth < 768 ? 2 : true}
                eventDisplay={window.innerWidth < 768 ? "list-item" : "block"}
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
          </div>
        </CardContent>
      </Card>

      {/* Leyenda de Estados */}
      <Card className="p-2 sm:p-4">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Estados de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {STATUS_OPTIONS.map(status => (
              <div key={status.value} className="flex items-center gap-1 sm:gap-2">
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                  style={{ backgroundColor: status.color }}
                ></div>
                <span className="text-xs sm:text-sm text-gray-600">{status.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Creación */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl">
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Crear Nueva Cita
            </DialogTitle>
            <DialogDescription className="text-sm">
              Ingresa la información de la nueva cita médica.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={newAppointment.date}
                  onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora *</Label>
                <select
                  id="time"
                  required
                  value={newAppointment.time}
                  onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loadingSlots || availableSlots.length === 0}
                >
                  {availableSlots.length > 0 ? (
                    availableSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))
                  ) : (
                    <option value="">No hay horarios disponibles</option>
                  )}
                </select>
                {loadingSlots && (
                  <div className="text-xs text-blue-500 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-1"></div>
                    Cargando horarios disponibles...
                  </div>
                )}
                {availabilityError && (
                  <div className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {availabilityError}
                  </div>
                )}
                {availableSlots.length > 0 && !loadingSlots && (
                  <div className="text-xs text-green-500">
                    ✓ {availableSlots.length} horario(s) disponible(s)
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <select
                  id="status"
                  required
                  value={newAppointment.status}
                  onChange={e => setNewAppointment({ ...newAppointment, status: e.target.value as Appointment['status'] })}
                  className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Paciente *</Label>
                <select
                  id="patient"
                  required
                  value={newAppointment.patient_id}
                  onChange={e => setNewAppointment({ ...newAppointment, patient_id: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialist">Especialista *</Label>
                <select
                  id="specialist"
                  required
                  value={newAppointment.specialist_id}
                  onChange={e => setNewAppointment({ ...newAppointment, specialist_id: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <option value="">Seleccionar especialista</option>
                  {specialists.map(specialist => (
                    <option key={specialist.id} value={specialist.id}>
                      {specialist.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de la cita *</Label>
              <Input
                id="reason"
                type="text"
                required
                value={newAppointment.reason}
                onChange={e => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={newAppointment.notes || ''}
                onChange={e => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                placeholder="Notas adicionales sobre la cita..."
                className="w-full min-h-[80px]"
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={creating} className="w-full sm:w-auto">
                {creating ? 'Creando...' : 'Crear Cita'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edición */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl">
              <Edit className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Editar Cita
            </DialogTitle>
            <DialogDescription className="text-sm">
              Modifica la información de la cita médica.
            </DialogDescription>
          </DialogHeader>
          {editingAppointment && (
            <form onSubmit={handleEditAppointment} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Fecha *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={editingAppointment.date}
                    onChange={e => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Hora *</Label>
                  <select
                    id="edit-time"
                    required
                    value={editingAppointment.time || '09:00'}
                    onChange={e => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={editLoadingSlots || (editAvailableSlots.length === 0 && !editLoadingSlots)}
                  >
                    {editLoadingSlots ? (
                      <option value="">Cargando horarios...</option>
                    ) : editAvailableSlots.length > 0 ? (
                      editAvailableSlots.map(slot => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))
                    ) : (
                      // Horarios por defecto si no hay disponibles
                      [
                        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
                        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
                      ].map(slot => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))
                    )}
                  </select>
                  {editLoadingSlots && (
                    <div className="text-xs text-blue-500 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-1"></div>
                      Cargando horarios disponibles...
                    </div>
                  )}
                  {editAvailabilityError && (
                    <div className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {editAvailabilityError}
                    </div>
                  )}
                  {editAvailableSlots.length > 0 && !editLoadingSlots && (
                    <div className="text-xs text-green-500">
                      ✓ {editAvailableSlots.length} horario(s) disponible(s)
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado *</Label>
                  <select
                    id="edit-status"
                    required
                    value={editingAppointment.status}
                    onChange={e => setEditingAppointment({ ...editingAppointment, status: e.target.value as Appointment['status'] })}
                    className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-patient">Paciente *</Label>
                  <select
                    id="edit-patient"
                    required
                    value={editingPatientId}
                    onChange={e => {
                      setEditingPatientId(e.target.value);
                      setEditingAppointment({ ...editingAppointment, patient_id: parseInt(e.target.value) });
                    }}
                    className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialist">Especialista *</Label>
                  <select
                    id="edit-specialist"
                    required
                    value={editingSpecialistId}
                    onChange={e => {
                      setEditingSpecialistId(e.target.value);
                      setEditingAppointment({ ...editingAppointment, specialist_id: parseInt(e.target.value) });
                    }}
                    className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="">Seleccionar especialista</option>
                    {specialists.map(specialist => (
                      <option key={specialist.id} value={specialist.id}>
                        {specialist.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reason">Motivo de la cita *</Label>
                <Input
                  id="edit-reason"
                  type="text"
                  required
                  value={editingAppointment.reason}
                  onChange={e => setEditingAppointment({ ...editingAppointment, reason: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas adicionales</Label>
                <Textarea
                  id="edit-notes"
                  value={editingAppointment.notes || ''}
                  onChange={e => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                  placeholder="Notas adicionales sobre la cita..."
                  className="w-full min-h-[80px]"
                />
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={updating} className="w-full sm:w-auto">
                  {updating ? 'Actualizando...' : 'Actualizar Cita'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl">
              <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Detalles de la Cita
            </DialogTitle>
          </DialogHeader>
          {detailAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(detailAppointment.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(detailAppointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getStatusColor(detailAppointment.status) }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {getStatusLabel(detailAppointment.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <p className="text-sm text-gray-600 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {detailAppointment.appointmentPatient?.username || detailAppointment.patient?.username || `Paciente ${detailAppointment.patient_id}`}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Especialista</Label>
                  <p className="text-sm text-gray-600 flex items-center">
                    <UserCheck className="h-4 w-4 mr-1" />
                    {detailAppointment.appointmentSpecialist?.username || detailAppointment.specialist?.username || `Especialista ${detailAppointment.specialist_id}`}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Motivo</Label>
                <p className="text-sm text-gray-600">{detailAppointment.reason}</p>
              </div>
              {detailAppointment.notes && (
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <p className="text-sm text-gray-600">{detailAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDetailModal(false);
                if (detailAppointment) {
                  openEditModal(detailAppointment);
                }
              }}
              className="w-full sm:w-auto"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setShowDetailModal(false);
                if (detailAppointment) {
                  openDeleteModal(detailAppointment);
                }
              }}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminación */}
      <Dialog open={!!appointmentToDelete} onOpenChange={() => setAppointmentToDelete(null)}>
        <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl text-red-600">
              <Trash2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Eliminar Cita
            </DialogTitle>
            <DialogDescription className="text-sm">
              ¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button variant="outline" onClick={() => setAppointmentToDelete(null)} disabled={deleting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAppointment} disabled={deleting} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default AdminAppointmentsPage; 