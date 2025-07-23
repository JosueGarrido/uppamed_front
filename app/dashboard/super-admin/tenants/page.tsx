'use client';

import React, { useState, useEffect } from 'react';
import { tenantService } from '../../../../services/tenant.service';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import Cookies from 'js-cookie';

interface Tenant {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', address: '' });
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configTenantId, setConfigTenantId] = useState<number | null>(null);
  const [tenantConfig, setTenantConfig] = useState<{ key: string, value: string }[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonatedTenant, setImpersonatedTenant] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      const data = await tenantService.getAllTenants();
      setTenants(data);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tenantService.createTenant(newTenant);
      await fetchTenants();
      setShowCreateModal(false);
      setNewTenant({ name: '', address: '' });
      setError(null);
      toast.success('Tenant creado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast.error('Error al crear el tenant');
    }
  };

  const handleEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    try {
      await tenantService.updateTenant(editingTenant.id, {
        name: editingTenant.name,
        address: editingTenant.address,
      });
      await fetchTenants();
      setShowEditModal(false);
      setEditingTenant(null);
      setError(null);
      toast.success('Tenant actualizado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast.error('Error al actualizar el tenant');
    }
  };

  const startEditing = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowEditModal(true);
  };

  const viewDetails = async (tenant: Tenant) => {
    try {
      const detailedTenant = await tenantService.getTenantById(tenant.id);
      setSelectedTenant(detailedTenant);
      setShowDetailModal(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setIsDeleting(true);
    try {
      await tenantService.deleteTenant(tenantToDelete.id);
      toast.success('Tenant eliminado exitosamente');
      setTenantToDelete(null);
      await fetchTenants();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const openConfigModal = async (tenantId: number) => {
    setConfigTenantId(tenantId);
    setShowConfigModal(true);
    setConfigLoading(true);
    try {
      const configs = await tenantService.getTenantConfig(tenantId);
      setTenantConfig(configs.map((c: any) => ({ key: c.key, value: c.value })));
    } catch {
      setTenantConfig([]);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleConfigChange = (idx: number, field: 'key' | 'value', value: string) => {
    setTenantConfig(cfgs => cfgs.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addConfigRow = () => setTenantConfig(cfgs => [...cfgs, { key: '', value: '' }]);
  const removeConfigRow = (idx: number) => setTenantConfig(cfgs => cfgs.filter((_, i) => i !== idx));

  const saveConfig = async () => {
    if (!configTenantId) return;
    setConfigSaving(true);
    try {
      await tenantService.updateTenantConfig(configTenantId, tenantConfig.filter(c => c.key));
      toast.success('Configuración guardada');
      setShowConfigModal(false);
    } catch {
      toast.error('Error al guardar la configuración');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleImpersonate = async (tenant: Tenant) => {
    try {
      const res = await authService.impersonateTenantAdmin(tenant.id);
      localStorage.setItem('original_token', authService.getToken() || '');
      Cookies.set('token', res.token, { path: '/' });
      localStorage.setItem('user', JSON.stringify(res.user));
      setImpersonating(true);
      setImpersonatedTenant(tenant.name);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Error al impersonar');
    }
  };

  const handleRestoreSuperAdmin = () => {
    const original = localStorage.getItem('original_token');
    if (original) {
      Cookies.set('token', original, { path: '/' });
      localStorage.removeItem('original_token');
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Gestión de Tenants
        </h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="mr-2">➕</span>
          Nuevo Tenant
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {typeof window !== 'undefined' && localStorage.getItem('original_token') && (
        <div className="bg-yellow-200 text-yellow-900 p-4 rounded mb-4 flex items-center justify-between">
          <span>Estás en modo impersonación como admin de un tenant.</span>
          <Button variant="destructive" size="sm" onClick={handleRestoreSuperAdmin}>Volver a ser Super Admin</Button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tenants.map((tenant) => (
            <li key={tenant.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="flex text-sm">
                      <p className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        {tenant.name}
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-2">🏢</span>
                        {tenant.address}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0">
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => startEditing(tenant)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => void viewDetails(tenant)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setTenantToDelete(tenant)}
                      >
                        Eliminar
                      </Button>
                      <Link href={`/dashboard/super-admin/tenants/${tenant.id}/users`} className="ml-2 text-blue-600 hover:underline">
                        Ver usuarios
                      </Link>
                      <Button variant="secondary" size="sm" className="ml-2" onClick={() => openConfigModal(tenant.id)}>Configurar</Button>
                      <Button variant="outline" size="sm" className="ml-2" onClick={() => handleImpersonate(tenant)}>Impersonar</Button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tenant</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo tenant. Todos los campos son requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleCreateTenant(e)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  type="text"
                  required
                  value={newTenant.address}
                  onChange={(e) => setNewTenant({ ...newTenant, address: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tenant</DialogTitle>
            <DialogDescription>
              Modifica los datos del tenant. Todos los campos son requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleEditTenant(e)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  type="text"
                  required
                  value={editingTenant?.name || ''}
                  onChange={(e) => setEditingTenant(editingTenant ? { ...editingTenant, name: e.target.value } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Input
                  id="edit-address"
                  type="text"
                  required
                  value={editingTenant?.address || ''}
                  onChange={(e) => setEditingTenant(editingTenant ? { ...editingTenant, address: e.target.value } : null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowEditModal(false);
                setEditingTenant(null);
              }}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Detalles del Tenant</DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{selectedTenant.name}</CardTitle>
                  <CardDescription>Información General</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ID</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedTenant.id}
                      </p>
                    </div>
                    <div>
                      <Label>Fecha de Creación</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {format(new Date(selectedTenant.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Dirección</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedTenant.address}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tenantToDelete} onOpenChange={(open) => !open && setTenantToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Tenant</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el tenant "{tenantToDelete?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTenantToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTenant} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración avanzada del Tenant</DialogTitle>
          </DialogHeader>
          {configLoading ? (
            <div className="p-4 text-center">Cargando configuración...</div>
          ) : (
            <div className="space-y-4">
              {tenantConfig.map((cfg, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Clave"
                    value={cfg.key}
                    onChange={e => handleConfigChange(idx, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Valor"
                    value={cfg.value}
                    onChange={e => handleConfigChange(idx, 'value', e.target.value)}
                  />
                  <Button variant="destructive" size="icon" onClick={() => removeConfigRow(idx)}>-</Button>
                </div>
              ))}
              <Button variant="outline" onClick={addConfigRow}>Agregar clave</Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigModal(false)}>Cancelar</Button>
            <Button onClick={saveConfig} disabled={configSaving}>{configSaving ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 