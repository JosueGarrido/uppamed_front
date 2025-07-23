'use client';

import React, { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
import { use } from 'react';

interface PageProps {
  params: { tenantId: string };
}

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  area?: string;
  specialty?: string;
  createdAt?: string;
}

const ROLES = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Especialista', label: 'Especialista' },
  { value: 'Paciente', label: 'Paciente' },
];

export default function Page({ params }: PageProps) {
  const { tenantId } = params;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Especialista',
    area: '',
    specialty: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsersByTenant(tenantId);
      console.log('Respuesta de getUsersByTenant:', data);
      setUsers(Array.isArray(data) ? data : data.users || []);
      setError(null);
    } catch (error) {
      setError('Error al obtener los usuarios');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      console.log('Datos enviados:', newUser);
      await userService.createUser(tenantId, newUser);
      toast.success('Usuario creado exitosamente');
      setShowCreateModal(false);
      setNewUser({ username: '', email: '', password: '', role: 'Especialista', area: '', specialty: '' });
      await fetchUsers();
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
        console.error('Error backend:', error.response.data);
      } else {
        toast.error('Error al crear el usuario');
        console.error('Error desconocido:', error);
      }
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);
    try {
      await userService.updateUser(editingUser.id, editingUser);
      toast.success('Usuario actualizado exitosamente');
      setShowEditModal(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al actualizar el usuario');
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success('Usuario eliminado exitosamente');
      setUserToDelete(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al eliminar el usuario');
    } finally {
      setDeleting(false);
    }
  };

  const openDetailModal = async (user: User) => {
    setLoadingDetail(true);
    try {
      const data = await userService.getUserById(user.id);
      setDetailUser(data);
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al obtener detalles del usuario');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Usuarios del Tenant {tenantId}
        </h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="mr-2">➕</span>
          Nuevo Usuario
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
            <li className="p-8 text-center text-gray-500">Cargando usuarios...</li>
          ) : users.length === 0 ? (
            <li className="p-8 text-center text-gray-500">No hay usuarios para este tenant.</li>
          ) : (
            users.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm">
                        <p className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          {user.username} <span className="ml-2 text-xs text-gray-500">({user.role})</span>
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4">
                        {user.email && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mr-2">📧</span>
                            {user.email}
                          </div>
                        )}
                        {user.area && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mr-2">🏥</span>
                            {user.area}
                          </div>
                        )}
                        {user.specialty && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="mr-2">🩺</span>
                            {user.specialty}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0">
                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={() => openEditModal(user)}>Editar</Button>
                        <Button variant="ghost" onClick={() => openDetailModal(user)}>Ver detalles</Button>
                        <Button variant="destructive" onClick={() => openDeleteModal(user)}>Eliminar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo usuario. Los campos obligatorios varían según el rol.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                required
                value={newUser.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                className="form-select w-full rounded border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                required
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            {newUser.role === 'Especialista' && (
              <>
                <div>
                  <Label htmlFor="area">Área</Label>
                  <Input
                    id="area"
                    type="text"
                    required
                    value={newUser.area}
                    onChange={e => setNewUser({ ...newUser, area: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Input
                    id="specialty"
                    type="text"
                    required
                    value={newUser.specialty}
                    onChange={e => setNewUser({ ...newUser, specialty: e.target.value })}
                  />
                </div>
              </>
            )}
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
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario. Los campos obligatorios varían según el rol.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Nombre de usuario</Label>
              <Input
                id="edit-username"
                type="text"
                required
                value={editingUser?.username || ''}
                onChange={e => setEditingUser(editingUser ? { ...editingUser, username: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={editingUser?.email || ''}
                onChange={e => setEditingUser(editingUser ? { ...editingUser, email: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Rol</Label>
              <select
                id="edit-role"
                className="form-select w-full rounded border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={editingUser?.role || ''}
                onChange={e => setEditingUser(editingUser ? { ...editingUser, role: e.target.value } : null)}
                required
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            {editingUser?.role === 'Especialista' && (
              <>
                <div>
                  <Label htmlFor="edit-area">Área</Label>
                  <Input
                    id="edit-area"
                    type="text"
                    required
                    value={editingUser.area || ''}
                    onChange={e => setEditingUser(editingUser ? { ...editingUser, area: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-specialty">Especialidad</Label>
                  <Input
                    id="edit-specialty"
                    type="text"
                    required
                    value={editingUser.specialty || ''}
                    onChange={e => setEditingUser(editingUser ? { ...editingUser, specialty: e.target.value } : null)}
                  />
                </div>
              </>
            )}
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
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el usuario "{userToDelete?.username}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="p-8 text-center text-gray-500">Cargando detalles...</div>
          ) : detailUser && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">ID:</span> {detailUser.id}
              </div>
              <div>
                <span className="font-semibold">Nombre de usuario:</span> {detailUser.username}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {detailUser.email}
              </div>
              <div>
                <span className="font-semibold">Rol:</span> {detailUser.role}
              </div>
              {detailUser.area && (
                <div>
                  <span className="font-semibold">Área:</span> {detailUser.area}
                </div>
              )}
              {detailUser.specialty && (
                <div>
                  <span className="font-semibold">Especialidad:</span> {detailUser.specialty}
                </div>
              )}
              {detailUser.createdAt && (
                <div>
                  <span className="font-semibold">Creado:</span> {new Date(detailUser.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 