"use client";
import React, { useEffect, useState } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
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
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { User } from '@/types/auth';

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
];

const AdminAppointmentsPage = () => {
  const [tenantId, setTenantId] = useState<string | number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id' | 'patient' | 'specialist' | 'tenant_id'> & { notes?: string }>({
    patient_id: 0,
    specialist_id: 0,
    date: '',
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
      } catch (e) {
        setError('No se pudo obtener el tenant');
      } finally {
        setIsLoading(false);
      }
    };
    getTenantId();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setCreating(true);
    try {
      const dateISO = new Date(`${newAppointment.date}T00:00`).toISOString();
      const appointmentPayload = {
        patient_id: newAppointment.patient_id,
        specialist_id: newAppointment.specialist_id,
        date: dateISO,
        reason: newAppointment.reason,
        status: newAppointment.status as Appointment['status'],
        ...(newAppointment.notes ? { notes: newAppointment.notes } : {}),
      };
      await appointmentService.createAppointment(appointmentPayload);
      toast.success('Cita creada exitosamente');
      setShowCreateModal(false);
      setNewAppointment({ patient_id: 0, specialist_id: 0, date: '', reason: '', status: 'pendiente' as Appointment['status'], notes: undefined });
      await fetchAppointments(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al crear la cita');
      }
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (appointment: Appointment) => {
    let date = '';
    if (appointment.date) {
      date = new Date(appointment.date).toISOString().slice(0, 10);
    }
    setEditingAppointment({
      ...appointment,
      date: date || appointment.date || '',
      reason: appointment.reason || '',
    });
    setEditingPatientId(String(appointment.patient_id));
    setEditingSpecialistId(String(appointment.specialist_id));
    setShowEditModal(true);
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    setUpdating(true);
    try {
      const dateISO = new Date(`${editingAppointment.date}T00:00`).toISOString();
      const appointmentPayload = {
        patient_id: Number(editingPatientId),
        specialist_id: Number(editingSpecialistId),
        date: dateISO,
        reason: editingAppointment.reason,
        status: editingAppointment.status as Appointment['status'],
        ...(editingAppointment.notes ? { notes: editingAppointment.notes } : {}),
      };
      await appointmentService.updateAppointment(editingAppointment.id, appointmentPayload);
      toast.success('Cita actualizada exitosamente');
      setShowEditModal(false);
      setEditingAppointment(null);
      if (tenantId) await fetchAppointments(tenantId);
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
    if (!appointmentToDelete || !tenantId) return;
    setDeleting(true);
    try {
      await appointmentService.deleteAppointment(appointmentToDelete.id);
      toast.success('Cita eliminada exitosamente');
      setAppointmentToDelete(null);
      await fetchAppointments(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al eliminar la cita');
      }
    } finally {
      setDeleting(false);
    }
  };

  const openDetailModal = async (appointment: Appointment) => {
    setLoadingDetail(true);
    try {
      const data = await appointmentService.getAppointmentById(String(appointment.id));
      setDetailAppointment(data);
      setShowDetailModal(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al obtener detalles de la cita');
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Citas del Tenant
        </h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="mr-2">➕</span>
          Nueva Cita
        </Button>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <li className="p-8 text-center text-gray-500">Cargando citas...</li>
          ) : appointments.length === 0 ? (
            <li className="p-8 text-center text-gray-500">No hay citas para este tenant.</li>
          ) : (
            appointments.map((appointment) => (
              <li key={appointment.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm">
                        <p className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          {appointment.patient?.username || appointment.patient_id} <span className="ml-2 text-xs text-gray-500">con</span> {appointment.specialist?.username || appointment.specialist_id}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="mr-2">📧</span>
                          Paciente: {appointment.patient?.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="mr-2">📧</span>
                          Especialista: {appointment.specialist?.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="mr-2">📅</span>
                          {appointment.date ? `${new Date(appointment.date).toLocaleDateString('sv-SE')} ${new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}` : ''}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="mr-2">📝</span>
                          {appointment.reason}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="mr-2">🔖</span>
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0">
                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={() => openEditModal(appointment)}>Editar</Button>
                        <Button variant="ghost" onClick={() => openDetailModal(appointment)}>Ver detalles</Button>
                        <Button variant="destructive" onClick={() => openDeleteModal(appointment)}>Eliminar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      {/* Modales: Crear, Editar, Eliminar, Detalle */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Cita</DialogTitle>
            <DialogDescription>
              Ingresa los datos de la nueva cita.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <div>
              <Label htmlFor="patient_id">Paciente</Label>
              <select
                id="patient_id"
                className="form-select w-full rounded border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={newAppointment.patient_id || ''}
                onChange={e => setNewAppointment({ ...newAppointment, patient_id: Number(e.target.value) })}
                required
              >
                <option value="">Selecciona un paciente</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.username} ({p.email})</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="specialist_id">Especialista</Label>
              <select
                id="specialist_id"
                className="form-select w-full rounded border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={newAppointment.specialist_id || ''}
                onChange={e => setNewAppointment({ ...newAppointment, specialist_id: Number(e.target.value) })}
                required
              >
                <option value="">Selecciona un especialista</option>
                {specialists.map((s) => (
                  <option key={s.id} value={s.id}>{s.username} ({s.email})</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                required
                value={newAppointment.date}
                onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                type="text"
                required
                value={newAppointment.reason}
                onChange={e => setNewAppointment({ ...newAppointment, reason: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                className="form-select w-full rounded border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={newAppointment.status}
                onChange={e => setNewAppointment({ ...newAppointment, status: e.target.value as Appointment['status'] })}
                required
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creando...' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cita</DialogTitle>
            <DialogDescription>
              Modifica los datos de la cita.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAppointment} className="space-y-4">
            <div>
              <Label htmlFor="edit-patient_id">Paciente</Label>
              <select
                id="edit-patient_id"
                className="form-select w-full rounded border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={editingPatientId}
                onChange={e => setEditingPatientId(e.target.value)}
                required
              >
                <option value="">Selecciona un paciente</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.username} ({p.email})</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-specialist_id">Especialista</Label>
              <select
                id="edit-specialist_id"
                className="form-select w-full rounded border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={editingSpecialistId}
                onChange={e => setEditingSpecialistId(e.target.value)}
                required
              >
                <option value="">Selecciona un especialista</option>
                {specialists.map((s) => (
                  <option key={s.id} value={s.id}>{s.username} ({s.email})</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-date">Fecha</Label>
              <Input
                id="edit-date"
                type="date"
                required
                value={editingAppointment?.date || ''}
                onChange={e => setEditingAppointment(editingAppointment ? { ...editingAppointment, date: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-reason">Motivo</Label>
              <Input
                id="edit-reason"
                type="text"
                required
                value={editingAppointment?.reason || ''}
                onChange={e => setEditingAppointment(editingAppointment ? { ...editingAppointment, reason: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Estado</Label>
              <select
                id="edit-status"
                className="form-select w-full rounded border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={editingAppointment?.status || ''}
                onChange={e => setEditingAppointment(editingAppointment ? { ...editingAppointment, status: e.target.value as Appointment['status'] } : null)}
                required
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!appointmentToDelete} onOpenChange={(open) => !open && setAppointmentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar la cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAppointmentToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAppointment} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>Información detallada de la cita seleccionada.</DialogDescription>
          </DialogHeader>
          {loadingDetail ? (
            <div className="p-8 text-center text-gray-500">Cargando detalles...</div>
          ) : detailAppointment && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">ID:</span> {detailAppointment.id}
              </div>
              <div>
                <span className="font-semibold">Paciente:</span> {detailAppointment.patient?.username} ({detailAppointment.patient?.email})
              </div>
              <div>
                <span className="font-semibold">Especialista:</span> {detailAppointment.specialist?.username} ({detailAppointment.specialist?.email})
              </div>
              <div>
                <span className="font-semibold">Fecha:</span> {detailAppointment.date ? new Date(detailAppointment.date).toLocaleDateString() : ''}
              </div>
              <div>
                <span className="font-semibold">Hora:</span> {detailAppointment.date ? new Date(detailAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
              </div>
              <div>
                <span className="font-semibold">Motivo:</span> {detailAppointment.reason}
              </div>
              <div>
                <span className="font-semibold">Estado:</span> {detailAppointment.status}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAppointmentsPage; 