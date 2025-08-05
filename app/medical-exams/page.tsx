"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { medicalExamService } from '@/services/medicalExam.service';
import { useAuth } from '@/context/AuthContext';
import { MedicalExam } from '@/types/medicalExam';
import { toast } from 'sonner';
import { 
  Microscope, 
  User, 
  Calendar, 
  Plus, 
  Eye, 
  Edit, 
  Search,
  Filter,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward
} from 'lucide-react';
import Link from 'next/link';

export default function MedicalExamsPage() {
  const [exams, setExams] = useState<MedicalExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const data = await medicalExamService.getMyMedicalExams();
        setExams(data);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching exams:', err);
        setError('Error al obtener los exámenes médicos');
        toast.error('Error al cargar los exámenes médicos');
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchExams();
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

  const getResultBadge = (results: string) => {
    if (results?.toLowerCase().includes('normal') || results?.toLowerCase().includes('negativo')) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>;
    } else if (results?.toLowerCase().includes('anormal') || results?.toLowerCase().includes('positivo')) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Anormal</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
    }
  };

  // Filtrado optimizado con useMemo
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      return (
        exam.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.results?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [exams, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando exámenes médicos...</p>
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
            <Microscope className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
        heading="Exámenes Médicos"
        text={`Gestión de exámenes médicos y resultados. Mostrando ${currentExams.length} de ${filteredExams.length} exámenes (página ${currentPage} de ${totalPages})`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/medical-exams/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Examen
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5 text-orange-600" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por tipo, resultado o notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de exámenes */}
      <div className="grid gap-4">
        {currentExams.length > 0 ? (
          currentExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <Microscope className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Examen #{exam.id}
                          </h3>
                          {getResultBadge(exam.results || '')}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                            <span>{formatDate(exam.date)}</span>
                          </div>
                          {user?.role !== 'Paciente' && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-orange-500" />
                              <span className="truncate">Paciente #{exam.patient_id}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <strong className="text-sm text-gray-700 flex items-center">
                              <FileText className="h-4 w-4 mr-1 text-orange-500" />
                              Tipo de Examen:
                            </strong>
                            <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                              {exam.type}
                            </p>
                          </div>
                          
                          {exam.results && (
                            <div>
                              <strong className="text-sm text-gray-700">Resultado:</strong>
                              <p className="text-sm text-gray-600 mt-1 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                                {exam.results}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <div className="flex flex-col space-y-2">
                      <Link href={`/medical-exams/${exam.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Button>
                      </Link>
                      <Link href={`/medical-exams/${exam.id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Microscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron exámenes' : 'No hay exámenes médicos'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Los exámenes médicos aparecerán aquí cuando sean creados'
                }
              </p>
              <Link href="/medical-exams/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Examen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredExams.length)} de {filteredExams.length} exámenes
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}