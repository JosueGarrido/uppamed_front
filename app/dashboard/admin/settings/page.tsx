"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Users, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface TenantConfig {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  businessHours: {
    monday: { open: string; close: string; enabled: boolean };
    tuesday: { open: string; close: string; enabled: boolean };
    wednesday: { open: string; close: string; enabled: boolean };
    thursday: { open: string; close: string; enabled: boolean };
    friday: { open: string; close: string; enabled: boolean };
    saturday: { open: string; close: string; enabled: boolean };
    sunday: { open: string; close: string; enabled: boolean };
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    newUserNotifications: boolean;
    systemAlerts: boolean;
  };
  security: {
    sessionTimeout: number;
    requireTwoFactor: boolean;
    passwordPolicy: string;
    maxLoginAttempts: number;
  };
  appointments: {
    maxAppointmentsPerDay: number;
    appointmentDuration: number;
    allowOverbooking: boolean;
    cancellationPolicy: string;
  };
}

export default function AdminSettings() {
  const { user, isLoading } = useAuth();
  const [config, setConfig] = useState<TenantConfig>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    businessHours: {
      monday: { open: '08:00', close: '18:00', enabled: true },
      tuesday: { open: '08:00', close: '18:00', enabled: true },
      wednesday: { open: '08:00', close: '18:00', enabled: true },
      thursday: { open: '08:00', close: '18:00', enabled: true },
      friday: { open: '08:00', close: '18:00', enabled: true },
      saturday: { open: '09:00', close: '14:00', enabled: true },
      sunday: { open: '09:00', close: '14:00', enabled: false },
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      newUserNotifications: true,
      systemAlerts: true,
    },
    security: {
      sessionTimeout: 30,
      requireTwoFactor: false,
      passwordPolicy: 'medium',
      maxLoginAttempts: 5,
    },
    appointments: {
      maxAppointmentsPerDay: 50,
      appointmentDuration: 30,
      allowOverbooking: false,
      cancellationPolicy: '24 horas antes',
    },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role === 'Administrador') {
      loadConfig();
    }
  }, [user, isLoading]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      // Aquí cargarías la configuración real desde el backend
      // Por ahora usamos datos de ejemplo
      setConfig({
        name: 'Centro Médico UppaMed',
        description: 'Centro médico especializado en atención integral',
        address: 'Av. Principal 123, Ciudad',
        phone: '+1 234 567 8900',
        email: 'contacto@uppamed.com',
        website: 'https://uppamed.com',
        businessHours: {
          monday: { open: '08:00', close: '18:00', enabled: true },
          tuesday: { open: '08:00', close: '18:00', enabled: true },
          wednesday: { open: '08:00', close: '18:00', enabled: true },
          thursday: { open: '08:00', close: '18:00', enabled: true },
          friday: { open: '08:00', close: '18:00', enabled: true },
          saturday: { open: '09:00', close: '14:00', enabled: true },
          sunday: { open: '09:00', close: '14:00', enabled: false },
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          appointmentReminders: true,
          newUserNotifications: true,
          systemAlerts: true,
        },
        security: {
          sessionTimeout: 30,
          requireTwoFactor: false,
          passwordPolicy: 'medium',
          maxLoginAttempts: 5,
        },
        appointments: {
          maxAppointmentsPerDay: 50,
          appointmentDuration: 30,
          allowOverbooking: false,
          cancellationPolicy: '24 horas antes',
        },
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar la configuración' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Aquí guardarías la configuración en el backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof TenantConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBusinessHoursChange = (day: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'Administrador') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="mt-2 text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la configuración general del centro médico
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadConfig} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Recargar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información General
            </CardTitle>
            <CardDescription>
              Datos básicos del centro médico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Centro</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => handleInputChange('name', 'name', e.target.value)}
                placeholder="Nombre del centro médico"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => handleInputChange('description', 'description', e.target.value)}
                placeholder="Descripción del centro médico"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={config.address}
                onChange={(e) => handleInputChange('address', 'address', e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={config.phone}
                  onChange={(e) => handleInputChange('phone', 'phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => handleInputChange('email', 'email', e.target.value)}
                  placeholder="contacto@centro.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={config.website}
                onChange={(e) => handleInputChange('website', 'website', e.target.value)}
                placeholder="https://centro.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Horarios de Atención */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Horarios de Atención
            </CardTitle>
            <CardDescription>
              Configura los horarios de trabajo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(config.businessHours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <Switch
                    checked={hours.enabled}
                    onCheckedChange={(checked) => handleBusinessHoursChange(day, 'enabled', checked)}
                  />
                  <Label className="capitalize">{day}</Label>
                </div>
                {hours.enabled && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                      className="w-24"
                    />
                    <span>a</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configuración de Notificaciones
            </CardTitle>
            <CardDescription>
              Gestiona las notificaciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-gray-600">Enviar notificaciones por correo electrónico</p>
              </div>
              <Switch
                checked={config.notifications.emailNotifications}
                onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones SMS</Label>
                <p className="text-sm text-gray-600">Enviar notificaciones por mensaje de texto</p>
              </div>
              <Switch
                checked={config.notifications.smsNotifications}
                onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'smsNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Recordatorios de Citas</Label>
                <p className="text-sm text-gray-600">Enviar recordatorios automáticos</p>
              </div>
              <Switch
                checked={config.notifications.appointmentReminders}
                onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'appointmentReminders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones de Nuevos Usuarios</Label>
                <p className="text-sm text-gray-600">Notificar cuando se registren nuevos usuarios</p>
              </div>
              <Switch
                checked={config.notifications.newUserNotifications}
                onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'newUserNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas del Sistema</Label>
                <p className="text-sm text-gray-600">Recibir alertas sobre problemas del sistema</p>
              </div>
              <Switch
                checked={config.notifications.systemAlerts}
                onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'systemAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuración de Seguridad
            </CardTitle>
            <CardDescription>
              Ajustes de seguridad y autenticación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
              <Select
                value={config.security.sessionTimeout.toString()}
                onValueChange={(value) => handleInputChange('security', 'sessionTimeout', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-gray-600">Requerir 2FA para todos los usuarios</p>
              </div>
              <Switch
                checked={config.security.requireTwoFactor}
                onCheckedChange={(checked: boolean) => handleInputChange('security', 'requireTwoFactor', checked)}
              />
            </div>
            <div>
              <Label htmlFor="passwordPolicy">Política de Contraseñas</Label>
              <Select
                value={config.security.passwordPolicy}
                onValueChange={(value) => handleInputChange('security', 'passwordPolicy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja (6 caracteres)</SelectItem>
                  <SelectItem value="medium">Media (8 caracteres, mayúsculas y números)</SelectItem>
                  <SelectItem value="high">Alta (10 caracteres, símbolos especiales)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Intentos Máximos de Login</Label>
              <Select
                value={config.security.maxLoginAttempts.toString()}
                onValueChange={(value) => handleInputChange('security', 'maxLoginAttempts', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 intentos</SelectItem>
                  <SelectItem value="5">5 intentos</SelectItem>
                  <SelectItem value="10">10 intentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Citas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configuración de Citas
            </CardTitle>
            <CardDescription>
              Ajustes para la gestión de citas médicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxAppointments">Máximo de Citas por Día</Label>
              <Input
                id="maxAppointments"
                type="number"
                value={config.appointments.maxAppointmentsPerDay}
                onChange={(e) => handleInputChange('appointments', 'maxAppointmentsPerDay', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="appointmentDuration">Duración de Cita (minutos)</Label>
              <Select
                value={config.appointments.appointmentDuration.toString()}
                onValueChange={(value) => handleInputChange('appointments', 'appointmentDuration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Permitir Sobrecupos</Label>
                <p className="text-sm text-gray-600">Permitir más citas de las disponibles</p>
              </div>
              <Switch
                checked={config.appointments.allowOverbooking}
                onCheckedChange={(checked: boolean) => handleInputChange('appointments', 'allowOverbooking', checked)}
              />
            </div>
            <div>
              <Label htmlFor="cancellationPolicy">Política de Cancelación</Label>
              <Select
                value={config.appointments.cancellationPolicy}
                onValueChange={(value) => handleInputChange('appointments', 'cancellationPolicy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 hora antes">1 hora antes</SelectItem>
                  <SelectItem value="24 horas antes">24 horas antes</SelectItem>
                  <SelectItem value="48 horas antes">48 horas antes</SelectItem>
                  <SelectItem value="Sin restricciones">Sin restricciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 