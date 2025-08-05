"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { tenantService } from '@/services/tenant.service';
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
  CheckCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface TenantBasicInfo {
  name: string;
  address: string;
}

interface TenantConfig {
  // Configuraciones básicas del tenant
  tenant_name: string;
  tenant_address: string;
  tenant_phone: string;
  tenant_email: string;
  tenant_website: string;
  
  // Configuraciones de citas
  default_appointment_duration: number; // en minutos
  max_appointments_per_day: number;
  allow_overbooking: boolean;
  cancellation_policy_hours: number;
  
  // Configuraciones de horarios por defecto
  default_start_time: string;
  default_end_time: string;
  default_break_start: string;
  default_break_end: string;
  
  // Configuraciones de notificaciones
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  enable_appointment_reminders: boolean;
  reminder_hours_before: number;
  
  // Configuraciones de seguridad
  session_timeout_minutes: number;
  max_login_attempts: number;
  require_password_change_days: number;
}

export default function AdminSettings() {
  const { user, isLoading } = useAuth();
  const [tenantInfo, setTenantInfo] = useState<TenantBasicInfo>({
    name: '',
    address: ''
  });
  const [config, setConfig] = useState<TenantConfig>({
    // Configuraciones básicas
    tenant_name: '',
    tenant_address: '',
    tenant_phone: '',
    tenant_email: '',
    tenant_website: '',
    
    // Configuraciones de citas
    default_appointment_duration: 30,
    max_appointments_per_day: 50,
    allow_overbooking: false,
    cancellation_policy_hours: 24,
    
    // Configuraciones de horarios
    default_start_time: '08:00',
    default_end_time: '18:00',
    default_break_start: '12:00',
    default_break_end: '13:00',
    
    // Configuraciones de notificaciones
    enable_email_notifications: true,
    enable_sms_notifications: false,
    enable_appointment_reminders: true,
    reminder_hours_before: 24,
    
    // Configuraciones de seguridad
    session_timeout_minutes: 30,
    max_login_attempts: 5,
    require_password_change_days: 90
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
      // Cargar información básica del tenant (sin pasar tenantId)
      const tenantData = await tenantService.getTenantById();
      setTenantInfo({
        name: tenantData.name || '',
        address: tenantData.address || ''
      });

      // Cargar configuración del tenant (sin pasar tenantId)
      const configData = await tenantService.getTenantConfig();
      
      // Convertir array de configuraciones a objeto
      const configObj: any = {};
      configData.forEach((item: any) => {
        configObj[item.key] = item.value;
      });

      // Actualizar estado con valores por defecto si no existen
      setConfig(prev => ({
        ...prev,
        tenant_name: configObj.tenant_name || tenantData.name || '',
        tenant_address: configObj.tenant_address || tenantData.address || '',
        tenant_phone: configObj.tenant_phone || '',
        tenant_email: configObj.tenant_email || '',
        tenant_website: configObj.tenant_website || '',
        default_appointment_duration: parseInt(configObj.default_appointment_duration) || 30,
        max_appointments_per_day: parseInt(configObj.max_appointments_per_day) || 50,
        allow_overbooking: configObj.allow_overbooking === 'true',
        cancellation_policy_hours: parseInt(configObj.cancellation_policy_hours) || 24,
        default_start_time: configObj.default_start_time || '08:00',
        default_end_time: configObj.default_end_time || '18:00',
        default_break_start: configObj.default_break_start || '12:00',
        default_break_end: configObj.default_break_end || '13:00',
        enable_email_notifications: configObj.enable_email_notifications !== 'false',
        enable_sms_notifications: configObj.enable_sms_notifications === 'true',
        enable_appointment_reminders: configObj.enable_appointment_reminders !== 'false',
        reminder_hours_before: parseInt(configObj.reminder_hours_before) || 24,
        session_timeout_minutes: parseInt(configObj.session_timeout_minutes) || 30,
        max_login_attempts: parseInt(configObj.max_login_attempts) || 5,
        require_password_change_days: parseInt(configObj.require_password_change_days) || 90
      }));

      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar la configuración' });
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Actualizar información básica del tenant (sin pasar tenantId)
      await tenantService.updateTenant(undefined, {
        name: tenantInfo.name,
        address: tenantInfo.address
      });

      // Convertir configuración a formato de array para el backend
      const configArray = Object.entries(config).map(([key, value]) => ({
        key,
        value: value.toString()
      }));

      // Actualizar configuración del tenant (sin pasar tenantId)
      await tenantService.updateTenantConfig(undefined, configArray);

      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof TenantConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTenantInfoChange = (field: keyof TenantBasicInfo, value: string) => {
    setTenantInfo(prev => ({
      ...prev,
      [field]: value
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
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Centro Médico</h1>
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
        {/* Información Básica del Centro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información Básica del Centro
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
                value={tenantInfo.name}
                onChange={(e) => handleTenantInfoChange('name', e.target.value)}
                placeholder="Nombre del centro médico"
              />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={tenantInfo.address}
                onChange={(e) => handleTenantInfoChange('address', e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={config.tenant_phone}
                onChange={(e) => handleInputChange('tenant_phone', e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={config.tenant_email}
                onChange={(e) => handleInputChange('tenant_email', e.target.value)}
                placeholder="contacto@centro.com"
              />
            </div>
            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={config.tenant_website}
                onChange={(e) => handleInputChange('tenant_website', e.target.value)}
                placeholder="https://centro.com"
              />
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
              <Label htmlFor="appointmentDuration">Duración por Defecto (minutos)</Label>
              <Select
                value={config.default_appointment_duration.toString()}
                onValueChange={(value) => handleInputChange('default_appointment_duration', parseInt(value))}
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
            <div>
              <Label htmlFor="maxAppointments">Máximo de Citas por Día</Label>
              <Input
                id="maxAppointments"
                type="number"
                value={config.max_appointments_per_day}
                onChange={(e) => handleInputChange('max_appointments_per_day', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Permitir Sobrecupos</Label>
                <p className="text-sm text-gray-600">Permitir más citas de las disponibles</p>
              </div>
              <Switch
                checked={config.allow_overbooking}
                onCheckedChange={(checked: boolean) => handleInputChange('allow_overbooking', checked)}
              />
            </div>
            <div>
              <Label htmlFor="cancellationPolicy">Política de Cancelación (horas antes)</Label>
              <Select
                value={config.cancellation_policy_hours.toString()}
                onValueChange={(value) => handleInputChange('cancellation_policy_hours', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora antes</SelectItem>
                  <SelectItem value="24">24 horas antes</SelectItem>
                  <SelectItem value="48">48 horas antes</SelectItem>
                  <SelectItem value="0">Sin restricciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Horarios por Defecto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios por Defecto
            </CardTitle>
            <CardDescription>
              Horarios predeterminados para especialistas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Hora de Inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={config.default_start_time}
                  onChange={(e) => handleInputChange('default_start_time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora de Fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={config.default_end_time}
                  onChange={(e) => handleInputChange('default_end_time', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="breakStart">Inicio de Descanso</Label>
                <Input
                  id="breakStart"
                  type="time"
                  value={config.default_break_start}
                  onChange={(e) => handleInputChange('default_break_start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="breakEnd">Fin de Descanso</Label>
                <Input
                  id="breakEnd"
                  type="time"
                  value={config.default_break_end}
                  onChange={(e) => handleInputChange('default_break_end', e.target.value)}
                />
              </div>
            </div>
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
                checked={config.enable_email_notifications}
                onCheckedChange={(checked: boolean) => handleInputChange('enable_email_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones SMS</Label>
                <p className="text-sm text-gray-600">Enviar notificaciones por mensaje de texto</p>
              </div>
              <Switch
                checked={config.enable_sms_notifications}
                onCheckedChange={(checked: boolean) => handleInputChange('enable_sms_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Recordatorios de Citas</Label>
                <p className="text-sm text-gray-600">Enviar recordatorios automáticos</p>
              </div>
              <Switch
                checked={config.enable_appointment_reminders}
                onCheckedChange={(checked: boolean) => handleInputChange('enable_appointment_reminders', checked)}
              />
            </div>
            <div>
              <Label htmlFor="reminderHours">Horas antes del recordatorio</Label>
              <Select
                value={config.reminder_hours_before.toString()}
                onValueChange={(value) => handleInputChange('reminder_hours_before', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora antes</SelectItem>
                  <SelectItem value="2">2 horas antes</SelectItem>
                  <SelectItem value="6">6 horas antes</SelectItem>
                  <SelectItem value="12">12 horas antes</SelectItem>
                  <SelectItem value="24">24 horas antes</SelectItem>
                </SelectContent>
              </Select>
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
                value={config.session_timeout_minutes.toString()}
                onValueChange={(value) => handleInputChange('session_timeout_minutes', parseInt(value))}
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
            <div>
              <Label htmlFor="maxLoginAttempts">Intentos Máximos de Login</Label>
              <Select
                value={config.max_login_attempts.toString()}
                onValueChange={(value) => handleInputChange('max_login_attempts', parseInt(value))}
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
            <div>
              <Label htmlFor="passwordChangeDays">Días para Cambio de Contraseña</Label>
              <Select
                value={config.require_password_change_days.toString()}
                onValueChange={(value) => handleInputChange('require_password_change_days', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                  <SelectItem value="90">90 días</SelectItem>
                  <SelectItem value="180">180 días</SelectItem>
                  <SelectItem value="0">Sin restricción</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 