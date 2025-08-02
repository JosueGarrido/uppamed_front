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
  UserCheck, 
  UserPlus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  Mail, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Stethoscope
} from 'lucide-react';
import Link from 'next/link';

const AdminSpecialistsPage = () => {
  const [tenantId, setTenantId] = useState<string | number | null>(null);
  const [specialists, setSpecialists] = useState<User[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<User[]>([]);
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
  
  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [specialistsPerPage] = useState(10);

  const fetchSpecialists = async (tenantId: string | number) => {
    setIsLoading(true);
    try {
      const data = await userService.getUsersByTenant(tenantId);
      const filtered = data.filter((u: User) => u.role === 'Especialista');
      setSpecialists(filtered);
      setFilteredSpecialists(filtered);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error al obtener los especialistas');
      }
      setSpecialists([]);
      setFilteredSpecialists([]);
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

  // Filtrado por búsqueda
  useEffect(() => {
    let filtered = specialists;

    if (searchTerm) {
      filtered = filtered.filter(specialist =>
        specialist.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (specialist.area && specialist.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (specialist.specialty && specialist.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSpecialists(filtered);
    setCurrentPage(1);
  }, [specialists, searchTerm]);

  // Paginación
  const indexOfLastSpecialist = currentPage * specialistsPerPage;
  const indexOfFirstSpecialist = indexOfLastSpecialist - specialistsPerPage;
  const currentSpecialists = filteredSpecialists.slice(indexOfFirstSpecialist, indexOfLastSpecialist);
  const totalPages = Math.ceil(filteredSpecialists.length / specialistsPerPage);

  const handleCreateSpecialist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setCreating(true);
    try {
      await userService.createUser({ ...newSpecialist, role: newSpecialist.role as UserRole, tenant_id: typeof tenantId === 'string' ? parseInt(tenantId) : tenantId });
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
    if (!editingSpecialist || !tenantId) return;
    setUpdating(true);
    try {
      await userService.updateUser(editingSpecialist.id, {
        username: editingSpecialist.username,
        email: editingSpecialist.email,
        area: editingSpecialist.area,
        specialty: editingSpecialist.specialty,
      });
      toast.success('Especialista actualizado exitosamente');
      setShowEditModal(false);
      setEditingSpecialist(null);
      await fetchSpecialists(tenantId);
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
    setDetailSpecialist(specialist);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando especialistas...</p>
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
        heading="Gestión de Especialistas"
        text="Administra los especialistas del centro médico"
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Crear Especialista</span>
            <span className="sm:hidden">Crear</span>
          </Button>
        </div>
      </DashboardHeader>

      {/* Búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar especialistas por nombre, email, área o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600 px-2">
          {filteredSpecialists.length} especialista{filteredSpecialists.length !== 1 ? 's' : ''} encontrado{filteredSpecialists.length !== 1 ? 's' : ''}
        </div>
      </Card>

      {/* Lista de Especialistas */}
      <Card className="p-4">
        {currentSpecialists.length > 0 ? (
          <div className="space-y-4">
            {currentSpecialists.map((specialist) => (
              <div key={specialist.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{specialist.username}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Especialista
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                      <div className="flex items-center text-sm text-gray-500 min-w-0">
                        <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] overflow-hidden">
                          {specialist.email}
                        </span>
                      </div>
                    </div>
                    {(specialist.area || specialist.specialty) && (
                      <div className="mt-1 text-sm text-gray-500">
                        {specialist.area && <span className="mr-2">Área: {specialist.area}</span>}
                        {specialist.specialty && <span>Especialidad: {specialist.specialty}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4 lg:mt-0 flex-1 sm:flex-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDetailModal(specialist)}
                    className="flex-1 sm:flex-none min-w-[80px]"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Ver</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(specialist)}
                    className="flex-1 sm:flex-none min-w-[80px]"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteModal(specialist)}
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
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron especialistas
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Intenta ajustar los términos de búsqueda'
                : 'Comienza creando el primer especialista del centro médico'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Primer Especialista
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
              Mostrando {indexOfFirstSpecialist + 1} a {Math.min(indexOfLastSpecialist, filteredSpecialists.length)} de {filteredSpecialists.length} especialistas
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
              Crear Nuevo Especialista
            </DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo especialista. Los campos marcados con * son requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSpecialist} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario *</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={newSpecialist.username}
                  onChange={e => setNewSpecialist({ ...newSpecialist, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={newSpecialist.email}
                  onChange={e => setNewSpecialist({ ...newSpecialist, email: e.target.value })}
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
                  value={newSpecialist.password}
                  onChange={e => setNewSpecialist({ ...newSpecialist, password: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Área *</Label>
                <Input
                  id="area"
                  type="text"
                  required
                  value={newSpecialist.area}
                  onChange={e => setNewSpecialist({ ...newSpecialist, area: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad *</Label>
                <Input
                  id="specialty"
                  type="text"
                  required
                  value={newSpecialist.specialty}
                  onChange={e => setNewSpecialist({ ...newSpecialist, specialty: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={creating} className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                {creating ? 'Creando...' : 'Crear Especialista'}
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
              Editar Especialista
            </DialogTitle>
            <DialogDescription>
              Modifica la información del especialista seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editingSpecialist && (
            <form onSubmit={handleEditSpecialist} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Nombre de Usuario *</Label>
                  <Input
                    id="edit-username"
                    type="text"
                    required
                    value={editingSpecialist.username}
                    onChange={e => setEditingSpecialist({ ...editingSpecialist, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    required
                    value={editingSpecialist.email}
                    onChange={e => setEditingSpecialist({ ...editingSpecialist, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-area">Área *</Label>
                  <Input
                    id="edit-area"
                    type="text"
                    required
                    value={editingSpecialist.area || ''}
                    onChange={e => setEditingSpecialist({ ...editingSpecialist, area: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialty">Especialidad *</Label>
                  <Input
                    id="edit-specialty"
                    type="text"
                    required
                    value={editingSpecialist.specialty || ''}
                    onChange={e => setEditingSpecialist({ ...editingSpecialist, specialty: e.target.value })}
                  />
                </div>
              </div>
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
      <Dialog open={!!specialistToDelete} onOpenChange={(open) => !open && setSpecialistToDelete(null)}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar Especialista
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el especialista "{specialistToDelete?.username}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSpecialistToDelete(null)} disabled={deleting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteSpecialist} disabled={deleting} className="w-full sm:w-auto">
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
              Detalles del Especialista
            </DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="p-8 text-center text-gray-500">Cargando detalles...</div>
          ) : detailSpecialist && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID</Label>
                  <p className="text-sm text-gray-600 mt-1">{detailSpecialist.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nombre de Usuario</Label>
                  <p className="text-sm text-gray-600 mt-1">{detailSpecialist.username}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-gray-600 mt-1 flex items-center min-w-0">
                  <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] overflow-hidden">
                    {detailSpecialist.email}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Área</Label>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    {detailSpecialist.area || 'No especificada'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Especialidad</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {detailSpecialist.specialty || 'No especificada'}
                  </p>
                </div>
              </div>
              {detailSpecialist.createdAt && (
                <div>
                  <Label className="text-sm font-medium">Fecha de Creación</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(detailSpecialist.createdAt).toLocaleDateString('es-ES', {
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

export default AdminSpecialistsPage; 