"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { userService } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { MedicalRecord } from '@/types/medicalRecord';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { 
  FileText, 
  Calendar, 
  Plus, 
  Eye, 
  Edit, 
  Search,
  Filter,
  Stethoscope,
  ClipboardList,
  Save,
  X,
  User as UserIcon
} from 'lucide-react';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    treatment: '',
    observations: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recordsData, patientsData] = await Promise.all([
          medicalRecordService.getMyMedicalRecords(user?.role),
          userService.getUsersByTenant(user?.tenant_id || 0)
        ]);
        
        setRecords(recordsData);
        const patientsOnly = patientsData.filter(u => u.role === 'Paciente');
        setPatients(patientsOnly);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        setError('Error al obtener los datos');
        toast.error('Error al cargar los datos');
        setLoading(false);
      }
    };
    
    if (user?.role && user?.tenant_id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const openCreateModal = () => {
    setFormData({
      patient_id: '',
      diagnosis: '',
      treatment: '',
      observations: ''
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setFormData({
      patient_id: record.patient_id?.toString() || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      observations: record.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditModalOpen && selectedRecord) {
        await medicalRecordService.updateMedicalRecord(selectedRecord.id, {
          ...formData,
          patient_id: parseInt(formData.patient_id),
          specialist_id: user?.id || 0
        });
        toast.success('Registro médico actualizado correctamente');
      } else {
        await medicalRecordService.createMedicalRecord({
          ...formData,
          patient_id: parseInt(formData.patient_id),
          specialist_id: user?.id || 0
        });
        toast.success('Registro médico creado correctamente');
      }

      // Recargar datos
      const updatedRecords = await medicalRecordService.getMyMedicalRecords(user?.role);
      setRecords(updatedRecords);

      // Cerrar modal y limpiar formulario
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({
        patient_id: '',
        diagnosis: '',
        treatment: '',
        observations: ''
      });
    } catch (error) {
      toast.error('Error al guardar el registro médico');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const filteredRecords = records.filter(record => {
    return (
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando registros médicos...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
        heading="Registros Médicos"
        text={`Historial de registros médicos. Total: ${records.length} registros`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Registro
          </Button>
        </div>
      </DashboardHeader>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5 text-blue-600" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por diagnóstico, notas o paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <div className="grid gap-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Registro #{record.id}
                          </h3>
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            Consulta
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(record.date)}</span>
                          </div>
                          {user?.role !== 'Paciente' && (
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-2" />
                              <span className="truncate">Paciente #{record.patient_id}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <strong className="text-sm text-gray-700">Diagnóstico:</strong>
                            <p className="text-sm text-gray-600 mt-1">{record.diagnosis}</p>
                          </div>
                          
                          {record.notes && (
                            <div>
                              <strong className="text-sm text-gray-700">Notas:</strong>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{record.notes}</p>
                            </div>
                          )}
                          
                          {record.treatment && (
                            <div>
                              <strong className="text-sm text-gray-700">Tratamiento:</strong>
                              <p className="text-sm text-gray-600 mt-1">{record.treatment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => openViewModal(record)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => openEditModal(record)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron registros' : 'No hay registros médicos'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Los registros médicos aparecerán aquí cuando sean creados'
                }
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Registro
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Crear Registro */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Registro Médico
            </DialogTitle>
            <DialogDescription>
              Crear un nuevo registro médico para un paciente
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patient_id">Paciente *</Label>
              <select
                id="patient_id"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md mt-1"
                required
              >
                <option value="">Seleccionar paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.username} - {patient.identification_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnóstico *</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Ingrese el diagnóstico del paciente"
                required
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="treatment">Tratamiento *</Label>
              <Textarea
                id="treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                placeholder="Ingrese el tratamiento prescrito"
                required
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                placeholder="Observaciones adicionales"
                rows={3}
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'Guardando...' : 'Guardar Registro'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Registro */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5" />
              Editar Registro Médico
            </DialogTitle>
            <DialogDescription>
              Modificar el registro médico seleccionado
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_patient_id">Paciente *</Label>
              <select
                id="edit_patient_id"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md mt-1"
                required
              >
                <option value="">Seleccionar paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.username} - {patient.identification_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="edit_diagnosis">Diagnóstico *</Label>
              <Textarea
                id="edit_diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Ingrese el diagnóstico del paciente"
                required
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit_treatment">Tratamiento *</Label>
              <Textarea
                id="edit_treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                placeholder="Ingrese el tratamiento prescrito"
                required
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit_observations">Observaciones</Label>
              <Textarea
                id="edit_observations"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                placeholder="Observaciones adicionales"
                rows={3}
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'Guardando...' : 'Actualizar Registro'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Ver Detalles */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Detalles del Registro Médico
            </DialogTitle>
            <DialogDescription>
              Información completa del registro médico
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">ID del Registro</Label>
                  <p className="text-sm text-gray-900">#{selectedRecord.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Fecha</Label>
                  <p className="text-sm text-gray-900">{formatDate(selectedRecord.date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Paciente</Label>
                  <p className="text-sm text-gray-900">#{selectedRecord.patient_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Especialista</Label>
                  <p className="text-sm text-gray-900">#{selectedRecord.specialist_id}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Diagnóstico</Label>
                <p className="text-sm text-gray-900 mt-1">{selectedRecord.diagnosis}</p>
              </div>

              {selectedRecord.treatment && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tratamiento</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Observaciones</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}