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
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { Plus, Building2, Edit, Eye, Trash2, Users, Settings, UserCheck, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
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
  
  // Nuevos estados para filtro y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tenantsPerPage = 5;

  const fetchTenants = async () => {
    try {
      const data = await tenantService.getAllTenants();
      setTenants(data);
      setFilteredTenants(data);
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTenants();
  }, []);

  // Filtrar tenants basado en el término de búsqueda
  useEffect(() => {
    const filtered = tenants.filter(tenant =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTenants(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando se filtra
  }, [searchTerm, tenants]);

  // Calcular tenants para la página actual
  const indexOfLastTenant = currentPage * tenantsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - tenantsPerPage;
  const currentTenants = filteredTenants.slice(indexOfFirstTenant, indexOfLastTenant);
  const totalPages = Math.ceil(filteredTenants.length / tenantsPerPage);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tenantService.createTenant(newTenant);
      await fetchTenants();
      setShowCreateModal(false);
      setNewTenant({ name: '', address: '' });
      setError(null);
      toast.success('Tenant creado exitosamente');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error('Error al crear el tenant');
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error('Error al actualizar el tenant');
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
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
      setTenantConfig(configs.map((c: { key: string, value: string }) => ({ key: c.key, value: c.value })));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setTenantConfig([]);
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Error al guardar la configuración');
      }
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
      
      // Redirigir al dashboard del administrador
      window.location.href = '/dashboard/admin';
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error al impersonar');
      }
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
    <DashboardShell>
      <DashboardHeader
        heading="Gestión de Tenants"
        text="Administra los centros médicos y hospitales del sistema"
      >
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Tenant</span>
          <span className="sm:hidden">Crear Tenant</span>
        </Button>
      </DashboardHeader>

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
        <div className="bg-yellow-200 text-yellow-900 p-4 rounded mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm sm:text-base">Estás en modo impersonación como admin de un tenant.</span>
          <Button variant="destructive" size="sm" onClick={handleRestoreSuperAdmin} className="w-full sm:w-auto">
            Volver a ser Super Admin
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Centros Médicos Registrados
          </CardTitle>
          <CardDescription>
            Lista de todos los tenants (centros médicos) en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtro de búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Mostrando {filteredTenants.length} de {tenants.length} tenants
              </p>
            )}
          </div>

          {filteredTenants.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No se encontraron tenants' : 'No hay tenants'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando el primer centro médico.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Tenant
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentTenants.map((tenant) => (
                  <div key={tenant.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{tenant.name}</h3>
                        <p className="text-sm text-gray-500">{tenant.address}</p>
                        <p className="text-xs text-gray-400">
                          Creado el {format(new Date(tenant.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(tenant)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void viewDetails(tenant)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Ver detalles</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openConfigModal(tenant.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Configurar</span>
                      </Button>
                      <Link href={`/dashboard/super-admin/tenants/${tenant.id}/users`} className="flex-1 sm:flex-none">
                        <Button variant="outline" size="sm" className="w-full">
                          <Users className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Ver usuarios</span>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleImpersonate(tenant)}
                        className="flex-1 sm:flex-none"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Impersonar</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setTenantToDelete(tenant)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 px-2">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Mostrando {indexOfFirstTenant + 1} a {Math.min(indexOfLastTenant, filteredTenants.length)} de {filteredTenants.length} tenants
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* Botones de navegación */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex-1 sm:flex-none"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Anterior</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex-1 sm:flex-none"
                      >
                        <span className="hidden sm:inline">Siguiente</span>
                        <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
                      </Button>
                    </div>
                    
                    {/* Números de página */}
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      {totalPages <= 7 ? (
                        // Si hay 7 páginas o menos, mostrar todas
                        Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10 h-10 p-0 text-sm"
                          >
                            {page}
                          </Button>
                        ))
                      ) : (
                        // Si hay más de 7 páginas, mostrar paginación inteligente
                        <>
                          {/* Primera página */}
                          <Button
                            variant={currentPage === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            className="w-10 h-10 p-0 text-sm"
                          >
                            1
                          </Button>
                          
                          {/* Puntos suspensivos iniciales */}
                          {currentPage > 4 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          
                          {/* Páginas alrededor de la actual */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => 
                              page !== 1 && 
                              page !== totalPages && 
                              page >= currentPage - 1 && 
                              page <= currentPage + 1
                            )
                            .map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-10 h-10 p-0 text-sm"
                              >
                                {page}
                              </Button>
                            ))}
                          
                          {/* Puntos suspensivos finales */}
                          {currentPage < totalPages - 3 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          
                          {/* Última página */}
                          <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-10 h-10 p-0 text-sm"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Crear Nuevo Tenant - Mejorado */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Crear Nuevo Tenant
            </DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo centro médico. Todos los campos son requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleCreateTenant(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Centro Médico *</Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Ej: Hospital Central"
                value={newTenant.name}
                onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                type="text"
                required
                placeholder="Ej: Av. Principal 123, Ciudad"
                value={newTenant.address}
                onChange={(e) => setNewTenant({ ...newTenant, address: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Crear Tenant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Tenant - Mejorado */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5" />
              Editar Tenant
            </DialogTitle>
            <DialogDescription>
              Modifica los datos del centro médico. Todos los campos son requeridos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleEditTenant(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del Centro Médico *</Label>
              <Input
                id="edit-name"
                type="text"
                required
                placeholder="Ej: Hospital Central"
                value={editingTenant?.name || ''}
                onChange={(e) => setEditingTenant(editingTenant ? { ...editingTenant, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Dirección *</Label>
              <Input
                id="edit-address"
                type="text"
                required
                placeholder="Ej: Av. Principal 123, Ciudad"
                value={editingTenant?.address || ''}
                onChange={(e) => setEditingTenant(editingTenant ? { ...editingTenant, address: e.target.value } : null)}
              />
            </div>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowEditModal(false);
                setEditingTenant(null);
              }} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Edit className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles del Tenant - Mejorado */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="w-[95vw] max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Detalles del Tenant
            </DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    {selectedTenant.name}
                  </CardTitle>
                  <CardDescription>Información General del Centro Médico</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">ID del Tenant</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedTenant.id}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Fecha de Creación</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(selectedTenant.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Dirección</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTenant.address}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setShowDetailModal(false)} className="w-full sm:w-auto">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminar Tenant - Mejorado */}
      <Dialog open={!!tenantToDelete} onOpenChange={(open) => !open && setTenantToDelete(null)}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar Tenant
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el centro médico "{tenantToDelete?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setTenantToDelete(null)} disabled={isDeleting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTenant} disabled={isDeleting} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Configuración - Mejorado */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Configuración Avanzada del Tenant
            </DialogTitle>
            <DialogDescription>
              Configura parámetros avanzados para este centro médico.
            </DialogDescription>
          </DialogHeader>
          {configLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando configuración...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {tenantConfig.map((cfg, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <Input
                    placeholder="Clave de configuración"
                    value={cfg.key}
                    onChange={e => handleConfigChange(idx, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Valor"
                    value={cfg.value}
                    onChange={e => handleConfigChange(idx, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="destructive" size="icon" onClick={() => removeConfigRow(idx)} className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addConfigRow}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar configuración
              </Button>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowConfigModal(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={saveConfig} disabled={configSaving} className="w-full sm:w-auto">
              <Settings className="mr-2 h-4 w-4" />
              {configSaving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
} 