'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  FileText, 
  User, 
  Calendar, 
  Search, 
  Filter, 
  Eye,
  Stethoscope,
  Pill,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { MedicalRecord } from '@/types/medicalRecord';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function PatientMedicalRecordsPage() {
  const { user } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordService.getMyMedicalRecords('Paciente');
      setMedicalRecords(data);
    } catch (error) {
      console.error('Error loading medical records:', error);
      toast.error('Error al cargar el historial médico');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesFilter = filter === 'all' || record.diagnosis?.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.specialist?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.observations?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);

  const getStatusIcon = (record: MedicalRecord) => {
    // Simplificado ya que no tenemos campos de estado específicos
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (record: MedicalRecord) => {
    // Simplificado ya que no tenemos campos de estado específicos
    return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando historial médico...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Mi Historial Médico"
        text="Consulta todos tus registros médicos y diagnósticos"
      />

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por diagnóstico, especialista o observaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los registros</SelectItem>
                  <SelectItem value="normal">Normales</SelectItem>
                  <SelectItem value="anormal">Anormales</SelectItem>
                  <SelectItem value="seguimiento">Requieren seguimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros médicos */}
      <div className="space-y-4">
        {paginatedRecords.length > 0 ? (
          paginatedRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {record.diagnosis || 'Diagnóstico no especificado'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Dr. {record.specialist?.username || 'Especialista'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record)}
                        {getStatusBadge(record)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatDate(record.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {record.specialist?.specialty || 'Especialidad no especificada'}
                        </span>
                      </div>
                    </div>
                    
                    {record.observations && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Observaciones:</p>
                            <p className="text-sm text-gray-600">{record.observations}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {record.treatment && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Pill className="h-4 w-4 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-700">Tratamiento:</p>
                            <p className="text-sm text-blue-600">{record.treatment}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay registros médicos encontrados
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No tienes registros médicos en este momento'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} de {filteredRecords.length} registros
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
                <p className="text-2xl font-bold">{medicalRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold">{medicalRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalles (simplificado) */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalles del Registro Médico</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRecord(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Diagnóstico</h3>
                <p className="text-gray-600">{selectedRecord.diagnosis || 'No especificado'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Especialista</h3>
                <p className="text-gray-600">Dr. {selectedRecord.specialist?.username || 'No especificado'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Fecha</h3>
                <p className="text-gray-600">{formatDate(selectedRecord.date)}</p>
              </div>
              
              {selectedRecord.observations && (
                <div>
                  <h3 className="font-semibold">Observaciones</h3>
                  <p className="text-gray-600">{selectedRecord.observations}</p>
                </div>
              )}
              
              {selectedRecord.treatment && (
                <div>
                  <h3 className="font-semibold">Tratamiento</h3>
                  <p className="text-gray-600">{selectedRecord.treatment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
} 