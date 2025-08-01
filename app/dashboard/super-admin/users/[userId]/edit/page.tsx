'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userService } from '@/services/user.service';
import { User, UserRole } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { 
  ArrowLeft,
  Save,
  User as UserIcon,
  Mail,
  IdCard,
  Building,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export default function EditUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '' as UserRole,
    identification_number: '',
    area: '',
    specialty: '',
    tenant_id: ''
  });
  
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
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          role: userData.role as UserRole,
          identification_number: userData.identification_number || '',
          area: userData.area || '',
          specialty: userData.specialty || '',
          tenant_id: userData.tenant_id?.toString() || ''
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        tenant_id: formData.tenant_id ? parseInt(formData.tenant_id) : null
      };

      await userService.updateUser(parseInt(userId), updateData);
      toast.success('Usuario actualizado correctamente');
      router.push(`/dashboard/super-admin/users/${userId}`);
    } catch (error) {
      toast.error('Error al actualizar el usuario');
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
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
        heading={`Editar Usuario`}
        text={`Modificar información de ${user.username}`}
      >
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </DashboardHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Información básica */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              Información Básica
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
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
                <Label htmlFor="identification_number">Número de Identificación</Label>
                <Input
                  id="identification_number"
                  name="identification_number"
                  value={formData.identification_number}
                  onChange={handleInputChange}
                />
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
                <Label htmlFor="tenant_id">Centro Médico (ID)</Label>
                <Input
                  id="tenant_id"
                  name="tenant_id"
                  type="number"
                  value={formData.tenant_id}
                  onChange={handleInputChange}
                  placeholder="Dejar vacío para sin centro"
                />
              </div>
              <div>
                <Label htmlFor="area">Área</Label>
                <Input
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Ej: Medicina Interna"
                />
              </div>
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  placeholder="Ej: Cardiología"
                />
              </div>
            </div>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </form>
    </DashboardShell>
  );
} 