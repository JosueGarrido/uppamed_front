"use client";
import React, { useEffect, useState } from 'react';
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

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  identification_number?: string;
  createdAt?: string;
}

const AdminPatientsPage = () => {
  const [tenantId, setTenantId] = useState<string | number | null>(null);
  const [patients, setPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPatient, setNewPatient] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Paciente',
    identification_number: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPatient, setDetailPatient] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchPatients = async (tenantId: string | number) => {
    setIsLoading(true);
    try {
      const data = await userService.getUsersByTenant(tenantId);
      const filtered = (Array.isArray(data) ? data : data.users || []).filter((u: User) => u.role === 'Paciente');
      setPatients(filtered);
      setError(null);
    } catch (error) {
      setError('Error al obtener los pacientes');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getTenantId = async () => {
      setIsLoading(true);
      try {
        const user = await authService.fetchUserData();
        setTenantId(user.tenant_id);
        if (user.tenant_id) {
          await fetchPatients(user.tenant_id);
        }
      } catch (e) {
        setError('No se pudo obtener el tenant');
      } finally {
        setIsLoading(false);
      }
    };
    getTenantId();
  }, []);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setCreating(true);
    try {
      await userService.createUser(tenantId, newPatient);
      toast.success('Paciente creado exitosamente');
      setShowCreateModal(false);
      setNewPatient({ username: '', email: '', password: '', role: 'Paciente', identification_number: '' });
      await fetchPatients(tenantId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear el paciente');
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (patient: User) => {
    setEditingPatient(patient);
    setShowEditModal(true);
  };

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    setUpdating(true);
    try {
      await userService.updateUser(editingPatient.id, editingPatient);
      toast.success('Paciente actualizado exitosamente');
      setShowEditModal(false);
      setEditingPatient(null);
      if (tenantId) await fetchPatients(tenantId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al actualizar el paciente');
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = (patient: User) => {
    setPatientToDelete(patient);
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete || !tenantId) return;
    setDeleting(true);
    try {
      await userService.deleteUser(patientToDelete.id);
      toast.success('Paciente eliminado exitosamente');
      setPatientToDelete(null);
      await fetchPatients(tenantId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al eliminar el paciente');
    } finally {
      setDeleting(false);
    }
  };

  const openDetailModal = async (patient: User) => {
    setLoadingDetail(true);
    try {
      const data = await userService.getUserById(patient.id);
      setDetailPatient(data);
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al obtener detalles del paciente');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Pacientes del Tenant
        </h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="mr-2">➕</span>
          Nuevo Paciente
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
            <li className="p-8 text-center text-gray-500">Cargando pacientes...</li>
          ) : patients.length === 0 ? (
            <li className="p-8 text-center text-gray-500">No hay pacientes para este tenant.</li>
          ) : (
            patients.map((patient) => (
              <li key={patient.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm">
                        <p className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          {patient.username} <span className="ml-2 text-xs text-gray-500">({patient.role})</span>
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4">
                        {patient.email && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mr-2">📧</span>
                            {patient.email}
                          </div>
                        )}
                        {patient.identification_number && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mr-2">🆔</span>
                            {patient.identification_number}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0">
                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={() => openEditModal(patient)}>Editar</Button>
                        <Button variant="ghost" onClick={() => openDetailModal(patient)}>Ver detalles</Button>
                        <Button variant="destructive" onClick={() => openDeleteModal(patient)}>Eliminar</Button>
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
            <DialogTitle>Crear Nuevo Paciente</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo paciente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePatient} className="space-y-4">
            <div>
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                required
                value={newPatient.username}
                onChange={e => setNewPatient({ ...newPatient, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={newPatient.email}
                onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={newPatient.password}
                onChange={e => setNewPatient({ ...newPatient, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="identification_number">N° Identificación</Label>
              <Input
                id="identification_number"
                type="text"
                required
                value={newPatient.identification_number}
                onChange={e => setNewPatient({ ...newPatient, identification_number: e.target.value })}
              />
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
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Modifica los datos del paciente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPatient} className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Nombre de usuario</Label>
              <Input
                id="edit-username"
                type="text"
                required
                value={editingPatient?.username || ''}
                onChange={e => setEditingPatient(editingPatient ? { ...editingPatient, username: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={editingPatient?.email || ''}
                onChange={e => setEditingPatient(editingPatient ? { ...editingPatient, email: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-identification_number">N° Identificación</Label>
              <Input
                id="edit-identification_number"
                type="text"
                required
                value={editingPatient?.identification_number || ''}
                onChange={e => setEditingPatient(editingPatient ? { ...editingPatient, identification_number: e.target.value } : null)}
              />
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
      <Dialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Paciente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el paciente "{patientToDelete?.username}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPatientToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletePatient} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Paciente</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="p-8 text-center text-gray-500">Cargando detalles...</div>
          ) : detailPatient && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">ID:</span> {detailPatient.id}
              </div>
              <div>
                <span className="font-semibold">Nombre de usuario:</span> {detailPatient.username}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {detailPatient.email}
              </div>
              <div>
                <span className="font-semibold">N° Identificación:</span> {detailPatient.identification_number}
              </div>
              {detailPatient.createdAt && (
                <div>
                  <span className="font-semibold">Creado:</span> {new Date(detailPatient.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPatientsPage; 