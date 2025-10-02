'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { medicalCertificateService } from '@/services/medicalCertificate.service';
import { MedicalCertificate } from '@/types/medicalCertificate';
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

export default function PatientMedicalCertificatesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCertificates, setTotalCertificates] = useState(0);
  
  // Estados para el modal de ver
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<MedicalCertificate | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (!authLoading && user?.role === 'Paciente') {
      loadData();
    }
  }, [authLoading, user, currentPage, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const response = await medicalCertificateService.getPatientCertificates({
        page: currentPage,
        limit: 10
      });
      
      // Filtrar en el frontend por búsqueda si es necesario
      let filteredCertificates = response.certificates;
      if (searchTerm) {
        filteredCertificates = filteredCertificates.filter(cert =>
          cert.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setCertificates(filteredCertificates);
      setTotalPages(response.pagination.totalPages);
      setTotalCertificates(response.pagination.total);
    } catch (error) {
      console.error('❌ Error loading certificates:', error);
      toast.error('Error al cargar los certificados médicos');
    } finally {
      setLoading(false);
    }
  };

  // Ver certificado
  const handleViewCertificate = async (certificate: MedicalCertificate) => {
    try {
      const fullCertificate = await medicalCertificateService.getCertificateById(certificate.id);
      setSelectedCertificate(fullCertificate);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error al obtener certificado por ID:', error);
      toast.error('Error al cargar los detalles del certificado');
    }
  };

  // Función para descargar certificado en PDF
  const handleDownloadPDF = async (certificate: MedicalCertificate) => {
    // No permitir descargar certificados anulados
    if (certificate.status === 'anulado') {
      toast.error('No se puede descargar un certificado anulado');
      return;
    }

    try {
      toast.info('Generando PDF...');
      
      const { PDFGenerator } = await import('@/lib/pdfGenerator');
      const generator = new PDFGenerator();
      generator.downloadPDF(certificate);
      
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setTimeout(() => {
      setSelectedCertificate(null);
    }, 150);
  };

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activo':
        return <Badge variant="default" className="bg-green-100 text-green-800 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>;
      case 'anulado':
        return <Badge variant="destructive" className="flex items-center"><AlertCircle className="w-3 h-3 mr-1" />Anulado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Mostrar loading mientras se carga la autenticación
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso denegado</h3>
            <p className="text-gray-600">Esta sección es solo para pacientes.</p>
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
                  Mis Certificados Médicos
                </h1>
                <p className="text-gray-600 mt-2">Consulta tus certificados médicos emitidos</p>
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
                        placeholder="Buscar por diagnóstico, número de certificado, médico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de certificados */}
            <Card>
              <CardHeader>
                <CardTitle>Mis Certificados Médicos</CardTitle>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes certificados médicos</h3>
                    <p className="text-gray-600">Los certificados que te emitan aparecerán aquí.</p>
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
                            Días de Reposo
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
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {certificate.diagnosis}
                              </div>
                              <div className="text-sm text-gray-500">
                                #{certificate.certificate_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {certificate.doctor_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {certificate.doctor_specialty}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {certificate.rest_days} días
                              </div>
                              <div className="text-sm text-gray-500">
                                {certificate.rest_hours} horas
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
                                  onClick={() => handleViewCertificate(certificate)}
                                  title="Ver detalles"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadPDF(certificate)}
                                  disabled={certificate.status === 'anulado'}
                                  title={certificate.status === 'anulado' ? 'No se puede descargar un certificado anulado' : 'Descargar PDF'}
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

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Modal Ver Certificado */}
            {isViewModalOpen && selectedCertificate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Detalles del Certificado Médico</h2>
                    <Button variant="ghost" onClick={closeModal}>✕</Button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Información General */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Número de Certificado</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedCertificate.certificate_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estado</p>
                        <div className="mt-1">{getStatusBadge(selectedCertificate.status)}</div>
                      </div>
                    </div>

                    {/* Información del Paciente */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Información del Paciente</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Nombre</p>
                          <p className="font-medium">{selectedCertificate.patient_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Edad</p>
                          <p className="font-medium">{selectedCertificate.patient_age} años</p>
                        </div>
                        {selectedCertificate.patient_cedula && (
                          <div>
                            <p className="text-sm text-gray-500">Cédula</p>
                            <p className="font-medium">{selectedCertificate.patient_cedula}</p>
                          </div>
                        )}
                        {selectedCertificate.patient_occupation && (
                          <div>
                            <p className="text-sm text-gray-500">Ocupación</p>
                            <p className="font-medium">{selectedCertificate.patient_occupation}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Diagnóstico */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Diagnóstico</h3>
                      <p className="text-gray-900">{selectedCertificate.diagnosis}</p>
                      {selectedCertificate.cie_code && (
                        <p className="text-sm text-gray-500 mt-1">CIE-10: {selectedCertificate.cie_code}</p>
                      )}
                    </div>

                    {/* Reposo */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Reposo Médico</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Días de Reposo</p>
                          <p className="font-medium">{selectedCertificate.rest_days} días</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Horas de Reposo</p>
                          <p className="font-medium">{selectedCertificate.rest_hours} horas</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Desde</p>
                          <p className="font-medium">{new Date(selectedCertificate.rest_from_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Hasta</p>
                          <p className="font-medium">{new Date(selectedCertificate.rest_to_date).toLocaleDateString()}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Tipo de Contingencia</p>
                          <p className="font-medium">{selectedCertificate.contingency_type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Información del Médico */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Médico Tratante</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Nombre</p>
                          <p className="font-medium">{selectedCertificate.doctor_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Especialidad</p>
                          <p className="font-medium">{selectedCertificate.doctor_specialty}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cédula Profesional</p>
                          <p className="font-medium">{selectedCertificate.doctor_cedula}</p>
                        </div>
                      </div>
                    </div>

                    {selectedCertificate.observations && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Observaciones</h3>
                        <p className="text-gray-900">{selectedCertificate.observations}</p>
                      </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                      <Button variant="outline" onClick={closeModal}>
                        Cerrar
                      </Button>
                      <Button 
                        onClick={() => handleDownloadPDF(selectedCertificate)}
                        disabled={selectedCertificate?.status === 'anulado'}
                      >
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

