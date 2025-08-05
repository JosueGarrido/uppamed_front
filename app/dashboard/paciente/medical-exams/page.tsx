'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { medicalExamService } from '@/services/medicalExam.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  FileText, 
  User, 
  Calendar, 
  Search, 
  Filter, 
  Eye,
  Microscope,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Building
} from 'lucide-react';
import { MedicalExam } from '@/types/medicalExam';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function PatientMedicalExamsPage() {
  const { user } = useAuth();
  const [medicalExams, setMedicalExams] = useState<MedicalExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExam, setSelectedExam] = useState<MedicalExam | null>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadMedicalExams();
  }, []);

  const loadMedicalExams = async () => {
    try {
      setLoading(true);
      const data = await medicalExamService.getMyMedicalExams();
      setMedicalExams(data.exams || []);
    } catch (error) {
      console.error('Error loading medical exams:', error);
      toast.error('Error al cargar los exámenes médicos');
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = medicalExams.filter(exam => {
    const matchesFilter = filter === 'all' || exam.status === filter;
    const matchesSearch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.specialist?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'en_proceso':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pendiente':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelado':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, string> = {
      'completado': 'Completado',
      'en_proceso': 'En Proceso',
      'pendiente': 'Pendiente',
      'cancelado': 'Cancelado'
    };

    const statusColors: Record<string, string> = {
      'completado': 'bg-green-100 text-green-800',
      'en_proceso': 'bg-blue-100 text-blue-800',
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'cancelado': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityLabels: Record<string, string> = {
      'baja': 'Baja',
      'normal': 'Normal',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };

    const priorityColors: Record<string, string> = {
      'baja': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'alta': 'bg-orange-100 text-orange-800',
      'urgente': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={priorityColors[priority] || 'bg-gray-100 text-gray-800'}>
        {priorityLabels[priority] || priority}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCost = (cost: number | string | undefined) => {
    if (!cost) return 'No especificado';
    const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;
    return isNaN(numCost) ? 'No especificado' : `$${numCost.toFixed(2)}`;
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando exámenes médicos...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Mis Exámenes Médicos"
        text="Consulta todos tus exámenes médicos y resultados"
      />

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, tipo o especialista..."
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
                  <SelectItem value="all">Todos los exámenes</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="completado">Completados</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de exámenes médicos */}
      <div className="space-y-4">
        {paginatedExams.length > 0 ? (
          paginatedExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Microscope className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {exam.title || 'Examen sin título'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {exam.type} - Dr. {exam.specialist?.username || 'Especialista'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(exam.status)}
                        {getStatusBadge(exam.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatDate(exam.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {(exam.specialist as any)?.specialty || 'Especialidad no especificada'}
                        </span>
                      </div>
                    </div>
                    
                    {exam.description && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Descripción:</p>
                            <p className="text-sm text-gray-600">{exam.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {exam.priority && getPriorityBadge(exam.priority)}
                      {exam.category && (
                        <Badge variant="default" className="text-xs">
                          {exam.category}
                        </Badge>
                      )}
                      {exam.cost && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCost(exam.cost)}</span>
                        </div>
                      )}
                    </div>
                    
                    {exam.results && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-700">Resultados:</p>
                            <p className="text-sm text-blue-600">{exam.results}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {exam.attachments && exam.attachments.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Download className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-green-700">Archivos adjuntos:</p>
                            <p className="text-sm text-green-600">
                              {exam.attachments.length} archivo(s) disponible(s)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedExam(exam)}
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
              <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay exámenes médicos encontrados
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No tienes exámenes médicos registrados en este momento'
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
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredExams.length)} de {filteredExams.length} exámenes
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Microscope className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exámenes</p>
                <p className="text-2xl font-bold">{medicalExams.length}</p>
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
                <p className="text-2xl font-bold">
                  {medicalExams.filter(e => e.status === 'completado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">
                  {medicalExams.filter(e => e.status === 'pendiente').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold">
                  {medicalExams.filter(e => e.status === 'en_proceso').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalles */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalles del Examen Médico</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExam(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Título</h3>
                <p className="text-gray-600">{selectedExam.title || 'No especificado'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Tipo</h3>
                <p className="text-gray-600">{selectedExam.type || 'No especificado'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Especialista</h3>
                <p className="text-gray-600">Dr. {selectedExam.specialist?.username || 'No especificado'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Fecha</h3>
                <p className="text-gray-600">{formatDate(selectedExam.date)}</p>
              </div>
              
              {selectedExam.description && (
                <div>
                  <h3 className="font-semibold">Descripción</h3>
                  <p className="text-gray-600">{selectedExam.description}</p>
                </div>
              )}
              
              {selectedExam.results && (
                <div>
                  <h3 className="font-semibold">Resultados</h3>
                  <p className="text-gray-600">{selectedExam.results}</p>
                </div>
              )}
              
              {selectedExam.cost && (
                <div>
                  <h3 className="font-semibold">Costo</h3>
                  <p className="text-gray-600">{formatCost(selectedExam.cost)}</p>
                </div>
              )}
              
              {selectedExam.notes && (
                <div>
                  <h3 className="font-semibold">Notas</h3>
                  <p className="text-gray-600">{selectedExam.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
} 