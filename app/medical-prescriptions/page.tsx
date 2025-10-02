'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { medicalPrescriptionService } from '@/services/medicalPrescription.service';
import { userService } from '@/services/user.service';
import { tenantService } from '@/services/tenant.service';
import { MedicalPrescription, Medication, Instruction } from '@/types/medicalPrescription';
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

export default function MedicalPrescriptionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [prescriptions, setPrescriptions] = useState<MedicalPrescription[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrescriptions, setTotalPrescriptions] = useState(0);
  
  // Estados para el modal de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<MedicalPrescription | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    // Datos del paciente
    patient_name: '',
    patient_age: '',
    patient_cedula: '',
    patient_city: 'QUITO',
    // Medicamentos
    medications: [] as Medication[],
    // Diagnóstico
    diagnosis: '',
    cie_code: '',
    allergy_history: 'NO REFIERE',
    // Instrucciones
    instructions: [] as Instruction[],
    // Próxima cita
    next_appointment_date: '',
    next_appointment_time: '',
    // Recomendaciones
    non_pharmacological_recommendations: '',
    // Información del médico
    doctor_name: '',
    doctor_cedula: '',
    doctor_specialty: '',
    doctor_email: '',
    // Información del establecimiento
    establishment_name: 'CENTRO DE ESPECIALIDADES MÉDICAS Y ODONTOLÓGICAS SAN FRANCISCO',
    establishment_address: 'Gabriel García Moreno N4-333 y Pasaje Loja, (Diagonal a Rapifrenos)',
    establishment_phone: '02 282 2015 – 093 937 2744',
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
      
      const response = await medicalPrescriptionService.getSpecialistPrescriptions({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter
      });
      
      setPrescriptions(response.prescriptions);
      setTotalPages(response.pagination.totalPages);
      setTotalPrescriptions(response.pagination.total);
    } catch (error) {
      console.error('❌ Error loading prescriptions:', error);
      toast.error('Error al cargar las recetas médicas');
      setPrescriptions([]);
      setTotalPages(1);
      setTotalPrescriptions(0);
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
  const openCreateModal = async () => {
    setSelectedPrescription(null);
    const today = new Date().toISOString().split('T')[0];
    
    // Obtener información del tenant (sin pasar tenantId para usar /my/tenant)
    let tenantData = null;
    try {
      tenantData = await tenantService.getTenantById();
    } catch (error) {
      console.error('Error al cargar información del tenant:', error);
    }
    
    setFormData({
      patient_id: '',
      patient_name: '',
      patient_age: '',
      patient_cedula: '',
      patient_city: 'QUITO',
      medications: [],
      diagnosis: '',
      cie_code: '',
      allergy_history: 'NO REFIERE',
      instructions: [],
      next_appointment_date: '',
      next_appointment_time: '',
      non_pharmacological_recommendations: '',
      doctor_name: user?.name || user?.username || '',
      doctor_cedula: user?.identification_number || '',
      doctor_specialty: user?.specialty || user?.especialidad || '',
      doctor_email: user?.email || '',
      establishment_name: tenantData?.name || 'CENTRO DE ESPECIALIDADES MÉDICAS Y ODONTOLÓGICAS SAN FRANCISCO',
      establishment_address: tenantData?.address || '',
      establishment_phone: tenantData?.phone || '',
      establishment_ruc: tenantData?.ruc || '',
      issue_date: today,
      observations: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    
    setTimeout(() => {
      setSelectedPrescription(null);
      setFormData({
        patient_id: '',
        patient_name: '',
        patient_age: '',
        patient_cedula: '',
        patient_city: 'QUITO',
        medications: [],
        diagnosis: '',
        cie_code: '',
        allergy_history: 'NO REFIERE',
        instructions: [],
        next_appointment_date: '',
        next_appointment_time: '',
        non_pharmacological_recommendations: '',
        doctor_name: '',
        doctor_cedula: '',
        doctor_specialty: '',
        doctor_email: '',
        establishment_name: '',
        establishment_address: '',
        establishment_phone: '',
        establishment_ruc: '',
        issue_date: '',
        observations: ''
      });
    }, 150);
  };

  // Función para ver receta
  const handleViewPrescription = async (prescription: MedicalPrescription) => {
    try {
      const fullPrescription = await medicalPrescriptionService.getPrescriptionById(prescription.id);
      setSelectedPrescription(fullPrescription);
      setIsViewModalOpen(true);
    } catch (error) {
      toast.error('Error al cargar los detalles de la receta');
    }
  };

  // Función para editar receta
  const handleEditPrescription = async (prescription: MedicalPrescription) => {
    try {
      setIsViewModalOpen(false);
      setIsModalOpen(false);
      
      const fullPrescription = await medicalPrescriptionService.getPrescriptionById(prescription.id);
      
      setFormData({
        patient_id: fullPrescription.patient_id?.toString() ?? '',
        patient_name: fullPrescription.patient_name ?? '',
        patient_age: fullPrescription.patient_age?.toString() ?? '',
        patient_cedula: fullPrescription.patient_cedula ?? '',
        patient_city: fullPrescription.patient_city ?? 'QUITO',
        medications: fullPrescription.medications ?? [],
        diagnosis: fullPrescription.diagnosis ?? '',
        cie_code: fullPrescription.cie_code ?? '',
        allergy_history: fullPrescription.allergy_history ?? 'NO REFIERE',
        instructions: fullPrescription.instructions ?? [],
        next_appointment_date: fullPrescription.next_appointment_date ?? '',
        next_appointment_time: fullPrescription.next_appointment_time ?? '',
        non_pharmacological_recommendations: fullPrescription.non_pharmacological_recommendations ?? '',
        doctor_name: fullPrescription.doctor_name ?? '',
        doctor_cedula: fullPrescription.doctor_cedula ?? '',
        doctor_specialty: fullPrescription.doctor_specialty ?? '',
        doctor_email: fullPrescription.doctor_email ?? '',
        establishment_name: fullPrescription.establishment_name ?? '',
        establishment_address: fullPrescription.establishment_address ?? '',
        establishment_phone: fullPrescription.establishment_phone ?? '',
        establishment_ruc: fullPrescription.establishment_ruc ?? '',
        issue_date: fullPrescription.issue_date ?? '',
        observations: fullPrescription.observations ?? ''
      });
      
      setTimeout(() => {
        setSelectedPrescription(fullPrescription);
        setIsEditModalOpen(true);
      }, 100);
    } catch (error) {
      toast.error('Error al cargar los datos de la receta para editar');
    }
  };

  // Función para descargar receta en PDF
  const handleDownloadPDF = async (prescription: MedicalPrescription) => {
    try {
      toast.info('Generando PDF...');
      
      const { PrescriptionPDFGenerator } = await import('@/lib/prescriptionPdfGenerator');
      const generator = new PrescriptionPDFGenerator();
      generator.downloadPDF(prescription);
      
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  // Función para anular receta
  const handleVoidPrescription = async (prescription: MedicalPrescription) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas anular la receta de ${prescription.patient_name}?`
    );
    
    if (confirmed) {
      try {
        await medicalPrescriptionService.voidMedicalPrescription(prescription.id);
        toast.success('Receta anulada exitosamente');
        loadData();
      } catch (error) {
        toast.error('Error al anular la receta');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === parseInt(patientId));
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patient_id: patientId,
        patient_name: patient.name || patient.username,
        patient_cedula: patient.identification_number || ''
      }));
    }
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', quantity: 1, quantity_text: 'UNO', instructions: '' }]
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { medication_name: '', instruction: '' }]
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index: number, field: keyof Instruction, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? { ...inst, [field]: value } : inst
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      // Debug: Verificar estado de autenticación
      console.log('🔍 Estado de autenticación:', {
        isAuthenticated: user?.role === 'Especialista',
        userRole: user?.role,
        userId: user?.id,
        userName: user?.name || user?.username
      });

      // Debug: Probar autenticación con endpoint de debug
      try {
        const debugResponse = await fetch('https://uppamed.vercel.app/debug-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        const debugData = await debugResponse.json();
        console.log('🔍 Debug auth response:', debugData);
      } catch (debugError) {
        console.error('❌ Error en debug auth:', debugError);
      }

      // Debug: Probar endpoint de logs
      try {
        const testResponse = await fetch('https://uppamed.vercel.app/test-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({ test: 'data' })
        });
        const testData = await testResponse.json();
        console.log('🧪 Test logs response:', testData);
      } catch (testError) {
        console.error('❌ Error en test logs:', testError);
      }

      // Debug: Probar endpoint de deployment
      try {
        const deploymentResponse = await fetch('https://uppamed.vercel.app/test-deployment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ test: 'deployment' })
        });
        const deploymentData = await deploymentResponse.json();
        console.log('🚀 Test deployment response:', deploymentData);
      } catch (deploymentError) {
        console.error('❌ Error en test deployment:', deploymentError);
      }

      // Validar campos obligatorios
      const requiredFields = [
        { field: 'patient_id', name: 'Paciente' },
        { field: 'patient_name', name: 'Nombre del paciente' },
        { field: 'patient_age', name: 'Edad del paciente' },
        { field: 'diagnosis', name: 'Diagnóstico' },
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

      if (formData.medications.length === 0) {
        toast.error('Debe agregar al menos un medicamento');
        return;
      }

      // Preparar datos para enviar al backend
      const prescriptionData = {
        patient_id: parseInt(formData.patient_id),
        patient_name: formData.patient_name,
        patient_age: parseInt(formData.patient_age),
        patient_cedula: formData.patient_cedula,
        patient_city: formData.patient_city,
        medications: formData.medications,
        diagnosis: formData.diagnosis,
        cie_code: formData.cie_code,
        allergy_history: formData.allergy_history,
        instructions: formData.instructions,
        next_appointment_date: formData.next_appointment_date,
        next_appointment_time: formData.next_appointment_time,
        non_pharmacological_recommendations: formData.non_pharmacological_recommendations,
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

      if (selectedPrescription) {
        await medicalPrescriptionService.updateMedicalPrescription(selectedPrescription.id, prescriptionData);
        toast.success('Receta médica actualizada exitosamente');
      } else {
        await medicalPrescriptionService.createMedicalPrescription(prescriptionData);
        toast.success('Receta médica creada exitosamente');
      }
      
      closeModal();
      loadData();
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      
      // Log detallado del error para debug
      if (error.response?.data) {
        console.error('📋 Detalles del error del servidor:', {
          status: error.response?.status,
          data: error.response?.data,
          debug: error.response?.data?.debug,
          error: error.response?.data?.error,
          errorName: error.response?.data?.errorName
        });
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear la receta médica';
      const debugInfo = error.response?.data?.debug;
      
      if (debugInfo) {
        console.error('🔍 Debug Info:', debugInfo);
      }
      
      toast.error(errorMessage);
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
                  Recetas Médicas
                </h1>
                <p className="text-gray-600 mt-2">Gestiona las recetas médicas de tus pacientes</p>
              </div>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Receta
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

            {/* Lista de recetas */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Recetas Médicas</CardTitle>
                <CardDescription>
                  Total: {totalPrescriptions} recetas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recetas médicas</h3>
                    <p className="text-gray-600 mb-4">Comienza creando tu primera receta médica.</p>
                    <Button onClick={openCreateModal}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Receta
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
                        {prescriptions.map((prescription) => (
                          <tr key={prescription.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {prescription.patient_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {prescription.patient_age} años
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {prescription.diagnosis}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(prescription.issue_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(prescription.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPrescription(prescription)}
                                  title="Ver detalles"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadPDF(prescription)}
                                  title="Descargar PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                {prescription.status === 'activo' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditPrescription(prescription)}
                                      title="Editar receta"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleVoidPrescription(prescription)}
                                      title="Anular receta"
                                      className="text-red-600 hover:text-red-700"
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

            {/* Modal para crear/editar receta */}
            {(isModalOpen || isEditModalOpen) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">
                        {selectedPrescription ? 'Editar Receta Médica' : 'Nueva Receta Médica'}
                      </h2>
                      <Button variant="outline" onClick={closeModal}>
                        ✕
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Información del Paciente */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Paciente *</label>
                          <Select value={formData.patient_id} onValueChange={handlePatientSelect}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar paciente" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                  {patient.name || patient.username} - {patient.identification_number}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Nombre del Paciente *</label>
                          <Input
                            value={formData.patient_name}
                            onChange={(e) => handleInputChange('patient_name', e.target.value)}
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Edad *</label>
                          <Input
                            type="number"
                            value={formData.patient_age}
                            onChange={(e) => handleInputChange('patient_age', e.target.value)}
                            placeholder="Edad"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Cédula</label>
                          <Input
                            value={formData.patient_cedula}
                            onChange={(e) => handleInputChange('patient_cedula', e.target.value)}
                            placeholder="Número de cédula"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Ciudad</label>
                          <Input
                            value={formData.patient_city}
                            onChange={(e) => handleInputChange('patient_city', e.target.value)}
                            placeholder="Ciudad"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Fecha de Emisión *</label>
                          <Input
                            type="date"
                            value={formData.issue_date}
                            onChange={(e) => handleInputChange('issue_date', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Medicamentos */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Medicamentos *</h3>
                          <Button type="button" onClick={addMedication} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Medicamento
                          </Button>
                        </div>
                        {formData.medications.map((medication, index) => (
                          <div key={index} className="p-4 border rounded-lg mb-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">Medicamento</label>
                                <Input
                                  value={medication.name}
                                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                  placeholder="Nombre del medicamento"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Cantidad</label>
                                <Input
                                  type="number"
                                  value={medication.quantity}
                                  onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                                  placeholder="Cantidad"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Cantidad en Texto</label>
                                <Input
                                  value={medication.quantity_text}
                                  onChange={(e) => updateMedication(index, 'quantity_text', e.target.value)}
                                  placeholder="Ej: UNO, DOS, etc."
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => removeMedication(index)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Indicaciones (Cómo tomar)</label>
                              <textarea
                                value={medication.instructions || ''}
                                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                placeholder="Ej: Tomar 1 tableta cada 8 horas después de las comidas por 7 días"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Diagnóstico */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Diagnóstico *</label>
                          <Input
                            value={formData.diagnosis}
                            onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                            placeholder="Diagnóstico"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Código CIE-10</label>
                          <Input
                            value={formData.cie_code}
                            onChange={(e) => handleInputChange('cie_code', e.target.value)}
                            placeholder="Código CIE-10"
                          />
                        </div>
                      </div>

                      {/* Antecedentes de Alergias */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Antecedentes de Alergias</label>
                        <textarea
                          value={formData.allergy_history}
                          onChange={(e) => handleInputChange('allergy_history', e.target.value)}
                          placeholder="Ej: NO REFIERE, Alergia a la penicilina, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>

                      {/* Recomendaciones No Farmacológicas */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Recomendaciones No Farmacológicas</label>
                        <textarea
                          value={formData.non_pharmacological_recommendations}
                          onChange={(e) => handleInputChange('non_pharmacological_recommendations', e.target.value)}
                          placeholder="Ej: Reposo relativo, hidratación abundante, dieta blanda, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>

                      {/* Información del Médico */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nombre del Médico *</label>
                          <Input
                            value={formData.doctor_name}
                            onChange={(e) => handleInputChange('doctor_name', e.target.value)}
                            placeholder="Nombre completo del médico"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Cédula del Médico *</label>
                          <Input
                            value={formData.doctor_cedula}
                            onChange={(e) => handleInputChange('doctor_cedula', e.target.value)}
                            placeholder="Cédula del médico"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Especialidad *</label>
                          <Input
                            value={formData.doctor_specialty}
                            onChange={(e) => handleInputChange('doctor_specialty', e.target.value)}
                            placeholder="Especialidad médica"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email del Médico</label>
                          <Input
                            type="email"
                            value={formData.doctor_email}
                            onChange={(e) => handleInputChange('doctor_email', e.target.value)}
                            placeholder="Email del médico"
                          />
                        </div>
                      </div>

                      {/* Información del Establecimiento */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nombre del Establecimiento *</label>
                          <Input
                            value={formData.establishment_name}
                            onChange={(e) => handleInputChange('establishment_name', e.target.value)}
                            placeholder="Nombre del establecimiento"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Dirección</label>
                          <Input
                            value={formData.establishment_address}
                            onChange={(e) => handleInputChange('establishment_address', e.target.value)}
                            placeholder="Dirección del establecimiento"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Teléfono</label>
                          <Input
                            value={formData.establishment_phone}
                            onChange={(e) => handleInputChange('establishment_phone', e.target.value)}
                            placeholder="Teléfono del establecimiento"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">RUC</label>
                          <Input
                            value={formData.establishment_ruc}
                            onChange={(e) => handleInputChange('establishment_ruc', e.target.value)}
                            placeholder="RUC del establecimiento"
                          />
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Button variant="outline" onClick={closeModal}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSubmit}>
                          {selectedPrescription ? 'Actualizar Receta' : 'Crear Receta'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para ver receta */}
            {isViewModalOpen && selectedPrescription && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Detalles de la Receta Médica</h2>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditPrescription(selectedPrescription)}
                          disabled={selectedPrescription.status === 'anulado'}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="outline" onClick={closeModal}>
                          ✕
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Información del Paciente */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Paciente</label>
                          <p className="text-lg font-semibold">{selectedPrescription.patient_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Edad</label>
                          <p className="text-lg">{selectedPrescription.patient_age} años</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Cédula</label>
                          <p className="text-lg">{selectedPrescription.patient_cedula}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Ciudad</label>
                          <p className="text-lg">{selectedPrescription.patient_city}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Emisión</label>
                          <p className="text-lg">{new Date(selectedPrescription.issue_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                          {getStatusBadge(selectedPrescription.status)}
                        </div>
                      </div>

                      {/* Medicamentos */}
                      {selectedPrescription.medications && selectedPrescription.medications.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Medicamentos</h3>
                          <div className="space-y-2">
                            {selectedPrescription.medications.map((medication, index) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <p className="font-medium">{medication.name}</p>
                                <p className="text-sm text-gray-600">Cantidad: {medication.quantity_text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diagnóstico */}
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Diagnóstico</label>
                        <p className="text-lg">{selectedPrescription.diagnosis}</p>
                        {selectedPrescription.cie_code && (
                          <p className="text-sm text-gray-600">Código CIE-10: {selectedPrescription.cie_code}</p>
                        )}
                      </div>

                      {/* Información del Médico */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Médico</label>
                          <p className="text-lg font-semibold">{selectedPrescription.doctor_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Cédula</label>
                          <p className="text-lg">{selectedPrescription.doctor_cedula}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Especialidad</label>
                          <p className="text-lg">{selectedPrescription.doctor_specialty}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                          <p className="text-lg">{selectedPrescription.doctor_email}</p>
                        </div>
                      </div>

                      {/* Información del Establecimiento */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Establecimiento</label>
                          <p className="text-lg font-semibold">{selectedPrescription.establishment_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
                          <p className="text-lg">{selectedPrescription.establishment_address}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                          <p className="text-lg">{selectedPrescription.establishment_phone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">RUC</label>
                          <p className="text-lg">{selectedPrescription.establishment_ruc}</p>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadPDF(selectedPrescription)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </Button>
                        <Button variant="outline" onClick={closeModal}>
                          Cerrar
                        </Button>
                      </div>
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
