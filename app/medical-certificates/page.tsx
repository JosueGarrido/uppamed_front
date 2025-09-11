'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { medicalCertificateService } from '@/services/medicalCertificate.service';
import { userService } from '@/services/user.service';
import { cie10Service, CIE10Result } from '@/services/cie10.service';
import { pdfGenerator } from '@/lib/pdfGenerator';
import { MedicalCertificate, MedicalCertificateFormData } from '@/types/medicalCertificate';
import { User } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import CIE10Search from '@/components/CIE10Search';
import { 
  Plus, 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  User as UserIcon,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface ExtendedFormData extends MedicalCertificateFormData {
  patient_id: number;
}

export default function MedicalCertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCertificates, setTotalCertificates] = useState(0);
  
  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<MedicalCertificate | null>(null);
  
  // Formulario
  const [formData, setFormData] = useState<ExtendedFormData>({
    patient_id: 0,
    patient_name: '',
    patient_age: 0,
    patient_address: '',
    patient_phone: '',
    patient_institution: '',
    patient_occupation: '',
    patient_cedula: '',
    patient_clinical_history: '',
    diagnosis: '',
    cie_code: '',
    contingency_type: 'Enfermedad general',
    rest_hours: 24,
    rest_days: 1,
    rest_from_date: new Date().toISOString().split('T')[0],
    rest_to_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    doctor_name: user?.username || '',
    doctor_cedula: user?.cedula || '',
    doctor_specialty: user?.speciality || '',
    doctor_email: user?.email || '',
    establishment_name: 'Centro Médico UppaMed',
    establishment_address: '',
    establishment_phone: '',
    establishment_ruc: '',
    issue_date: new Date().toISOString().split('T')[0],
    observations: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.role === 'Especialista') {
      loadData();
      loadPatients();
    }
  }, [user, currentPage, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await medicalCertificateService.getSpecialistCertificates({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      });
      
      setCertificates(response.certificates);
      setTotalPages(response.pagination.totalPages);
      setTotalCertificates(response.pagination.total);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Error al cargar los certificados médicos');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      const patientUsers = allUsers.filter(u => u.role === 'Paciente');
      setPatients(patientUsers);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Error al cargar los pacientes');
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof ExtendedFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar selección de paciente
  const handlePatientSelect = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patient_id: patientId,
        patient_name: patient.username,
        patient_cedula: patient.cedula || '',
        patient_phone: patient.phone || '',
        patient_address: patient.address || ''
      }));
    }
  };

  // Manejar selección de CIE-10
  const handleCIESelect = (cie: CIE10Result) => {
    setFormData(prev => ({
      ...prev,
      diagnosis: cie.description,
      cie_code: cie.code
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditModalOpen && selectedCertificate) {
        await medicalCertificateService.updateMedicalCertificate(selectedCertificate.id, formData);
        toast.success('Certificado médico actualizado correctamente');
      } else {
        await medicalCertificateService.createMedicalCertificate(formData);
        toast.success('Certificado médico creado correctamente');
      }

      // Recargar datos
      await loadData();

      // Cerrar modal y limpiar formulario
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting certificate:', error);
      toast.error('Error al guardar el certificado médico');
    } finally {
      setSubmitting(false);
    }
  };

  // Limpiar formulario
  const resetForm = () => {
    setFormData({
      patient_id: 0,
      patient_name: '',
      patient_age: 0,
      patient_address: '',
      patient_phone: '',
      patient_institution: '',
      patient_occupation: '',
      patient_cedula: '',
      patient_clinical_history: '',
      diagnosis: '',
      cie_code: '',
      contingency_type: 'Enfermedad general',
      rest_hours: 24,
      rest_days: 1,
      rest_from_date: new Date().toISOString().split('T')[0],
      rest_to_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      doctor_name: user?.username || '',
      doctor_cedula: user?.cedula || '',
      doctor_specialty: user?.speciality || '',
      doctor_email: user?.email || '',
      establishment_name: 'Centro Médico UppaMed',
      establishment_address: '',
      establishment_phone: '',
      establishment_ruc: '',
      issue_date: new Date().toISOString().split('T')[0],
      observations: ''
    });
  };

  // Abrir modales
  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (certificate: MedicalCertificate) => {
    setSelectedCertificate(certificate);
    setFormData({
      patient_id: certificate.patient_id,
      patient_name: certificate.patient_name,
      patient_age: certificate.patient_age,
      patient_address: certificate.patient_address || '',
      patient_phone: certificate.patient_phone || '',
      patient_institution: certificate.patient_institution || '',
      patient_occupation: certificate.patient_occupation || '',
      patient_cedula: certificate.patient_cedula || '',
      patient_clinical_history: certificate.patient_clinical_history || '',
      diagnosis: certificate.diagnosis,
      cie_code: certificate.cie_code || '',
      contingency_type: certificate.contingency_type,
      rest_hours: certificate.rest_hours,
      rest_days: certificate.rest_days,
      rest_from_date: certificate.rest_from_date,
      rest_to_date: certificate.rest_to_date,
      doctor_name: certificate.doctor_name,
      doctor_cedula: certificate.doctor_cedula,
      doctor_specialty: certificate.doctor_specialty,
      doctor_email: certificate.doctor_email || '',
      establishment_name: certificate.establishment_name,
      establishment_address: certificate.establishment_address || '',
      establishment_phone: certificate.establishment_phone || '',
      establishment_ruc: certificate.establishment_ruc || '',
      issue_date: certificate.issue_date,
      observations: certificate.observations || ''
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (certificate: MedicalCertificate) => {
    setSelectedCertificate(certificate);
    setIsViewModalOpen(true);
  };

  // Descargar PDF
  const handleDownloadPDF = (certificate: MedicalCertificate) => {
    try {
      pdfGenerator.downloadPDF(certificate);
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  // Anular certificado
  const handleVoidCertificate = async (certificate: MedicalCertificate) => {
    if (!confirm('¿Está seguro de que desea anular este certificado médico?')) {
      return;
    }

    try {
      await medicalCertificateService.voidMedicalCertificate(certificate.id);
      toast.success('Certificado médico anulado correctamente');
      await loadData();
    } catch (error) {
      console.error('Error voiding certificate:', error);
      toast.error('Error al anular el certificado médico');
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activo':
        return <Badge variant="success" className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>;
      case 'anulado':
        return <Badge variant="danger" className="flex items-center"><AlertCircle className="w-3 h-3 mr-1" />Anulado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Función para renderizar acciones de tabla
  const renderTableActions = (certificate: MedicalCertificate) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openViewModal(certificate)}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDownloadPDF(certificate)}
      >
        <Download className="w-4 h-4" />
      </Button>
      {certificate.status === 'activo' && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(certificate)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVoidCertificate(certificate)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );

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
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-blue-600" />
            Certificados Médicos
          </h1>
          <p className="text-gray-600 mt-2">Gestiona los certificados médicos de tus pacientes</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Certificado
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por paciente, diagnóstico o número de certificado..."
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
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="anulado">Anulados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de certificados */}
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
                      N° Certificado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnóstico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reposo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Emisión
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
                        <span className="font-mono text-sm">{certificate.certificate_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{certificate.patient_name}</p>
                          <p className="text-sm text-gray-500">{certificate.patient_cedula}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 truncate">{certificate.diagnosis}</p>
                          {certificate.cie_code && (
                            <p className="text-xs text-gray-500 font-mono">{certificate.cie_code}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{certificate.rest_days} días</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {new Date(certificate.issue_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(certificate.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {renderTableActions(certificate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear/Editar Certificado */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              {isEditModalOpen ? 'Editar Certificado Médico' : 'Nuevo Certificado Médico'}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? 'Modifica los datos del certificado médico' : 'Completa los datos para generar un nuevo certificado médico'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sección 1: Datos del Paciente */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                Datos del Paciente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="patient_id">Seleccionar Paciente *</Label>
                  <Select
                    value={formData.patient_id.toString()}
                    onValueChange={(value) => handlePatientSelect(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Seleccionar paciente...</SelectItem>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.username} - {patient.cedula}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="patient_name">Nombre Completo *</Label>
                  <Input
                    id="patient_name"
                    value={formData.patient_name}
                    onChange={(e) => handleInputChange('patient_name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="patient_age">Edad *</Label>
                  <Input
                    id="patient_age"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.patient_age}
                    onChange={(e) => handleInputChange('patient_age', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="patient_cedula">Cédula</Label>
                  <Input
                    id="patient_cedula"
                    value={formData.patient_cedula}
                    onChange={(e) => handleInputChange('patient_cedula', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="patient_phone">Teléfono</Label>
                  <Input
                    id="patient_phone"
                    value={formData.patient_phone}
                    onChange={(e) => handleInputChange('patient_phone', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="patient_address">Dirección</Label>
                  <Input
                    id="patient_address"
                    value={formData.patient_address}
                    onChange={(e) => handleInputChange('patient_address', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="patient_institution">Institución</Label>
                  <Input
                    id="patient_institution"
                    value={formData.patient_institution}
                    onChange={(e) => handleInputChange('patient_institution', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="patient_occupation">Ocupación</Label>
                  <Input
                    id="patient_occupation"
                    value={formData.patient_occupation}
                    onChange={(e) => handleInputChange('patient_occupation', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="patient_clinical_history">N° Historia Clínica</Label>
                  <Input
                    id="patient_clinical_history"
                    value={formData.patient_clinical_history}
                    onChange={(e) => handleInputChange('patient_clinical_history', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Diagnóstico y Reposo */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <Stethoscope className="mr-2 h-5 w-5" />
                Diagnóstico y Reposo Médico
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Diagnóstico (CIE-10) *</Label>
                  <CIE10Search
                    onSelect={handleCIESelect}
                    placeholder="Buscar diagnóstico por código CIE-10 o descripción..."
                  />
                  {formData.diagnosis && (
                    <div className="mt-2 p-2 bg-white rounded border">
                      <p className="text-sm"><strong>Código:</strong> {formData.cie_code}</p>
                      <p className="text-sm"><strong>Descripción:</strong> {formData.diagnosis}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="contingency_type">Tipo de Contingencia *</Label>
                  <Select
                    value={formData.contingency_type}
                    onValueChange={(value) => handleInputChange('contingency_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de contingencia..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enfermedad general">Enfermedad general</SelectItem>
                      <SelectItem value="Accidente de trabajo">Accidente de trabajo</SelectItem>
                      <SelectItem value="Enfermedad profesional">Enfermedad profesional</SelectItem>
                      <SelectItem value="Accidente común">Accidente común</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rest_hours">Horas de Reposo *</Label>
                    <Input
                      id="rest_hours"
                      type="number"
                      min="0"
                      value={formData.rest_hours}
                      onChange={(e) => handleInputChange('rest_hours', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rest_days">Días de Reposo *</Label>
                    <Input
                      id="rest_days"
                      type="number"
                      min="0"
                      value={formData.rest_days}
                      onChange={(e) => handleInputChange('rest_days', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rest_from_date">Reposo Desde *</Label>
                    <Input
                      id="rest_from_date"
                      type="date"
                      value={formData.rest_from_date}
                      onChange={(e) => handleInputChange('rest_from_date', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rest_to_date">Reposo Hasta *</Label>
                    <Input
                      id="rest_to_date"
                      type="date"
                      value={formData.rest_to_date}
                      onChange={(e) => handleInputChange('rest_to_date', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Información del Médico */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Información del Médico</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctor_name">Nombre del Médico *</Label>
                  <Input
                    id="doctor_name"
                    value={formData.doctor_name}
                    onChange={(e) => handleInputChange('doctor_name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="doctor_cedula">Cédula del Médico *</Label>
                  <Input
                    id="doctor_cedula"
                    value={formData.doctor_cedula}
                    onChange={(e) => handleInputChange('doctor_cedula', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="doctor_specialty">Especialidad *</Label>
                  <Input
                    id="doctor_specialty"
                    value={formData.doctor_specialty}
                    onChange={(e) => handleInputChange('doctor_specialty', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="doctor_email">Email del Médico</Label>
                  <Input
                    id="doctor_email"
                    type="email"
                    value={formData.doctor_email}
                    onChange={(e) => handleInputChange('doctor_email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Información del Establecimiento */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-3">Información del Establecimiento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="establishment_name">Nombre del Establecimiento *</Label>
                  <Input
                    id="establishment_name"
                    value={formData.establishment_name}
                    onChange={(e) => handleInputChange('establishment_name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="establishment_address">Dirección del Establecimiento</Label>
                  <Input
                    id="establishment_address"
                    value={formData.establishment_address}
                    onChange={(e) => handleInputChange('establishment_address', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="establishment_phone">Teléfono del Establecimiento</Label>
                  <Input
                    id="establishment_phone"
                    value={formData.establishment_phone}
                    onChange={(e) => handleInputChange('establishment_phone', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="establishment_ruc">RUC del Establecimiento</Label>
                  <Input
                    id="establishment_ruc"
                    value={formData.establishment_ruc}
                    onChange={(e) => handleInputChange('establishment_ruc', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sección 5: Información Adicional */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Información Adicional</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="issue_date">Fecha de Emisión *</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => handleInputChange('issue_date', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
              }}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'Guardando...' : (isEditModalOpen ? 'Actualizar Certificado' : 'Crear Certificado')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Certificado */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Ver Certificado Médico
            </DialogTitle>
            <DialogDescription>
              Detalles del certificado médico N° {selectedCertificate?.certificate_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-6">
              {/* Información del Paciente */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Datos del Paciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><strong>Nombre:</strong> {selectedCertificate.patient_name}</p>
                  <p><strong>Edad:</strong> {selectedCertificate.patient_age} años</p>
                  <p><strong>Cédula:</strong> {selectedCertificate.patient_cedula || 'No especificada'}</p>
                  <p><strong>Teléfono:</strong> {selectedCertificate.patient_phone || 'No especificado'}</p>
                  <p className="md:col-span-2"><strong>Dirección:</strong> {selectedCertificate.patient_address || 'No especificada'}</p>
                  <p><strong>Institución:</strong> {selectedCertificate.patient_institution || 'No especificada'}</p>
                  <p><strong>Ocupación:</strong> {selectedCertificate.patient_occupation || 'No especificada'}</p>
                </div>
              </div>

              {/* Diagnóstico y Reposo */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Diagnóstico y Reposo</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Diagnóstico:</strong> {selectedCertificate.diagnosis}</p>
                  {selectedCertificate.cie_code && (
                    <p><strong>Código CIE-10:</strong> {selectedCertificate.cie_code}</p>
                  )}
                  <p><strong>Tipo de Contingencia:</strong> {selectedCertificate.contingency_type}</p>
                  <p><strong>Reposo:</strong> {selectedCertificate.rest_hours} horas, {selectedCertificate.rest_days} días</p>
                  <p><strong>Desde:</strong> {new Date(selectedCertificate.rest_from_date).toLocaleDateString()}</p>
                  <p><strong>Hasta:</strong> {new Date(selectedCertificate.rest_to_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Información del Médico */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">Información del Médico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><strong>Nombre:</strong> {selectedCertificate.doctor_name}</p>
                  <p><strong>Cédula:</strong> {selectedCertificate.doctor_cedula}</p>
                  <p><strong>Especialidad:</strong> {selectedCertificate.doctor_specialty}</p>
                  <p><strong>Email:</strong> {selectedCertificate.doctor_email || 'No especificado'}</p>
                </div>
              </div>

              {/* Estado y Observaciones */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Información Adicional</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Estado:</strong> {getStatusBadge(selectedCertificate.status)}</p>
                  <p><strong>Fecha de Emisión:</strong> {new Date(selectedCertificate.issue_date).toLocaleDateString()}</p>
                  <p><strong>Fecha de Creación:</strong> {new Date(selectedCertificate.createdAt).toLocaleString()}</p>
                  {selectedCertificate.observations && (
                    <p><strong>Observaciones:</strong> {selectedCertificate.observations}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Cerrar
            </Button>
            {selectedCertificate && (
              <Button onClick={() => handleDownloadPDF(selectedCertificate)}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
