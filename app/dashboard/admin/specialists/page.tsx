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
import { User, UserRole } from '@/types/auth';

const AdminSpecialistsPage = () => {
  const [tenantId, setTenantId] = useState<string | number | null>(null);
  const [specialists, setSpecialists] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSpecialist, setNewSpecialist] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Especialista' as UserRole,
    area: '',
    specialty: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [specialistToDelete, setSpecialistToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSpecialist, setDetailSpecialist] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchSpecialists = async (tenantId: string | number) => {
    setIsLoading(true);
    try {
      const data = await userService.getUsersByTenant(tenantId);
      const filtered = data.filter((u: User) => u.role === 'Especialista');
      setSpecialists(filtered);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error al obtener los especialistas');
      }
      setSpecialists([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getTenantId = async () => {
      setIsLoading(true);
      try {
        const user = await authService.fetchUserData();
        setTenantId(user.tenant_id ?? null);
        if (user.tenant_id) {
          await fetchSpecialists(user.tenant_id);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError('No se pudo obtener el tenant');
        }
      } finally {
        setIsLoading(false);
      }
    };
    getTenantId();
  }, []);

  const handleCreateSpecialist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setCreating(true);
    try {
      await userService.createUser(tenantId, { ...newSpecialist, role: newSpecialist.role as UserRole });
      toast.success('Especialista creado exitosamente');
      setShowCreateModal(false);
      setNewSpecialist({ username: '', email: '', password: '', role: 'Especialista' as UserRole, area: '', specialty: '' });
      await fetchSpecialists(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al crear el especialista');
      }
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (specialist: User) => {
    setEditingSpecialist(specialist);
    setShowEditModal(true);
  };

  const handleEditSpecialist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecialist) return;
    setUpdating(true);
    try {
      if (editingSpecialist) {
        await userService.updateUser(editingSpecialist.id, { ...editingSpecialist, role: editingSpecialist.role as UserRole });
      }
      toast.success('Especialista actualizado exitosamente');
      setShowEditModal(false);
      setEditingSpecialist(null);
      if (tenantId) await fetchSpecialists(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al actualizar el especialista');
      }
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = (specialist: User) => {
    setSpecialistToDelete(specialist);
  };

  const handleDeleteSpecialist = async () => {
    if (!specialistToDelete || !tenantId) return;
    setDeleting(true);
    try {
      await userService.deleteUser(specialistToDelete.id);
      toast.success('Especialista eliminado exitosamente');
      setSpecialistToDelete(null);
      await fetchSpecialists(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al eliminar el especialista');
      }
    } finally {
      setDeleting(false);
    }
  };

  const openDetailModal = async (specialist: User) => {
    setLoadingDetail(true);
    try {
      const data = await userService.getUserById(specialist.id);
      setDetailSpecialist(data);
      setShowDetailModal(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al obtener detalles del especialista');
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Especialistas del Tenant
        </h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="mr-2">➕</span>
          Nuevo Especialista
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
            <li className="p-8 text-center text-gray-500">Cargando especialistas...</li>
          ) : specialists.length === 0 ? (
            <li className="p-8 text-center text-gray-500">No hay especialistas para este tenant.</li>
          ) : (
            specialists.map((specialist) => (
              <li key={specialist.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm">
                        <p className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          {specialist.username} <span className="ml-2 text-xs text-gray-500">({specialist.role})</span>
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4">
                        {specialist.email && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 min-w-0">
                            <span className="mr-2 flex-shrink-0">📧</span>
                            <span className="truncate min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] overflow-hidden">
                              {specialist.email}
                            </span>
                          </div>
                        )}
                        {specialist.area && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mr-2">🏥</span>
                            {specialist.area}
                          </div>
                        )}
                        {specialist.specialty && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mr-2">🩺</span>
                            {specialist.specialty}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0">
                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={() => openEditModal(specialist)}>Editar</Button>
                        <Button variant="ghost" onClick={() => openDetailModal(specialist)}>Ver detalles</Button>
                        <Button variant="destructive" onClick={() => openDeleteModal(specialist)}>Eliminar</Button>
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
            <DialogTitle>Crear Nuevo Especialista</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo especialista.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSpecialist} className="space-y-4">
            <div>
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                required
                value={newSpecialist.username}
                onChange={e => setNewSpecialist({ ...newSpecialist, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={newSpecialist.email}
                onChange={e => setNewSpecialist({ ...newSpecialist, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={newSpecialist.password}
                onChange={e => setNewSpecialist({ ...newSpecialist, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="area">Área</Label>
              <Input
                id="area"
                type="text"
                required
                value={newSpecialist.area}
                onChange={e => setNewSpecialist({ ...newSpecialist, area: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                type="text"
                required
                value={newSpecialist.specialty}
                onChange={e => setNewSpecialist({ ...newSpecialist, specialty: e.target.value })}
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
            <DialogTitle>Editar Especialista</DialogTitle>
            <DialogDescription>
              Modifica los datos del especialista.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSpecialist} className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Nombre de usuario</Label>
              <Input
                id="edit-username"
                type="text"
                required
                value={editingSpecialist?.username || ''}
                onChange={e => setEditingSpecialist(editingSpecialist ? { ...editingSpecialist, username: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={editingSpecialist?.email || ''}
                onChange={e => setEditingSpecialist(editingSpecialist ? { ...editingSpecialist, email: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-area">Área</Label>
              <Input
                id="edit-area"
                type="text"
                required
                value={editingSpecialist?.area || ''}
                onChange={e => setEditingSpecialist(editingSpecialist ? { ...editingSpecialist, area: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-specialty">Especialidad</Label>
              <Input
                id="edit-specialty"
                type="text"
                required
                value={editingSpecialist?.specialty || ''}
                onChange={e => setEditingSpecialist(editingSpecialist ? { ...editingSpecialist, specialty: e.target.value } : null)}
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
      <Dialog open={!!specialistToDelete} onOpenChange={(open) => !open && setSpecialistToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Especialista</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el especialista "{specialistToDelete?.username}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpecialistToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteSpecialist} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Especialista</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="p-8 text-center text-gray-500">Cargando detalles...</div>
          ) : detailSpecialist && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">ID:</span> {detailSpecialist.id}
              </div>
              <div>
                <span className="font-semibold">Nombre de usuario:</span> {detailSpecialist.username}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {detailSpecialist.email}
              </div>
              <div>
                <span className="font-semibold">Área:</span> {detailSpecialist.area}
              </div>
              <div>
                <span className="font-semibold">Especialidad:</span> {detailSpecialist.specialty}
              </div>
              {detailSpecialist.createdAt && (
                <div>
                  <span className="font-semibold">Creado:</span> {new Date(detailSpecialist.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSpecialistsPage; 