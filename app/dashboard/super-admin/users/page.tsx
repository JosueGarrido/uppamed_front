'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RoleBadge } from '@/components/ui/badge';
import { userService } from '@/services/user.service';
import { tenantService } from '@/services/tenant.service';
import { User, UserRole } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  User as UserIcon,
  Mail,
  IdCard,
  Building,
  Calendar,
  Shield,
  Save,
  Plus,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Tenant {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

export default function GlobalUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    role: '' as UserRole,
    identification_number: '',
    area: '',
    specialty: '',
    tenant_id: ''
  });
  const [createFormData, setCreateFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '' as UserRole,
    identification_number: '',
    area: '',
    specialty: '',
    tenant_id: ''
  });
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allUsers, allTenants] = await Promise.all([
          userService.getAllUsers(),
          tenantService.getAllTenants()
        ]);
        setUsers(allUsers);
        setFilteredUsers(allUsers);
        setTenants(allTenants);
        setLoading(false);
      } catch (error) {
        setError('Error al cargar datos');
        setLoading(false);
      }
    };

    if (user?.role === 'Super Admin') {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.identification_number && user.identification_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const getTenantName = (tenantId: number | null | undefined) => {
    if (!tenantId) return 'Sin asignar';
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : 'Centro no encontrado';
  };

  // Calcular índices para paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      identification_number: user.identification_number || '',
      area: user.area || '',
      specialty: user.specialty || '',
      tenant_id: user.tenant_id?.toString() || ''
    });
    setEditModalOpen(true);
  };

  const openCreateModal = () => {
    setCreateFormData({
      username: '',
      email: '',
      password: '',
      role: 'Paciente' as UserRole,
      identification_number: '',
      area: '',
      specialty: '',
      tenant_id: ''
    });
    setCreateModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCreateFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    setSaving(true);
    try {
      await userService.updateUser(selectedUser.id, {
        ...editFormData,
        role: editFormData.role as UserRole,
        tenant_id: editFormData.tenant_id ? parseInt(editFormData.tenant_id) : undefined
      });
      
      // Actualizar la lista de usuarios
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...editFormData, tenant_id: editFormData.tenant_id ? parseInt(editFormData.tenant_id) : null }
          : u
      );
      setUsers(updatedUsers);
      
      setEditModalOpen(false);
      setSelectedUser(null);
      toast.success('Usuario actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async () => {
    setCreating(true);
    try {
      const userData: Partial<User> & { tenant_id?: number } = {
        username: createFormData.username,
        email: createFormData.email,
        password: createFormData.password,
        role: createFormData.role as UserRole,
        identification_number: createFormData.identification_number,
        area: createFormData.area,
        specialty: createFormData.specialty
      };
      
      // Solo incluir tenant_id si no es Super Admin
      if (createFormData.role !== 'Super Admin' && createFormData.tenant_id) {
        userData.tenant_id = parseInt(createFormData.tenant_id);
      }
      
      await userService.createUser(userData);
      
      // Recargar la lista de usuarios
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      
      setCreateModalOpen(false);
      setCreateFormData({
        username: '',
        email: '',
        password: '',
        role: 'Paciente' as UserRole,
        identification_number: '',
        area: '',
        specialty: '',
        tenant_id: ''
      });
      toast.success('Usuario creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el usuario');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      
      // Actualizar la lista de usuarios
      const updatedUsers = users.filter(u => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      
      setDeleteModalOpen(false);
      setUserToDelete(null);
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el usuario');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
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
        heading="Gestión de Usuarios Globales"
        text="Administra todos los usuarios del sistema médico"
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Usuario</span>
            <span className="sm:hidden">Crear Usuario</span>
          </Button>
        </div>
      </DashboardHeader>

      {/* Filtros y búsqueda */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5 flex-shrink-0" />
            Filtros y Búsqueda
          </CardTitle>
          <CardDescription>
            Busca y filtra usuarios por diferentes criterios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios por nombre, email o identificación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white text-gray-700 w-full sm:w-48 flex-shrink-0"
              >
                <option value="">Todos los roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Administrador">Administrador</option>
                <option value="Especialista">Especialista</option>
                <option value="Paciente">Paciente</option>
              </select>
            </div>
          </div>
          {(searchTerm || roleFilter) && (
            <p className="text-sm text-gray-500 text-center sm:text-left mt-2 px-2">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 flex-shrink-0" />
            Usuarios Registrados
          </CardTitle>
          <CardDescription>
            Lista de todos los usuarios en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentUsers.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || roleFilter ? 'No se encontraron usuarios' : 'No hay usuarios'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter ? 'Intenta con otros filtros.' : 'Comienza creando el primer usuario.'}
              </p>
              {!searchTerm && !roleFilter && (
                <div className="mt-6">
                  <Button onClick={openCreateModal} className="w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Primer Usuario
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4 w-full">
                {currentUsers.map((user) => (
                  <div key={user.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors w-full overflow-hidden">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0 min-w-0 flex-1 max-w-full">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 max-w-full overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate min-w-0">{user.username}</h3>
                          <RoleBadge role={user.role} />
                        </div>
                        <div className="text-sm text-gray-500 flex items-center min-w-0">
                          <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                          <div className="truncate min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] overflow-hidden">
                            {user.email}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 truncate min-w-0">
                          {getTenantName(user.tenant_id)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="flex-1 sm:flex-none min-w-[80px]"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="flex-1 sm:flex-none min-w-[80px]"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="flex-1 sm:flex-none min-w-[80px]"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 px-2">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* Botones de navegación */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex-1 sm:flex-none"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Anterior</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex-1 sm:flex-none"
                      >
                        <span className="hidden sm:inline">Siguiente</span>
                        <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                      </Button>
                    </div>
                    
                    {/* Números de página */}
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      {totalPages <= 7 ? (
                        // Si hay 7 páginas o menos, mostrar todas
                        Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10 h-10 p-0 text-sm"
                          >
                            {page}
                          </Button>
                        ))
                      ) : (
                        // Si hay más de 7 páginas, mostrar paginación inteligente
                        <>
                          {/* Primera página */}
                          <Button
                            variant={currentPage === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            className="w-10 h-10 p-0 text-sm"
                          >
                            1
                          </Button>
                          
                          {/* Puntos suspensivos iniciales */}
                          {currentPage > 4 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          
                          {/* Páginas alrededor de la actual */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => 
                              page !== 1 && 
                              page !== totalPages && 
                              page >= currentPage - 1 && 
                              page <= currentPage + 1
                            )
                            .map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-10 h-10 p-0 text-sm"
                              >
                                {page}
                              </Button>
                            ))}
                          
                          {/* Puntos suspensivos finales */}
                          {currentPage < totalPages - 3 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          
                          {/* Última página */}
                          <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-10 h-10 p-0 text-sm"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{users.length}</div>
                <div className="text-sm sm:text-base text-gray-600">Total Usuarios</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-full flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'Especialista').length}
                </div>
                <div className="text-sm sm:text-base text-gray-600">Especialistas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0">
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'Paciente').length}
                </div>
                <div className="text-sm sm:text-base text-gray-600">Pacientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'Administrador').length}
                </div>
                <div className="text-sm sm:text-base text-gray-600">Administradores</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Vista */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="w-[95vw] max-w-[625px] max-h-[90vh] overflow-y-auto">
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
                    <UserIcon className="mr-2 h-5 w-5" />
                    {selectedUser.username}
                  </CardTitle>
                  <CardDescription>Información General del Usuario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-gray-600 mt-1 flex items-center min-w-0">
                        <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate min-w-0 max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] overflow-hidden">
                          {selectedUser.email}
                        </span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Rol</Label>
                      <div className="mt-1">
                        <RoleBadge role={selectedUser.role} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Identificación</Label>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <IdCard className="h-4 w-4 mr-1" />
                        {selectedUser.identification_number || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Centro Médico</Label>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {getTenantName(selectedUser.tenant_id)}
                      </p>
                    </div>
                  </div>
                  {selectedUser.role === 'Especialista' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Área</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedUser.area || 'No especificada'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Especialidad</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedUser.specialty || 'No especificada'}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">ID del Usuario</Label>
                    <p className="text-sm text-gray-600 mt-1 font-mono">{selectedUser.id}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setViewModalOpen(false)} className="w-full sm:w-auto">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edición */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5" />
              Editar Usuario
            </DialogTitle>
            <DialogDescription>
              Modifica la información del usuario. Los campos marcados con * son requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Nombre de Usuario *</Label>
              <Input
                id="edit-username"
                name="username"
                value={editFormData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol *</Label>
              <select
                id="edit-role"
                name="role"
                value={editFormData.role}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                required
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Administrador">Administrador</option>
                <option value="Especialista">Especialista</option>
                <option value="Paciente">Paciente</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-identification">Número de Identificación</Label>
              <Input
                id="edit-identification"
                name="identification_number"
                value={editFormData.identification_number}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tenant">Centro Médico</Label>
              <select
                id="edit-tenant"
                name="tenant_id"
                value={editFormData.tenant_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <option value="">Sin asignar</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
            {editFormData.role === 'Especialista' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-area">Área</Label>
                  <Input
                    id="edit-area"
                    name="area"
                    value={editFormData.area}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialty">Especialidad</Label>
                  <Input
                    id="edit-specialty"
                    name="specialty"
                    value={editFormData.specialty}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Creación */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
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
          <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-username">Nombre de Usuario *</Label>
              <Input
                id="create-username"
                name="username"
                value={createFormData.username}
                onChange={handleCreateInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                name="email"
                type="email"
                value={createFormData.email}
                onChange={handleCreateInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Contraseña *</Label>
              <Input
                id="create-password"
                name="password"
                type="password"
                value={createFormData.password}
                onChange={handleCreateInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Rol *</Label>
              <select
                id="create-role"
                name="role"
                value={createFormData.role}
                onChange={handleCreateInputChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                required
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Administrador">Administrador</option>
                <option value="Especialista">Especialista</option>
                <option value="Paciente">Paciente</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-identification">Número de Identificación</Label>
              <Input
                id="create-identification"
                name="identification_number"
                value={createFormData.identification_number}
                onChange={handleCreateInputChange}
              />
            </div>
            {createFormData.role !== 'Super Admin' && (
              <div className="space-y-2">
                <Label htmlFor="create-tenant">Centro Médico</Label>
                <select
                  id="create-tenant"
                  name="tenant_id"
                  value={createFormData.tenant_id}
                  onChange={handleCreateInputChange}
                  className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <option value="">Sin asignar</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {createFormData.role === 'Especialista' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="create-area">Área</Label>
                  <Input
                    id="create-area"
                    name="area"
                    value={createFormData.area}
                    onChange={handleCreateInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-specialty">Especialidad</Label>
                  <Input
                    id="create-specialty"
                    name="specialty"
                    value={createFormData.specialty}
                    onChange={handleCreateInputChange}
                  />
                </div>
              </>
            )}
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)} className="w-full sm:w-auto">
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

      {/* Modal de Eliminación */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
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
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={deleting} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
} 