'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Globe,
  Save,
  RefreshCw
} from 'lucide-react';

export default function SystemSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    systemName: 'UppaMed',
    systemVersion: '1.0.0',
    maxUsersPerTenant: 1000,
    sessionTimeout: 30,
    enableNotifications: true,
    enableAuditLog: true,
    backupFrequency: 'daily',
    maintenanceMode: false
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Aquí iría la lógica para guardar la configuración
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      alert('Configuración guardada exitosamente');
    } catch (error) {
      alert('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Configuración del Sistema"
        text="Gestiona la configuración global del sistema"
      >
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DashboardHeader>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración General */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Configuración General</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="systemName">Nombre del Sistema</Label>
              <Input
                id="systemName"
                name="systemName"
                value={settings.systemName}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="systemVersion">Versión del Sistema</Label>
              <Input
                id="systemVersion"
                name="systemVersion"
                value={settings.systemVersion}
                onChange={handleChange}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="maxUsersPerTenant">Máximo Usuarios por Centro</Label>
              <Input
                id="maxUsersPerTenant"
                name="maxUsersPerTenant"
                type="number"
                value={settings.maxUsersPerTenant}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Configuración de Seguridad */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Seguridad</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
              <Input
                id="sessionTimeout"
                name="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableAuditLog"
                name="enableAuditLog"
                checked={settings.enableAuditLog}
                onChange={handleChange}
                className="rounded"
              />
              <Label htmlFor="enableAuditLog">Habilitar Registro de Auditoría</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="rounded"
              />
              <Label htmlFor="maintenanceMode">Modo Mantenimiento</Label>
            </div>
          </div>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Notificaciones</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableNotifications"
                name="enableNotifications"
                checked={settings.enableNotifications}
                onChange={handleChange}
                className="rounded"
              />
              <Label htmlFor="enableNotifications">Habilitar Notificaciones</Label>
            </div>
            <div>
              <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
              <select
                id="backupFrequency"
                name="backupFrequency"
                value={settings.backupFrequency}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="hourly">Cada hora</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Estado del Sistema */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Estado del Sistema</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Estado de la Base de Datos</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Conectado
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Último Respaldo</span>
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Usuarios Activos</span>
              <span className="text-sm text-gray-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Centros Activos</span>
              <span className="text-sm text-gray-600">0</span>
            </div>
            <Button variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar Estado
            </Button>
          </div>
        </Card>
      </div>

      {/* Acciones del Sistema */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Acciones del Sistema</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="w-full">
            <Database className="mr-2 h-4 w-4" />
            Respaldar Base de Datos
          </Button>
          <Button variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpiar Caché
          </Button>
          <Button variant="outline" className="w-full">
            <Shield className="mr-2 h-4 w-4" />
            Verificar Seguridad
          </Button>
        </div>
      </Card>
    </DashboardShell>
  );
} 