'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  User, 
  Shield, 
  Save, 
  Edit, 
  Eye, 
  EyeOff,
  Calendar,
  Award,
  Building,
  IdCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProfileFormData {
  username: string;
  email: string;
  area?: string;
  specialty?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    email: '',
    area: '',
    specialty: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
        area: user?.area || '',
        specialty: user?.specialty || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Solo validar área y especialidad para especialistas
    if (user?.role === 'Especialista') {
      if (!formData.area?.trim()) {
        newErrors.area = 'El área es obligatoria';
      }

      if (!formData.specialty?.trim()) {
        newErrors.specialty = 'La especialidad es obligatoria';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la nueva contraseña';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const updatedUser = await authService.updateProfile({
        username: formData.username,
        email: formData.email,
        area: formData.area,
        specialty: formData.specialty
      });
      
      // Actualizar el contexto de autenticación
      updateUser(updatedUser);
      
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      setChangingPassword(true);
      
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      toast.success('Contraseña cambiada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'Super Admin': 'Super Administrador',
      'Administrador': 'Administrador',
      'Especialista': 'Especialista Médico',
      'Paciente': 'Paciente'
    };
    return roleNames[role] || role;
  };

  const isSpecialist = user?.role === 'Especialista';

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Mi Perfil"
        text="Gestiona tu información personal y profesional"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="w-full sm:w-auto"
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancelar Edición' : 'Editar Perfil'}
          </Button>
          {isEditing && (
            <Button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          )}
        </div>
      </DashboardHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Información Personal */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Datos básicos de tu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tu nombre de usuario"
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    placeholder="tu@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Profesional - Solo para especialistas */}
          {isSpecialist && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Award className="mr-2 h-5 w-5 text-green-600" />
                  Información Profesional
                </CardTitle>
                <CardDescription>
                  Datos sobre tu especialidad y área de trabajo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="area">Área Médica *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(value) => handleInputChange('area', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={errors.area ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona tu área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medicina General">Medicina General</SelectItem>
                        <SelectItem value="Cardiología">Cardiología</SelectItem>
                        <SelectItem value="Dermatología">Dermatología</SelectItem>
                        <SelectItem value="Endocrinología">Endocrinología</SelectItem>
                        <SelectItem value="Gastroenterología">Gastroenterología</SelectItem>
                        <SelectItem value="Ginecología">Ginecología</SelectItem>
                        <SelectItem value="Neurología">Neurología</SelectItem>
                        <SelectItem value="Oftalmología">Oftalmología</SelectItem>
                        <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                        <SelectItem value="Pediatría">Pediatría</SelectItem>
                        <SelectItem value="Psiquiatría">Psiquiatría</SelectItem>
                        <SelectItem value="Radiología">Radiología</SelectItem>
                        <SelectItem value="Urología">Urología</SelectItem>
                        <SelectItem value="Otra">Otra</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.area && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.area}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidad *</Label>
                    <Input
                      id="specialty"
                      value={formData.specialty}
                      onChange={(e) => handleInputChange('specialty', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tu especialidad médica"
                      className={errors.specialty ? 'border-red-500' : ''}
                    />
                    {errors.specialty && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.specialty}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Información de la cuenta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="mr-2 h-5 w-5 text-purple-600" />
                Información de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600 flex items-center">
                  <IdCard className="mr-2 h-4 w-4" />
                  Rol
                </Label>
                <p className="text-sm text-gray-900 font-medium">
                  {getRoleDisplayName(user?.role || '')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600 flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  Centro Médico
                </Label>
                <p className="text-sm text-gray-900">
                  {(user as any)?.tenant?.name || 'No asignado'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Miembro desde
                </Label>
                <p className="text-sm text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Estado
                </Label>
                <p className="text-sm text-green-600 font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cambiar contraseña */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="mr-2 h-5 w-5 text-red-600" />
                Cambiar Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Contraseña actual"
                    className={errors.currentPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Nueva contraseña"
                  className={errors.newPassword ? 'border-red-500' : ''}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.newPassword}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirmar nueva contraseña"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                className="w-full"
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cambiando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Información del perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Award className="mr-2 h-5 w-5 text-orange-600" />
                Información del Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-semibold truncate max-w-32" title={formData.email}>
                  {formData.email || 'No especificado'}
                </span>
              </div>
              
              {isSpecialist && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Área</span>
                    <span className="text-sm font-semibold">{formData.area || 'No especificada'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Especialidad</span>
                    <span className="text-sm font-semibold">{formData.specialty || 'No especificada'}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
} 