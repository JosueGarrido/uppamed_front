'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { 
  ArrowLeft,
  Edit,
  User as UserIcon,
  Mail,
  IdCard,
  Building,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function UserDetails() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params.userId as string;

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!userId) {
          setError('ID de usuario no válido');
          setLoading(false);
          return;
        }

        const userData = await userService.getUserById(parseInt(userId));
        setUser(userData);
        setLoading(false);
      } catch (error) {
        setError('Error al cargar los datos del usuario');
        setLoading(false);
      }
    };

    if (currentUser?.role === 'Super Admin') {
      loadUser();
    }
  }, [userId, currentUser]);

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
          <p>Cargando datos del usuario...</p>
        </div>
      </DashboardShell>
    );
  }

  if (error || !user) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Usuario no encontrado'}</p>
            <Button onClick={() => router.back()}>
              Volver
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Detalles del Usuario`}
        text={`Información completa de ${user.username}`}
      >
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Link href={`/dashboard/super-admin/users/${user.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar Usuario
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        {/* Información básica */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <UserIcon className="mr-2 h-5 w-5" />
            Información Básica
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre de Usuario</label>
              <p className="text-lg">{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-400" />
                {user.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Rol</label>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Número de Identificación</label>
              <p className="text-lg flex items-center">
                <IdCard className="mr-2 h-4 w-4 text-gray-400" />
                {user.identification_number || 'No especificado'}
              </p>
            </div>
          </div>
        </Card>

        {/* Información adicional */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Información Adicional
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Centro Médico</label>
              <p className="text-lg">
                {user.tenant_id ? `Centro ${user.tenant_id}` : 'Sin centro asignado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Área</label>
              <p className="text-lg">{user.area || 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Especialidad</label>
              <p className="text-lg">{user.specialty || 'No especificada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">ID del Usuario</label>
              <p className="text-lg font-mono">{user.id}</p>
            </div>
          </div>
        </Card>

        {/* Fechas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Fechas del Sistema
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
              <p className="text-lg">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Última Actualización</label>
              <p className="text-lg">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
} 