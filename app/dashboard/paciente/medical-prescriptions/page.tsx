'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { medicalPrescriptionService } from '@/services/medicalPrescription.service';
import { MedicalPrescription } from '@/types/medicalPrescription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function PatientMedicalPrescriptionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [prescriptions, setPrescriptions] = useState<MedicalPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrescriptions, setTotalPrescriptions] = useState(0);
  
  // Estados para el modal de ver
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<MedicalPrescription | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (!authLoading && user?.role === 'Paciente') {
      loadData();
    }
  }, [authLoading, user, currentPage, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const response = await medicalPrescriptionService.getPatientPrescriptions({
        page: currentPage,
        limit: 10
      });
      
      // Filtrar por término de búsqueda si existe
      let filteredPrescriptions = response.prescriptions;
      if (searchTerm) {
        filteredPrescriptions = response.prescriptions.filter(prescription =>
          prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.prescription_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setPrescriptions(filteredPrescriptions);
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

  // Función para descargar receta en PDF
  const handleDownloadPDF = async (prescription: MedicalPrescription) => {
    try {
      toast.info('Generando PDF...');
      
      const { generateMedicalPrescriptionPDF } = await import('@/lib/prescriptionPdfGenerator');
      await generateMedicalPrescriptionPDF(prescription);
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setTimeout(() => {
      setSelectedPrescription(null);
    }, 150);
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

  // Verificar si el usuario es paciente
  if (user?.role !== 'Paciente') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-gray-600">Solo los pacientes pueden acceder a esta sección.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FileText className="mr-3 h-8 w-8 text-blue-600" />
                  Mis Recetas Médicas
                </h1>
                <p className="text-gray-600 mt-2">Consulta tus recetas médicas prescritas</p>
              </div>
            </div>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  Buscar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por diagnóstico, número de receta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de recetas */}
            <Card>
              <CardHeader>
                <CardTitle>Mis Recetas Médicas</CardTitle>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes recetas médicas</h3>
                    <p className="text-gray-600">Las recetas que te prescriban aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Diagnóstico
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Médico
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
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {prescription.diagnosis}
                              </div>
                              <div className="text-sm text-gray-500">
                                #{prescription.prescription_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {prescription.doctor_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {prescription.doctor_specialty}
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

            {/* Modal para ver detalles de la receta */}
            {isViewModalOpen && selectedPrescription && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Detalles de la Receta Médica
                      </h2>
                      <Button variant="outline" size="sm" onClick={closeModal}>
                        ✕
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Información del paciente */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Información del Paciente</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Nombre:</span> {selectedPrescription.patient_name}
                          </div>
                          <div>
                            <span className="font-medium">Edad:</span> {selectedPrescription.patient_age} años
                          </div>
                          <div>
                            <span className="font-medium">Cédula:</span> {selectedPrescription.patient_cedula}
                          </div>
                          <div>
                            <span className="font-medium">Ciudad:</span> {selectedPrescription.patient_city}
                          </div>
                        </div>
                      </div>

                      {/* Medicamentos */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Medicamentos Prescritos</h3>
                        <div className="space-y-2 text-sm">
                          {selectedPrescription.medications.map((medication, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-3">
                              <div className="font-medium">{medication.name}</div>
                              <div className="text-gray-600">Cantidad: {medication.quantity} ({medication.quantity_text})</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Diagnóstico */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Diagnóstico</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Diagnóstico:</span> {selectedPrescription.diagnosis}
                          </div>
                          {selectedPrescription.cie_code && (
                            <div>
                              <span className="font-medium">CIE 10:</span> {selectedPrescription.cie_code}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Antecedentes de Alergias:</span> {selectedPrescription.allergy_history}
                          </div>
                        </div>
                      </div>

                      {/* Instrucciones */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Instrucciones de Uso</h3>
                        <div className="space-y-2 text-sm">
                          {selectedPrescription.instructions.map((instruction, index) => (
                            <div key={index} className="border-l-4 border-green-500 pl-3">
                              <div className="font-medium">{instruction.medication_name}</div>
                              <div className="text-gray-600">{instruction.instruction}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Próxima cita */}
                      {selectedPrescription.next_appointment_date && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-2">Próxima Cita</h3>
                          <div className="text-sm">
                            <span className="font-medium">Fecha:</span> {new Date(selectedPrescription.next_appointment_date).toLocaleDateString()}
                            {selectedPrescription.next_appointment_time && (
                              <span className="ml-2">
                                <span className="font-medium">Hora:</span> {selectedPrescription.next_appointment_time}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recomendaciones */}
                      {selectedPrescription.non_pharmacological_recommendations && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-2">Recomendaciones No Farmacológicas</h3>
                          <div className="text-sm">
                            {selectedPrescription.non_pharmacological_recommendations}
                          </div>
                        </div>
                      )}

                      {/* Información del médico */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Información del Médico</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Nombre:</span> {selectedPrescription.doctor_name}
                          </div>
                          <div>
                            <span className="font-medium">Cédula:</span> {selectedPrescription.doctor_cedula}
                          </div>
                          <div>
                            <span className="font-medium">Especialidad:</span> {selectedPrescription.doctor_specialty}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {selectedPrescription.doctor_email}
                          </div>
                        </div>
                      </div>

                      {/* Metadatos */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Información de la Receta</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Número:</span> {selectedPrescription.prescription_number}
                          </div>
                          <div>
                            <span className="font-medium">Estado:</span> {getStatusBadge(selectedPrescription.status)}
                          </div>
                          <div>
                            <span className="font-medium">Fecha de Emisión:</span> {new Date(selectedPrescription.issue_date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Fecha de Creación:</span> {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {selectedPrescription.observations && (
                          <div className="mt-2">
                            <span className="font-medium">Observaciones:</span> {selectedPrescription.observations}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                      <Button variant="outline" onClick={closeModal}>
                        Cerrar
                      </Button>
                      <Button onClick={() => handleDownloadPDF(selectedPrescription)}>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}
