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
import { useAuth } from '@/context/AuthContext';
import { 
  UserX, 
  UserPlus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  Mail, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const AdminPatientsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [tenantId, setTenantId] = useState<string | number | null>(null);
  const [patients, setPatients] = useState<User[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPatient, setNewPatient] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Paciente' as UserRole,
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
  
  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);

  const fetchPatients = async (tenantId: string | number) => {
    setIsLoading(true);
    try {
      const data = await userService.getUsersByTenant(tenantId);
      const filtered = data.filter((u: User) => u.role === 'Paciente');
      setPatients(filtered);
      setFilteredPatients(filtered);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error al obtener los pacientes');
      }
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.tenant_id) {
      setTenantId(user.tenant_id);
      setIsLoading(true);
      
      const loadData = async () => {
        try {
          await fetchPatients(user.tenant_id!);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError('No se pudo cargar los pacientes');
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      void loadData();
    } else if (!authLoading && !user) {
      setError('Usuario no autenticado');
      setIsLoading(false);
    }
  }, [authLoading, user]);

  // Filtrado por búsqueda
  useEffect(() => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.identification_number && patient.identification_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [patients, searchTerm]);

  // Paginación
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setCreating(true);
    try {
      await userService.createUser({ ...newPatient, role: newPatient.role as UserRole, tenant_id: typeof tenantId === 'string' ? parseInt(tenantId) : tenantId });
      toast.success('Paciente creado exitosamente');
      setShowCreateModal(false);
      setNewPatient({ username: '', email: '', password: '', role: 'Paciente' as UserRole, identification_number: '' });
      await fetchPatients(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al crear el paciente');
      }
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
    if (!editingPatient || !tenantId) return;
    setUpdating(true);
    try {
      await userService.updateUser(editingPatient.id, {
        username: editingPatient.username,
        email: editingPatient.email,
        identification_number: editingPatient.identification_number,
      });
      toast.success('Paciente actualizado exitosamente');
      setShowEditModal(false);
      setEditingPatient(null);
      await fetchPatients(tenantId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al actualizar el paciente');
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al eliminar el paciente');
      }
    } finally {
      setDeleting(false);
    }
  };

  const openDetailModal = async (patient: User) => {
    setDetailPatient(patient);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pacientes...</p>
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
        heading="Gestión de Pacientes"
        text="Administra los pacientes del centro médico"
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Crear Paciente</span>
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
              placeholder="Buscar pacientes por nombre, email o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600 px-2">
          {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} encontrado{filteredPatients.length !== 1 ? 's' : ''}
        </div>
      </Card>

      {/* Lista de Pacientes */}
      <Card className="p-4">
        {currentPatients.length > 0 ? (
          <div className="space-y-4">
            {currentPatients.map((patient) => (
              <div key={patient.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <UserX className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{patient.username}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Paciente
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                      <div className="flex items-center text-sm text-gray-500 min-w-0">
                        <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] overflow-hidden">
                          {patient.email}
                        </span>
                      </div>
                      {patient.identification_number && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {patient.identification_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4 lg:mt-0 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetailModal(patient)}
                    className="flex-1 sm:flex-none min-w-[80px]"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Ver</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(patient)}
                    className="flex-1 sm:flex-none min-w-[80px]"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteModal(patient)}
                    className="flex-1 sm:flex-none min-w-[80px]"
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
            <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron pacientes
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Intenta ajustar los términos de búsqueda'
                : 'Comienza creando el primer paciente del centro médico'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Primer Paciente
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
              Mostrando {indexOfFirstPatient + 1} a {Math.min(indexOfLastPatient, filteredPatients.length)} de {filteredPatients.length} pacientes
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
              Crear Nuevo Paciente
            </DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo paciente. Los campos marcados con * son requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePatient} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario *</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={newPatient.username}
                  onChange={e => setNewPatient({ ...newPatient, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={newPatient.email}
                  onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
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
                  value={newPatient.password}
                  onChange={e => setNewPatient({ ...newPatient, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identification_number">Número de Identificación *</Label>
                <Input
                  id="identification_number"
                  type="text"
                  required
                  value={newPatient.identification_number}
                  onChange={e => setNewPatient({ ...newPatient, identification_number: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={creating} className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                {creating ? 'Creando...' : 'Crear Paciente'}
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
              Editar Paciente
            </DialogTitle>
            <DialogDescription>
              Modifica la información del paciente seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editingPatient && (
            <form onSubmit={handleEditPatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Nombre de Usuario *</Label>
                  <Input
                    id="edit-username"
                    type="text"
                    required
                    value={editingPatient.username}
                    onChange={e => setEditingPatient({ ...editingPatient, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    required
                    value={editingPatient.email}
                    onChange={e => setEditingPatient({ ...editingPatient, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-identification_number">Número de Identificación *</Label>
                <Input
                  id="edit-identification_number"
                  type="text"
                  required
                  value={editingPatient.identification_number || ''}
                  onChange={e => setEditingPatient({ ...editingPatient, identification_number: e.target.value })}
                />
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
      <Dialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar Paciente
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el paciente "{patientToDelete?.username}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setPatientToDelete(null)} disabled={deleting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletePatient} disabled={deleting} className="w-full sm:w-auto">
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
              Detalles del Paciente
            </DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="p-8 text-center text-gray-500">Cargando detalles...</div>
          ) : detailPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID</Label>
                  <p className="text-sm text-gray-600 mt-1">{detailPatient.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nombre de Usuario</Label>
                  <p className="text-sm text-gray-600 mt-1">{detailPatient.username}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-gray-600 mt-1 flex items-center min-w-0">
                  <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] overflow-hidden">
                    {detailPatient.email}
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Número de Identificación</Label>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {detailPatient.identification_number}
                </p>
              </div>
              {detailPatient.createdAt && (
                <div>
                  <Label className="text-sm font-medium">Fecha de Creación</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(detailPatient.createdAt).toLocaleDateString('es-ES', {
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

export default AdminPatientsPage; 