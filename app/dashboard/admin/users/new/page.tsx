'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userService } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/types/auth';

export default function NewUser() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    identification_number: '',
    area: '',
    specialty: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = {
        ...formData,
        role: formData.role as UserRole,
        tenant_id: user?.tenant_id || undefined
      };

      await userService.createUser({ ...userData, tenant_id: user?.tenant_id || undefined });
      router.push('/dashboard/admin/users');
    } catch (error) {
      setError('Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Nuevo Usuario"
        text="Crear un nuevo usuario para el centro médico"
      >
        <Link href="/dashboard/admin/users">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </DashboardHeader>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="username">Nombre de Usuario *</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ingrese el nombre de usuario"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingrese el email"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingrese la contraseña"
                required
              />
            </div>

            <div>
              <Label htmlFor="identification_number">Número de Identificación *</Label>
              <Input
                type="text"
                id="identification_number"
                name="identification_number"
                value={formData.identification_number}
                onChange={handleChange}
                placeholder="Ingrese el número de identificación"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="role">Rol *</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Seleccionar rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Especialista">Especialista</option>
                <option value="Paciente">Paciente</option>
              </select>
            </div>

            <div>
              <Label htmlFor="area">Área</Label>
              <Input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Ingrese el área (opcional)"
              />
            </div>
          </div>

          {formData.role === 'Especialista' && (
            <div>
              <Label htmlFor="specialty">Especialidad</Label>
              <select
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar especialidad</option>
                <option value="Cardiología">Cardiología</option>
                <option value="Dermatología">Dermatología</option>
                <option value="Endocrinología">Endocrinología</option>
                <option value="Gastroenterología">Gastroenterología</option>
                <option value="Ginecología">Ginecología</option>
                <option value="Neurología">Neurología</option>
                <option value="Oftalmología">Oftalmología</option>
                <option value="Ortopedia">Ortopedia</option>
                <option value="Pediatría">Pediatría</option>
                <option value="Psiquiatría">Psiquiatría</option>
                <option value="Radiología">Radiología</option>
                <option value="Urología">Urología</option>
                <option value="Medicina General">Medicina General</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <Link href="/dashboard/admin/users">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar Usuario'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
} 