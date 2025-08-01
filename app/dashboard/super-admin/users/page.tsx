'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userService } from '@/services/user.service';
import { User } from '@/types/auth';
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
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function GlobalUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Para Super Admin, necesitamos obtener todos los usuarios de todos los tenants
        // Por ahora, usaremos una llamada que obtenga todos los usuarios
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

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.identification_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por rol
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleDeleteUser = async (userId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        setError('Error al eliminar usuario');
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-red-100 text-red-800';
      case 'Administrador':
        return 'bg-blue-100 text-blue-800';
      case 'Especialista':
        return 'bg-purple-100 text-purple-800';
      case 'Paciente':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p>Cargando usuarios...</p>
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
        heading="Usuarios Globales"
        text="Gestiona todos los usuarios del sistema"
      >
        <Link href="/dashboard/super-admin/users/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </Link>
      </DashboardHeader>

      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 border rounded-md"
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

      {/* Lista de usuarios */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Usuario</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Rol</th>
                <th className="text-left p-2">Identificación</th>
                <th className="text-left p-2">Centro</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                    </div>
                  </td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-2">{user.identification_number || '-'}</td>
                  <td className="p-2">
                    {user.tenant_id ? `Centro ${user.tenant_id}` : 'Sin centro'}
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        )}
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-gray-600">Total Usuarios</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {users.filter(u => u.role === 'Especialista').length}
          </div>
          <div className="text-gray-600">Especialistas</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {users.filter(u => u.role === 'Paciente').length}
          </div>
          <div className="text-gray-600">Pacientes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {users.filter(u => u.role === 'Administrador').length}
          </div>
          <div className="text-gray-600">Administradores</div>
        </Card>
      </div>
    </DashboardShell>
  );
} 