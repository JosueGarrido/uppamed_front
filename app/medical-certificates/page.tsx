'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { medicalCertificateService } from '@/services/medicalCertificate.service';
import { userService } from '@/services/user.service';
import { MedicalCertificate } from '@/types/medicalCertificate';
import { User } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import SidebarWrapper from '@/components/SidebarWrapper';
import { 
  Plus, 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function MedicalCertificatesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCertificates, setTotalCertificates] = useState(0);
  
  // Estados para el modal de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<MedicalCertificate | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    // Datos del paciente
    patient_name: '',
    patient_age: '',
    patient_address: '',
    patient_phone: '',
    patient_institution: '',
    patient_occupation: '',
    patient_cedula: '',
    patient_clinical_history: '',
    // Motivos de la enfermedad
    diagnosis: '',
    cie_code: '',
    contingency_type: 'Enfermedad general' as const,
    rest_hours: '24',
    rest_days: '1',
    rest_from_date: '',
    rest_to_date: '',
    // Firma de responsabilidad
    doctor_name: '',
    doctor_cedula: '',
    doctor_specialty: '',
    doctor_email: '',
    // Información del establecimiento
    establishment_name: '',
    establishment_address: '',
    establishment_phone: '',
    establishment_ruc: '',
    // Metadatos
    issue_date: '',
    observations: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (!authLoading && user?.role === 'Especialista') {
      loadData();
      loadPatients();
    }
  }, [authLoading, user, currentPage, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const response = await medicalCertificateService.getSpecialistCertificates({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter
      });
      
      setCertificates(response.certificates);
      setTotalPages(response.pagination.totalPages);
      setTotalCertificates(response.pagination.total);
    } catch (error) {
      console.error('❌ Error loading certificates:', error);
      toast.error('Error al cargar los certificados médicos');
      setCertificates([]);
      setTotalPages(1);
      setTotalCertificates(0);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      if (!user?.tenant_id) {
        return;
      }
      
      const allUsers = await userService.getUsersByTenant(user.tenant_id);
      const patientUsers = allUsers.filter(u => u.role === 'Paciente');
      setPatients(patientUsers);
    } catch (error) {
      console.error('❌ Error loading patients:', error);
      toast.error('Error al cargar los pacientes');
      setPatients([]);
    }
  };

  // Funciones para manejar el modal
  const openCreateModal = () => {
    setSelectedCertificate(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      patient_id: '',
      // Datos del paciente
      patient_name: '',
      patient_age: '',
      patient_address: '',
      patient_phone: '',
      patient_institution: '',
      patient_occupation: '',
      patient_cedula: '',
      patient_clinical_history: '',
      // Motivos de la enfermedad
      diagnosis: '',
      cie_code: '',
      contingency_type: 'Enfermedad general' as const,
      rest_hours: '24',
      rest_days: '1',
      rest_from_date: today,
      rest_to_date: today,
      // Firma de responsabilidad (se llenará automáticamente con datos del especialista)
      doctor_name: user?.name || user?.username || '',
      doctor_cedula: user?.identification_number || '',
      doctor_specialty: user?.specialty || user?.especialidad || '',
      doctor_email: user?.email || '',
      // Información del establecimiento (se puede prellenar con datos del tenant)
      establishment_name: 'CENTRO DE ESPECIALIDADES MÉDICAS Y ODONTOLÓGICAS',
      establishment_address: '',
      establishment_phone: '',
      establishment_ruc: '',
      // Metadatos
      issue_date: today,
      observations: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calcular automáticamente la fecha "hasta" cuando cambie "desde" o "días de reposo"
      if (field === 'rest_from_date' || field === 'rest_days') {
        const fromDate = field === 'rest_from_date' ? value : prev.rest_from_date;
        const restDays = field === 'rest_days' ? parseInt(value) || 0 : parseInt(prev.rest_days) || 0;
        
        if (fromDate && restDays > 0) {
          const startDate = new Date(fromDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + restDays - 1); // -1 porque incluye el día de inicio
          newData.rest_to_date = endDate.toISOString().split('T')[0];
        }
      }
      
      return newData;
    });
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === parseInt(patientId));
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patient_id: patientId,
        patient_name: patient.name || patient.username,
        patient_age: '', // Se debe llenar manualmente
        patient_cedula: patient.identification_number || '',
        patient_clinical_history: patient.id.toString() // Usar ID como número de historia clínica temporal
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validar campos obligatorios
      const requiredFields = [
        { field: 'patient_id', name: 'Paciente' },
        { field: 'patient_name', name: 'Nombre del paciente' },
        { field: 'patient_age', name: 'Edad del paciente' },
        { field: 'diagnosis', name: 'Diagnóstico' },
        { field: 'contingency_type', name: 'Tipo de contingencia' },
        { field: 'rest_hours', name: 'Horas de reposo' },
        { field: 'rest_days', name: 'Días de reposo' },
        { field: 'rest_from_date', name: 'Fecha desde' },
        { field: 'rest_to_date', name: 'Fecha hasta' },
        { field: 'doctor_name', name: 'Nombre del médico' },
        { field: 'doctor_cedula', name: 'Cédula del médico' },
        { field: 'doctor_specialty', name: 'Especialidad del médico' },
        { field: 'establishment_name', name: 'Nombre del establecimiento' },
        { field: 'issue_date', name: 'Fecha de emisión' }
      ];

      const missingFields = requiredFields.filter(({ field }) => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        toast.error(`Por favor completa los siguientes campos: ${missingFields.map(f => f.name).join(', ')}`);
        return;
      }

      // Validar que la fecha "hasta" sea posterior a "desde"
      if (new Date(formData.rest_to_date) < new Date(formData.rest_from_date)) {
        toast.error('La fecha "hasta" debe ser posterior a la fecha "desde"');
        return;
      }

      // Preparar datos para enviar al backend
      const certificateData = {
        patient_id: parseInt(formData.patient_id),
        patient_name: formData.patient_name,
        patient_age: parseInt(formData.patient_age),
        patient_address: formData.patient_address,
        patient_phone: formData.patient_phone,
        patient_institution: formData.patient_institution,
        patient_occupation: formData.patient_occupation,
        patient_cedula: formData.patient_cedula,
        patient_clinical_history: formData.patient_clinical_history,
        diagnosis: formData.diagnosis,
        cie_code: formData.cie_code,
        contingency_type: formData.contingency_type,
        rest_hours: parseInt(formData.rest_hours),
        rest_days: parseInt(formData.rest_days),
        rest_from_date: formData.rest_from_date,
        rest_to_date: formData.rest_to_date,
        doctor_name: formData.doctor_name,
        doctor_cedula: formData.doctor_cedula,
        doctor_specialty: formData.doctor_specialty,
        doctor_email: formData.doctor_email,
        establishment_name: formData.establishment_name,
        establishment_address: formData.establishment_address,
        establishment_phone: formData.establishment_phone,
        establishment_ruc: formData.establishment_ruc,
        issue_date: formData.issue_date,
        observations: formData.observations
      };

      const certificate = await medicalCertificateService.createMedicalCertificate(certificateData);
      
      toast.success('Certificado médico creado exitosamente');
      closeModal();
      loadData(); // Recargar la lista
    } catch (error) {
      console.error('Error creating certificate:', error);
      toast.error('Error al crear el certificado médico');
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activo':
        return <Badge variant="default" className="bg-green-100 text-green-800 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>;
      case 'anulado':
        return <Badge variant="danger" className="flex items-center"><AlertCircle className="w-3 h-3 mr-1" />Anulado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Mostrar loading mientras se carga la autenticación
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar si el usuario es especialista
  if (user?.role !== 'Especialista') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-gray-600">Solo los especialistas pueden acceder a esta sección.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarWrapper />
      <div className="flex-1 overflow-x-hidden">
        <main className="p-6">
          <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-blue-600" />
            Certificados Médicos
          </h1>
          <p className="text-gray-600 mt-2">Gestiona los certificados médicos de tus pacientes</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Certificado
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por paciente, diagnóstico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="anulado">Anulados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de certificados */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Certificados Médicos</CardTitle>
          <CardDescription>
            Total: {totalCertificates} certificados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay certificados médicos</h3>
              <p className="text-gray-600 mb-4">Comienza creando tu primer certificado médico.</p>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Certificado
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnóstico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certificates.map((certificate) => (
                    <tr key={certificate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {certificate.patient_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {certificate.patient_age} años
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {certificate.diagnosis}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(certificate.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(certificate.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info('Funcionalidad de ver próximamente')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info('Funcionalidad de descargar próximamente')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {certificate.status === 'activo' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info('Funcionalidad de editar próximamente')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info('Funcionalidad de anular próximamente')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modal para crear/editar certificado */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCertificate ? 'Editar Certificado' : 'Nuevo Certificado Médico'}
                </h2>
                <Button variant="outline" size="sm" onClick={closeModal}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* 1. DATOS DEL PACIENTE */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">1.- DATOS DEL PACIENTE</h3>
                  
                  {/* Selección de Paciente */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Paciente *
                    </label>
                    <Select value={formData.patient_id} onValueChange={handlePatientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name || patient.username} - {patient.identification_number || 'Sin DNI'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres y apellidos del paciente *
                      </label>
                      <Input
                        value={formData.patient_name}
                        onChange={(e) => handleInputChange('patient_name', e.target.value)}
                        placeholder="Nombre completo del paciente"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Edad *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={formData.patient_age}
                        onChange={(e) => handleInputChange('patient_age', e.target.value)}
                        placeholder="Edad en años"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección domiciliaria
                      </label>
                      <Input
                        value={formData.patient_address}
                        onChange={(e) => handleInputChange('patient_address', e.target.value)}
                        placeholder="Dirección completa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número telefónico de contacto
                      </label>
                      <Input
                        value={formData.patient_phone}
                        onChange={(e) => handleInputChange('patient_phone', e.target.value)}
                        placeholder="Teléfono de contacto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institución
                      </label>
                      <Input
                        value={formData.patient_institution}
                        onChange={(e) => handleInputChange('patient_institution', e.target.value)}
                        placeholder="Institución donde trabaja/estudia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ocupación
                      </label>
                      <Input
                        value={formData.patient_occupation}
                        onChange={(e) => handleInputChange('patient_occupation', e.target.value)}
                        placeholder="Ocupación del paciente"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de cédula del paciente
                      </label>
                      <Input
                        value={formData.patient_cedula}
                        onChange={(e) => handleInputChange('patient_cedula', e.target.value)}
                        placeholder="Número de cédula"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Historia Clínica
                      </label>
                      <Input
                        value={formData.patient_clinical_history}
                        onChange={(e) => handleInputChange('patient_clinical_history', e.target.value)}
                        placeholder="Número de historia clínica"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. MOTIVOS DE LA ENFERMEDAD */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">2.- MOTIVOS DE LA ENFERMEDAD</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diagnóstico *
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        value={formData.diagnosis}
                        onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                        placeholder="Diagnóstico médico detallado"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CIE 10
                      </label>
                      <Input
                        value={formData.cie_code}
                        onChange={(e) => handleInputChange('cie_code', e.target.value)}
                        placeholder="Código CIE-10 (ej: A099)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de contingencia *
                      </label>
                      <Select value={formData.contingency_type} onValueChange={(value) => handleInputChange('contingency_type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Enfermedad general">Enfermedad general</SelectItem>
                          <SelectItem value="Accidente de trabajo">Accidente de trabajo</SelectItem>
                          <SelectItem value="Enfermedad profesional">Enfermedad profesional</SelectItem>
                          <SelectItem value="Accidente común">Accidente común</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reposo (horas) *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.rest_hours}
                        onChange={(e) => handleInputChange('rest_hours', e.target.value)}
                        placeholder="24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reposo (días) *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.rest_days}
                        onChange={(e) => handleInputChange('rest_days', e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desde *
                      </label>
                      <Input
                        type="date"
                        value={formData.rest_from_date}
                        onChange={(e) => handleInputChange('rest_from_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hasta *
                      </label>
                      <Input
                        type="date"
                        value={formData.rest_to_date}
                        onChange={(e) => handleInputChange('rest_to_date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. FIRMA DE RESPONSABILIDAD */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">3.- FIRMA DE RESPONSABILIDAD</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del profesional emisor *
                      </label>
                      <Input
                        value={formData.doctor_name}
                        onChange={(e) => handleInputChange('doctor_name', e.target.value)}
                        placeholder="Nombre completo del médico"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de cédula del profesional emisor *
                      </label>
                      <Input
                        value={formData.doctor_cedula}
                        onChange={(e) => handleInputChange('doctor_cedula', e.target.value)}
                        placeholder="Cédula del médico"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Especialidad del profesional de la salud *
                      </label>
                      <Input
                        value={formData.doctor_specialty}
                        onChange={(e) => handleInputChange('doctor_specialty', e.target.value)}
                        placeholder="Especialidad médica"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo electrónico
                      </label>
                      <Input
                        type="email"
                        value={formData.doctor_email}
                        onChange={(e) => handleInputChange('doctor_email', e.target.value)}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* INFORMACIÓN DEL ESTABLECIMIENTO */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">INFORMACIÓN DEL ESTABLECIMIENTO</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del establecimiento *
                      </label>
                      <Input
                        value={formData.establishment_name}
                        onChange={(e) => handleInputChange('establishment_name', e.target.value)}
                        placeholder="Nombre del centro médico"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección del establecimiento
                      </label>
                      <Input
                        value={formData.establishment_address}
                        onChange={(e) => handleInputChange('establishment_address', e.target.value)}
                        placeholder="Dirección completa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono del establecimiento
                      </label>
                      <Input
                        value={formData.establishment_phone}
                        onChange={(e) => handleInputChange('establishment_phone', e.target.value)}
                        placeholder="Teléfono de contacto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RUC del establecimiento
                      </label>
                      <Input
                        value={formData.establishment_ruc}
                        onChange={(e) => handleInputChange('establishment_ruc', e.target.value)}
                        placeholder="RUC del establecimiento"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de emisión *
                      </label>
                      <Input
                        type="date"
                        value={formData.issue_date}
                        onChange={(e) => handleInputChange('issue_date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones adicionales
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={formData.observations}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    placeholder="Observaciones adicionales (opcional)"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {selectedCertificate ? 'Actualizar' : 'Crear'} Certificado
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}