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
import { useAuth } from '@/context/AuthContext';

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: '#F59E0B' },
  { value: 'confirmada', label: 'Confirmada', color: '#10B981' },
  { value: 'completada', label: 'Completada', color: '#3B82F6' },
  { value: 'cancelada', label: 'Cancelada', color: '#EF4444' },
];

const SpecialistAppointmentsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Estados para el modal de edición
  const [editAvailableSlots, setEditAvailableSlots] = useState<string[]>([]);
  const [editLoadingSlots, setEditLoadingSlots] = useState(false);
  const [editAvailabilityError, setEditAvailabilityError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getSpecialistAppointments();
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

  const fetchPatients = async (tenantId: string | number) => {
    try {
      const users = await userService.getUsersByTenant(tenantId);
      setPatients(users.filter((u: User) => u.role === 'Paciente'));
    } catch {
      setPatients([]);
    }
  };

  // Obtener slots disponibles cuando se selecciona fecha
  const fetchAvailableSlots = async (date: string) => {
    if (!date || !tenantId || !user?.id) return;
    
    setLoadingSlots(true);
    setAvailabilityError(null);
    try {
      const response = await specialistService.getAvailableSlots(tenantId, user.id, date);
      setAvailableSlots(response.availableSlots);
      
      if (response.availableSlots.length === 0) {
        setAvailabilityError('No hay horarios disponibles para este día');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailabilityError('Error al cargar horarios disponibles');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchEditAvailableSlots = async (date: string) => {
    if (!date || !tenantId || !user?.id) return;
    
    setEditLoadingSlots(true);
    setEditAvailabilityError(null);
    try {
      const response = await specialistService.getAvailableSlots(tenantId, user.id, date);
      setEditAvailableSlots(response.availableSlots);
      
      if (response.availableSlots.length === 0) {
        setEditAvailabilityError('No hay horarios disponibles para este día');
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
        const userData = await authService.fetchUserData();
        setTenantId(userData.tenant_id ?? null);
        if (userData.tenant_id) {
          await fetchAppointments();
          await fetchPatients(userData.tenant_id);
        }
      } catch {
        setError('No se pudo obtener el tenant');
      } finally {
        setIsLoading(false);
      }
    };
    void getTenantId();
  }, []);

  // Cargar horarios disponibles cuando cambie la fecha en creación
  useEffect(() => {
    if (newAppointment.date) {
      fetchAvailableSlots(newAppointment.date);
    }
  }, [newAppointment.date]);

  // Cargar horarios disponibles cuando cambie la fecha en edición
  useEffect(() => {
    if (editingAppointment?.date) {
      fetchEditAvailableSlots(editingAppointment.date);
    }
  }, [editingAppointment?.date]);

  // Convertir citas a formato de FullCalendar
  const calendarEvents = appointments.map(appointment => {
    const status = STATUS_OPTIONS.find(s => s.value === appointment.status);
    const patientName = appointment.appointmentPatient?.username || `Paciente ${appointment.patient_id}`;
    const eventColor = status?.color || '#6B7280';
    
    return {
      id: appointment.id.toString(),
      title: `${patientName} - ${appointment.reason || 'Sin motivo'}`,
      start: appointment.date,
      end: appointment.date,
      backgroundColor: eventColor,
      textColor: '#FFFFFF',
      classNames: ['custom-event'],
      'data-status': appointment.status,
      extendedProps: {
        status: appointment.status,
        patient: appointment.appointmentPatient,
        reason: appointment.reason,
        notes: appointment.notes
      }
    };
  });

  // Filtrar eventos por término de búsqueda
  const filteredEvents = calendarEvents.filter(event => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.extendedProps.patient?.username?.toLowerCase().includes(searchLower) ||
      event.extendedProps.reason?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !tenantId) return;

    // Validar disponibilidad antes de crear la cita
    if (newAppointment.date && newAppointment.time) {
      try {
        const availability = await specialistService.checkSpecialistAvailability(
          tenantId, 
          user.id, 
          newAppointment.date, 
          newAppointment.time
        );
        
        if (!availability.available) {
          toast.error(`No disponible: ${availability.reason}`);
          return;
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        toast.error('Error al verificar disponibilidad');
        return;
      }
    }

    setCreating(true);
    try {
      const appointmentData = {
        ...newAppointment,
        specialist_id: user.id,
        tenant_id: Number(tenantId),
        date: `${newAppointment.date}T${newAppointment.time}:00`
      };

      await appointmentService.createAppointment(appointmentData);
      toast.success('Cita creada exitosamente');
      setShowCreateModal(false);
      setNewAppointment({
        patient_id: 0,
        specialist_id: 0,
        date: '',
        time: '09:00',
        reason: '',
        status: 'pendiente' as Appointment['status'],
        notes: undefined,
      });
      await fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear la cita');
    } finally {
      setCreating(false);
    }
  };

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setNewAppointment(prev => ({ ...prev, date: arg.dateStr }));
    setShowCreateModal(true);
  };

  const handleEventClick = (arg: any) => {
    const appointment = appointments.find(app => app.id.toString() === arg.event.id);
    if (appointment) {
      setDetailAppointment(appointment);
      setShowDetailModal(true);
    }
  };

  const openEditModal = async (appointment: Appointment) => {
    // Convertir la fecha UTC a local para el modal de edición
    let localAppointment = { ...appointment };
    if (appointment.date) {
      const utcDate = new Date(appointment.date);
      const year = utcDate.getUTCFullYear();
      const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(utcDate.getUTCDate()).padStart(2, '0');
      const hours = String(utcDate.getUTCHours()).padStart(2, '0');
      const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');
      localAppointment.date = `${year}-${month}-${day}T${hours}:${minutes}:00`;
    }
    setEditingAppointment(localAppointment);
    setShowEditModal(true);
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment || !tenantId || !user?.id) return;

    // Validar disponibilidad antes de actualizar la cita
    const appointmentDate = editingAppointment.date.split('T')[0];
    const appointmentTime = editingAppointment.date.split('T')[1]?.split(':').slice(0, 2).join(':');
    
    if (appointmentDate && appointmentTime) {
      try {
        const availability = await specialistService.checkSpecialistAvailability(
          tenantId, 
          user.id, 
          appointmentDate, 
          appointmentTime
        );
        
        if (!availability.available) {
          toast.error(`No disponible: ${availability.reason}`);
          return;
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        toast.error('Error al verificar disponibilidad');
        return;
      }
    }

    setUpdating(true);
    try {
      const appointmentData = {
        ...editingAppointment,
        date: `${editingAppointment.date.split('T')[0]}T${editingAppointment.date.split('T')[1]?.split('.')[0] || '09:00:00'}`
      };

      await appointmentService.updateAppointment(editingAppointment.id, appointmentData);
      toast.success('Cita actualizada exitosamente');
      setShowEditModal(false);
      setEditingAppointment(null);
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error al actualizar la cita');
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
      await fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Error al eliminar la cita');
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

  if (authLoading || !user) {
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

  if (user.role !== 'Especialista') {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Acceso denegado</p>
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
        heading="Mis Citas"
        text="Gestiona tus citas médicas"
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
              placeholder="Buscar citas por paciente o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </Card>

      {/* Calendario */}
      <Card className="p-2 sm:p-4">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Calendario de Mis Citas
          </CardTitle>
          <CardDescription className="text-sm">
            Haz clic en una fecha para crear una nueva cita o en una cita existente para ver detalles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="calendar-container overflow-x-auto">
            <style jsx>{`
              .calendar-container :global(.fc-event),
              .calendar-container :global(.fc-daygrid-event),
              .calendar-container :global(.fc-timegrid-event),
              .calendar-container :global(.fc-list-event),
              .calendar-container :global(.fc-event-main),
              .calendar-container :global(.fc-event-main-frame),
              .calendar-container :global(.fc-event-main-body),
              .calendar-container :global(.fc-event-title),
              .calendar-container :global(.fc-event-time),
              .calendar-container :global(.fc-event-dot),
              .calendar-container :global(.fc-event-bg),
              .calendar-container :global(.fc-event-fg),
              .calendar-container :global(.fc-event-inner),
              .calendar-container :global(.fc-event-outer),
              .calendar-container :global(.fc-event-selected),
              .calendar-container :global(.fc-event-selected .fc-event-main),
              .calendar-container :global(.fc-event-selected .fc-event-main-frame),
              .calendar-container :global(.fc-event-selected .fc-event-main-body),
              .calendar-container :global(.fc-daygrid-event-dot),
              .calendar-container :global(.fc-daygrid-event-selected),
              .calendar-container :global(.fc-daygrid-event-selected .fc-event-main),
              .calendar-container :global(.fc-daygrid-event-selected .fc-event-main-frame),
              .calendar-container :global(.fc-daygrid-event-selected .fc-event-main-body),
              .calendar-container :global(.fc-timegrid-event-selected),
              .calendar-container :global(.fc-timegrid-event-selected .fc-event-main),
              .calendar-container :global(.fc-timegrid-event-selected .fc-event-main-frame),
              .calendar-container :global(.fc-timegrid-event-selected .fc-event-main-body) {
                border: none !important;
                box-shadow: none !important;
                outline: none !important;
                border-radius: 3px !important;
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
              </div>
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
                      {patient.username} - {patient.identification_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo *</Label>
                <Input
                  id="reason"
                  type="text"
                  required
                  value={newAppointment.reason}
                  onChange={e => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                  className="w-full"
                  placeholder="Motivo de la consulta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={newAppointment.notes || ''}
                  onChange={e => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  className="w-full"
                  placeholder="Notas adicionales"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creando...' : 'Crear Cita'}
              </Button>
            </DialogFooter>
          </form>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Paciente</Label>
                  <p className="text-sm">{detailAppointment.appointmentPatient?.username || `Paciente ${detailAppointment.patient_id}`}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <div className="mt-1">
                    <span 
                      className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: getStatusColor(detailAppointment.status) + '20',
                        color: getStatusColor(detailAppointment.status)
                      }}
                    >
                      {getStatusLabel(detailAppointment.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                  <p className="text-sm">{(() => {
                    const utcDate = new Date(detailAppointment.date);
                    return utcDate.toLocaleDateString('es-ES');
                  })()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hora</Label>
                  <p className="text-sm">{new Date(detailAppointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</p>
                </div>
              </div>
              {detailAppointment.reason && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Motivo</Label>
                  <p className="text-sm">{detailAppointment.reason}</p>
                </div>
              )}
              {detailAppointment.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notas</Label>
                  <p className="text-sm">{detailAppointment.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(detailAppointment);
                  }}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDetailModal(false);
                    openDeleteModal(detailAppointment);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
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
                    value={editingAppointment.date.split('T')[0]}
                    onChange={e => setEditingAppointment({ 
                      ...editingAppointment, 
                      date: `${e.target.value}T${editingAppointment.date.split('T')[1]?.split('.')[0] || '09:00:00'}` 
                    })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Hora *</Label>
                  <select
                    id="edit-time"
                    required
                    value={editingAppointment.date.split('T')[1]?.split(':').slice(0, 2).join(':') || '09:00'}
                    onChange={e => setEditingAppointment({ 
                      ...editingAppointment, 
                      date: `${editingAppointment.date.split('T')[0]}T${e.target.value}:00` 
                    })}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-patient">Paciente *</Label>
                  <select
                    id="edit-patient"
                    required
                    value={editingAppointment.patient_id}
                    onChange={e => setEditingAppointment({ ...editingAppointment, patient_id: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.username} - {patient.identification_number}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reason">Motivo *</Label>
                  <Input
                    id="edit-reason"
                    type="text"
                    required
                    value={editingAppointment.reason}
                    onChange={e => setEditingAppointment({ ...editingAppointment, reason: e.target.value })}
                    className="w-full"
                    placeholder="Motivo de la consulta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notas</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingAppointment.notes || ''}
                    onChange={e => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                    className="w-full"
                    placeholder="Notas adicionales"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <select
                    id="edit-status"
                    value={editingAppointment.status}
                    onChange={e => setEditingAppointment({ ...editingAppointment, status: e.target.value as Appointment['status'] })}
                    className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? 'Actualizando...' : 'Actualizar Cita'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminación */}
      <Dialog open={!!appointmentToDelete} onOpenChange={() => setAppointmentToDelete(null)}>
        <DialogContent className="w-[95vw] max-w-[400px] p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl">
              <AlertCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="text-sm">
              ¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAppointmentToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAppointment} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default SpecialistAppointmentsPage; 