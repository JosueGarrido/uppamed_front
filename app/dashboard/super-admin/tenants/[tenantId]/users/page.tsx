'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userService } from '../../../../../../services/user.service';
import { tenantService } from '../../../../../../services/tenant.service';
import { User } from '../../../../../../types/auth';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { 
  Plus, 
  User, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';



interface Tenant {
  id: number;
  name: string;
  address: string;
}

export default function TenantUsersPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = Number(params.tenantId);

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Estados para filtro y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const usersPerPage = 5;

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Paciente' as 'Super Admin' | 'Administrador' | 'Especialista' | 'Paciente',
    area: '',
    specialty: '',
    identification_number: ''
  });

  const fetchTenant = async () => {
    try {
      const tenantData = await tenantService.getTenantById(tenantId);
      setTenant(tenantData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error('Error al cargar información del tenant');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsersByTenant(tenantId);
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTenant();
    void fetchUsers();
  }, [tenantId]);

  // Filtrar usuarios basado en el término de búsqueda y filtro de rol
  useEffect(() => {
    let filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.identification_number && user.identification_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando se filtra
  }, [searchTerm, roleFilter, users]);

  // Calcular usuarios para la página actual
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createUser({
        ...newUser,
        tenant_id: tenantId
      });
      await fetchUsers();
      setShowCreateModal(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'Paciente' as 'Super Admin' | 'Administrador' | 'Especialista' | 'Paciente',
        area: '',
        specialty: '',
        identification_number: ''
      });
      setError(null);
      toast.success('Usuario creado exitosamente');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error('Error al crear el usuario');
      }
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await userService.updateUser(editingUser.id, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
        area: editingUser.area || '',
        specialty: editingUser.specialty || '',
        identification_number: editingUser.identification_number
      });
      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
      setError(null);
      toast.success('Usuario actualizado exitosamente');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error('Error al actualizar el usuario');
      }
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const viewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success('Usuario eliminado exitosamente');
      setUserToDelete(null);
      await fetchUsers();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-red-100 text-red-800';
      case 'Administrador':
        return 'bg-blue-100 text-blue-800';
      case 'Especialista':
        return 'bg-green-100 text-green-800';
      case 'Paciente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return <Shield className="h-4 w-4" />;
      case 'Administrador':
        return <UserCheck className="h-4 w-4" />;
      case 'Especialista':
        return <User className="h-4 w-4" />;
      case 'Paciente':
        return <UserX className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Usuarios de ${tenant?.name || 'Tenant'}`}
        text="Administra los usuarios de este centro médico"
      >
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </DashboardHeader>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            {tenant?.name}
          </CardTitle>
          <CardDescription>
            Lista de usuarios del centro médico
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, email o identificación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Especialista">Especialista</SelectItem>
                  <SelectItem value="Paciente">Paciente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || roleFilter) && (
              <p className="text-sm text-gray-500">
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </p>
            )}
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || roleFilter ? 'No se encontraron usuarios' : 'No hay usuarios'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter ? 'Intenta con otros filtros.' : 'Comienza creando el primer usuario.'}
              </p>
              {!searchTerm && !roleFilter && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Usuario
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span className="ml-1">{user.role}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          ID: {user.identification_number} • Creado el {user.createdAt ? format(new Date(user.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'Fecha no disponible'}
                        </p>
                        {user.area && (
                          <p className="text-xs text-gray-400">Área: {user.area}</p>
                        )}
                        {user.specialty && (
                          <p className="text-xs text-gray-400">Especialidad: {user.specialty}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(user)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDetails(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver detalles
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
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
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Crear Nuevo Usuario */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Crear Nuevo Usuario
            </DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo usuario para {tenant?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleCreateUser(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario *</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  placeholder="juan.perez"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="juan@ejemplo.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identification">Identificación *</Label>
                <Input
                  id="identification"
                  type="text"
                  required
                  placeholder="12345678"
                  value={newUser.identification_number}
                  onChange={(e) => setNewUser({ ...newUser, identification_number: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as 'Super Admin' | 'Administrador' | 'Especialista' | 'Paciente' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Especialista">Especialista</SelectItem>
                    <SelectItem value="Paciente">Paciente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newUser.role === 'Especialista' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Área</Label>
                    <Input
                      id="area"
                      type="text"
                      placeholder="Cardiología"
                      value={newUser.area}
                      onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidad</Label>
                    <Input
                      id="specialty"
                      type="text"
                      placeholder="Cardiólogo"
                      value={newUser.specialty}
                      onChange={(e) => setNewUser({ ...newUser, specialty: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Usuario */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5" />
              Editar Usuario
            </DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleEditUser(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Nombre de Usuario *</Label>
                <Input
                  id="edit-username"
                  type="text"
                  required
                  value={editingUser?.username || ''}
                  onChange={(e) => setEditingUser(editingUser ? { ...editingUser, username: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  required
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser(editingUser ? { ...editingUser, email: e.target.value } : null)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-identification">Identificación *</Label>
                <Input
                  id="edit-identification"
                  type="text"
                  required
                  value={editingUser?.identification_number || ''}
                  onChange={(e) => setEditingUser(editingUser ? { ...editingUser, identification_number: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol *</Label>
                <Select 
                  value={editingUser?.role || ''} 
                  onValueChange={(value) => setEditingUser(editingUser ? { ...editingUser, role: value as 'Super Admin' | 'Administrador' | 'Especialista' | 'Paciente' } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Especialista">Especialista</SelectItem>
                    <SelectItem value="Paciente">Paciente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editingUser?.role === 'Especialista' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-area">Área</Label>
                  <Input
                    id="edit-area"
                    type="text"
                    value={editingUser?.area || ''}
                    onChange={(e) => setEditingUser(editingUser ? { ...editingUser, area: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialty">Especialidad</Label>
                  <Input
                    id="edit-specialty"
                    type="text"
                    value={editingUser?.specialty || ''}
                    onChange={(e) => setEditingUser(editingUser ? { ...editingUser, specialty: e.target.value } : null)}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                <Edit className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles del Usuario */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Detalles del Usuario
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    {selectedUser.username}
                  </CardTitle>
                  <CardDescription>Información General del Usuario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">ID del Usuario</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedUser.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Fecha de Creación</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es }) : 'Fecha no disponible'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Identificación</Label>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {selectedUser.identification_number}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Rol</Label>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                          {getRoleIcon(selectedUser.role)}
                          <span className="ml-1">{selectedUser.role}</span>
                        </span>
                      </div>
                    </div>
                    {selectedUser.area && (
                      <div>
                        <Label className="text-sm font-medium">Área</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedUser.area}</p>
                      </div>
                    )}
                  </div>
                  {selectedUser.specialty && (
                    <div>
                      <Label className="text-sm font-medium">Especialidad</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedUser.specialty}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminar Usuario */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar Usuario
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar al usuario "{userToDelete?.username}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
} 