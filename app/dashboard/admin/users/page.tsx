"use client";
import React, { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { toast } from 'sonner';
import { User, UserRole } from '@/types/auth';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  Mail, 
  Calendar, 
  Shield, 
  UserCheck, 
  UserX,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter
} from 'lucide-react';
import Link from 'next/link';

const ROLES = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Especialista', label: 'Especialista' },
  { value: 'Paciente', label: 'Paciente' },
];

const AdminUsersPage = () => {
  const [tenantId, setTenantId] = useState<string | number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Especialista' as UserRole,
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
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const fetchUsers = async (tenantId: string | number) => {
    setIsLoading(true);
    try {
      const data = await userService.getUsersByTenant(tenantId);
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error al obtener los usuarios');
      }
      setUsers([]);
      setFilteredUsers([]);
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
          await fetchUsers(user.tenant_id);
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

  // Filtrado y búsqueda
  useEffect(() => {
    let filtered = users;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.identification_number && user.identification_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por rol
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, roleFilter]);

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setCreating(true);
    try {
      await userService.createUser({ ...newUser, role: newUser.role as UserRole, tenant_id: typeof tenantId === 'string' ? parseInt(tenantId) : tenantId });
      toast.success('Usuario creado exitosamente');
      setShowCreateModal(false);
      setNewUser({ username: '', email: '', password: '', role: 'Especialista', area: '', specialty: '' });
      await fetchUsers(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al crear el usuario');
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
    if (!editingUser || !tenantId) return;
    setUpdating(true);
    try {
      await userService.updateUser(editingUser.id, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
        area: editingUser.area,
        specialty: editingUser.specialty,
      });
      toast.success('Usuario actualizado exitosamente');
      setShowEditModal(false);
      setEditingUser(null);
      await fetchUsers(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al actualizar el usuario');
      }
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !tenantId) return;
    setDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success('Usuario eliminado exitosamente');
      setUserToDelete(null);
      await fetchUsers(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al eliminar el usuario');
      }
    } finally {
      setDeleting(false);
    }
  };

  const openDetailModal = async (user: User) => {
    setDetailUser(user);
    setShowDetailModal(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Administrador':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'Especialista':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'Paciente':
        return <UserX className="h-4 w-4 text-purple-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Especialista':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Paciente':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
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
        heading="Gestión de Usuarios"
        text="Administra los usuarios del centro médico"
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Crear Usuario</span>
            <span className="sm:hidden">Crear</span>
          </Button>
        </div>
      </DashboardHeader>

      {/* Filtros y Búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar usuarios por nombre, email o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="w-full sm:w-48 flex-shrink-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <option value="all">Todos los roles</option>
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600 px-2">
          {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      </Card>

      {/* Lista de Usuarios */}
      <Card className="p-4">
        {currentUsers.length > 0 ? (
          <div className="space-y-4">
            {currentUsers.map((user) => (
              <div key={user.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{user.username}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                      <div className="flex items-center text-sm text-gray-500 min-w-0">
                        <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] overflow-hidden">
                          {user.email}
                        </span>
                      </div>
                      {user.identification_number && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {user.identification_number}
                        </div>
                      )}
                    </div>
                    {user.role === 'Especialista' && (user.area || user.specialty) && (
                      <div className="mt-1 text-sm text-gray-500">
                        {user.area && <span className="mr-2">Área: {user.area}</span>}
                        {user.specialty && <span>Especialidad: {user.specialty}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4 lg:mt-0 flex-1 sm:flex-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDetailModal(user)}
                    className="flex-1 sm:flex-none min-w-[80px]"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Ver</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(user)}
                    className="flex-1 sm:flex-none min-w-[80px]"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteModal(user)}
                    className="flex-1 sm:flex-none min-w-[80px] text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || roleFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando el primer usuario del centro médico'
              }
            </p>
            {!searchTerm && roleFilter === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Primer Usuario
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <div className="text-sm text-gray-600">
              Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Modal de Creación */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Crear Nuevo Usuario
            </DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo usuario. Los campos marcados con * son requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario *</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <select
                  id="role"
                  className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  required
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {newUser.role === 'Especialista' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Área</Label>
                  <Input
                    id="area"
                    type="text"
                    value={newUser.area}
                    onChange={e => setNewUser({ ...newUser, area: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Input
                    id="specialty"
                    type="text"
                    value={newUser.specialty}
                    onChange={e => setNewUser({ ...newUser, specialty: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={creating} className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                {creating ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edición */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5" />
              Editar Usuario
            </DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Nombre de Usuario *</Label>
                  <Input
                    id="edit-username"
                    type="text"
                    required
                    value={editingUser.username}
                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rol *</Label>
                  <select
                    id="edit-role"
                    className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    required
                  >
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {editingUser.role === 'Especialista' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-area">Área</Label>
                    <Input
                      id="edit-area"
                      type="text"
                      value={editingUser.area || ''}
                      onChange={e => setEditingUser({ ...editingUser, area: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-specialty">Especialidad</Label>
                    <Input
                      id="edit-specialty"
                      type="text"
                      value={editingUser.specialty || ''}
                      onChange={e => setEditingUser({ ...editingUser, specialty: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={updating} className="w-full sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" />
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminación */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar Usuario
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el usuario "{userToDelete?.username}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setUserToDelete(null)} disabled={deleting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Detalles del Usuario
            </DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="p-8 text-center text-gray-500">Cargando detalles...</div>
          ) : detailUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID</Label>
                  <p className="text-sm text-gray-600 mt-1">{detailUser.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nombre de Usuario</Label>
                  <p className="text-sm text-gray-600 mt-1">{detailUser.username}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-gray-600 mt-1 flex items-center min-w-0">
                  <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] overflow-hidden">
                    {detailUser.email}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Rol</Label>
                  <div className="flex items-center mt-1">
                    {getRoleIcon(detailUser.role)}
                    <span className="ml-2 text-sm text-gray-600">{detailUser.role}</span>
                  </div>
                </div>
                {detailUser.identification_number && (
                  <div>
                    <Label className="text-sm font-medium">Identificación</Label>
                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {detailUser.identification_number}
                    </p>
                  </div>
                )}
              </div>
              {detailUser.role === 'Especialista' && (detailUser.area || detailUser.specialty) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detailUser.area && (
                    <div>
                      <Label className="text-sm font-medium">Área</Label>
                      <p className="text-sm text-gray-600 mt-1">{detailUser.area}</p>
                    </div>
                  )}
                  {detailUser.specialty && (
                    <div>
                      <Label className="text-sm font-medium">Especialidad</Label>
                      <p className="text-sm text-gray-600 mt-1">{detailUser.specialty}</p>
                    </div>
                  )}
                </div>
              )}
              {detailUser.createdAt && (
                <div>
                  <Label className="text-sm font-medium">Fecha de Creación</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(detailUser.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default AdminUsersPage; 