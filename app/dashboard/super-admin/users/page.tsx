'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { DataTable } from '@/components/ui/data-table';
import { RoleBadge } from '@/components/ui/badge';
import { userService } from '@/services/user.service';
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
  Save
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function GlobalUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    role: '' as UserRole,
    identification_number: '',
    area: '',
    specialty: '',
    tenant_id: ''
  });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);
        setFilteredUsers(allUsers);
        setLoading(false);
      } catch (error) {
        setError('Error al cargar usuarios');
        setLoading(false);
      }
    };

    if (user?.role === 'Super Admin') {
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.identification_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username || '',
      email: user.email || '',
      role: user.role as UserRole,
      identification_number: user.identification_number || '',
      area: user.area || '',
      specialty: user.specialty || '',
      tenant_id: user.tenant_id?.toString() || ''
    });
    setEditModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    setSaving(true);
    try {
      const updateData = {
        ...editFormData,
        tenant_id: editFormData.tenant_id ? parseInt(editFormData.tenant_id) : null
      };

      await userService.updateUser(selectedUser.id, updateData);
      
      // Actualizar la lista de usuarios
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { ...u, ...updateData } : u
      );
      setUsers(updatedUsers);
      
      toast.success('Usuario actualizado correctamente');
      setEditModalOpen(false);
    } catch (error) {
      toast.error('Error al actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        toast.success('Usuario eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar usuario');
      }
    }
  };

  const columns = [
    {
      key: 'username',
      label: 'Usuario',
      render: (value: string, row: User) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (value: string) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rol',
      render: (value: string) => <RoleBadge role={value} />
    },
    {
      key: 'identification_number',
      label: 'Identificación',
      render: (value: string) => (
        <div className="flex items-center">
          <IdCard className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">{value || '-'}</span>
        </div>
      )
    },
    {
      key: 'tenant_id',
      label: 'Centro',
      render: (value: number) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {value ? `Centro ${value}` : 'Sin centro'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: User) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewUser(row);
            }}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            title="Ver usuario"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(row);
            }}
            className="text-green-600 hover:text-green-800 hover:bg-green-50"
            title="Editar usuario"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(row.id);
            }}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            title="Eliminar usuario"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

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
        <Link href="/dashboard/super-admin/users/new">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </Link>
      </DashboardHeader>

      {/* Filtros y búsqueda */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios por nombre, email o identificación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 border border-blue-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Todos los roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Administrador">Administrador</option>
              <option value="Especialista">Especialista</option>
              <option value="Paciente">Paciente</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabla de usuarios */}
      <DataTable 
        columns={columns} 
        data={filteredUsers}
        className="mt-6"
      />

      {/* Estadísticas */}
      <div className="grid gap-6 mt-8 md:grid-cols-4">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-blue-900">{users.length}</div>
              <div className="text-blue-700">Total Usuarios</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-600 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-yellow-900">
                {users.filter(u => u.role === 'Especialista').length}
              </div>
              <div className="text-yellow-700">Especialistas</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-600 rounded-full">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-900">
                {users.filter(u => u.role === 'Paciente').length}
              </div>
              <div className="text-green-700">Pacientes</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-600 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-indigo-900">
                {users.filter(u => u.role === 'Administrador').length}
              </div>
              <div className="text-indigo-700">Administradores</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Vista */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Detalles del Usuario - ${selectedUser?.username}`}
        size="lg"
      >
        {selectedUser && (
          <div className="grid gap-6">
            {/* Información básica */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-900">
                <UserIcon className="mr-2 h-5 w-5" />
                Información Básica
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre de Usuario</label>
                  <p className="text-lg font-medium text-gray-900">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg flex items-center text-gray-900">
                    <Mail className="mr-2 h-4 w-4 text-blue-500" />
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rol</label>
                  <div className="mt-1">
                    <RoleBadge role={selectedUser.role} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Número de Identificación</label>
                  <p className="text-lg flex items-center text-gray-900">
                    <IdCard className="mr-2 h-4 w-4 text-blue-500" />
                    {selectedUser.identification_number || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-green-900">
                <Building className="mr-2 h-5 w-5" />
                Información Adicional
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Centro Médico</label>
                  <p className="text-lg text-gray-900">
                    {selectedUser.tenant_id ? `Centro ${selectedUser.tenant_id}` : 'Sin centro asignado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Área</label>
                  <p className="text-lg text-gray-900">{selectedUser.area || 'No especificada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Especialidad</label>
                  <p className="text-lg text-gray-900">{selectedUser.specialty || 'No especificada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ID del Usuario</label>
                  <p className="text-lg font-mono text-gray-900">{selectedUser.id}</p>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-900">
                <Calendar className="mr-2 h-5 w-5" />
                Fechas del Sistema
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                  <p className="text-lg text-gray-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('es-ES') : 'No disponible'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Última Actualización</label>
                  <p className="text-lg text-gray-900">
                    {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('es-ES') : 'No disponible'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Edición */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Editar Usuario - ${selectedUser?.username}`}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
          <div className="grid gap-6">
            {/* Información básica */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-900">
                <UserIcon className="mr-2 h-5 w-5" />
                Información Básica
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario</label>
                  <Input
                    name="username"
                    value={editFormData.username}
                    onChange={handleInputChange}
                    required
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    required
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-blue-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Especialista">Especialista</option>
                    <option value="Paciente">Paciente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Identificación</label>
                  <Input
                    name="identification_number"
                    value={editFormData.identification_number}
                    onChange={handleInputChange}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-green-900">
                <Building className="mr-2 h-5 w-5" />
                Información Adicional
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Centro Médico (ID)</label>
                  <Input
                    name="tenant_id"
                    type="number"
                    value={editFormData.tenant_id}
                    onChange={handleInputChange}
                    placeholder="Dejar vacío para sin centro"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Área</label>
                  <Input
                    name="area"
                    value={editFormData.area}
                    onChange={handleInputChange}
                    placeholder="Ej: Medicina Interna"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                  <Input
                    name="specialty"
                    value={editFormData.specialty}
                    onChange={handleInputChange}
                    placeholder="Ej: Cardiología"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditModalOpen(false)}
                disabled={saving}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
} 