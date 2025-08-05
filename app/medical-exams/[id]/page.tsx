'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { medicalExamService } from '@/services/medicalExam.service';
import { useAuth } from '@/context/AuthContext';
import { MedicalExam } from '@/types/medicalExam';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Microscope, 
  User, 
  Calendar, 
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

export default function MedicalExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState<MedicalExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const examId = params.id as string;

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const data = await medicalExamService.getMedicalExamById(parseInt(examId));
        setExam(data);
      } catch (err) {
        console.error('Error fetching exam:', err);
        setError('Error al obtener los detalles del examen');
        toast.error('Error al cargar el examen médico');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId]);

  const handleDelete = async () => {
    if (!exam) return;
    
    setDeleting(true);
    try {
      await medicalExamService.deleteMedicalExam(exam.id);
      toast.success('Examen médico eliminado exitosamente');
      router.push('/medical-exams');
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Error al eliminar el examen médico');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCost = (cost: any) => {
    if (cost === null || cost === undefined || cost === '') return null;
    const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;
    return isNaN(numCost) ? null : numCost.toFixed(2);
  };

  const formatFileSize = (size: any) => {
    if (size === null || size === undefined || size === '') return '0.00';
    const numSize = typeof size === 'string' ? parseInt(size) : size;
    return isNaN(numSize) ? '0.00' : (numSize / 1024 / 1024).toFixed(2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'en_proceso':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'cancelado':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando detalles del examen...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !exam) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Examen no encontrado'}</p>
            <Link href="/medical-exams">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Exámenes
              </Button>
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell className="medical-exams-responsive">
      <DashboardHeader
        heading={`Examen: ${exam.title}`}
        text="Detalles completos del examen médico"
      >
        <div className="flex space-x-2">
          <Link href="/medical-exams">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Link href={`/medical-exams/${exam.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Microscope className="mr-2 h-5 w-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Título</Label>
                <p className="text-gray-900">{exam.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Tipo</Label>
                <p className="text-gray-900">{exam.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Categoría</Label>
                <p className="text-gray-900 capitalize">{exam.category}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Estado</Label>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(exam.status)}
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1).replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Prioridad</Label>
                <Badge className={getPriorityColor(exam.priority)}>
                  {exam.priority.charAt(0).toUpperCase() + exam.priority.slice(1)}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Fecha de Creación</Label>
                <p className="text-gray-900">{formatDate(exam.date)}</p>
              </div>
            </div>

            {exam.description && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Descripción</Label>
                <p className="text-gray-900 mt-1">{exam.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {exam.scheduled_date && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Programada</Label>
                  <p className="text-gray-900">{formatDate(exam.scheduled_date)}</p>
                </div>
              )}
              {exam.performed_date && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Realizada</Label>
                  <p className="text-gray-900">{formatDate(exam.performed_date)}</p>
                </div>
              )}
              {exam.report_date && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Reporte</Label>
                  <p className="text-gray-900">{formatDate(exam.report_date)}</p>
                </div>
              )}
              {exam.followup_date && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Seguimiento</Label>
                  <p className="text-gray-900">{formatDate(exam.followup_date)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5 text-purple-600" />
              Resultados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Resultados</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{exam.results}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {exam.is_abnormal && (
                <Badge className="bg-red-100 text-red-800 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Resultados Anormales
                </Badge>
              )}
              {exam.requires_followup && (
                <Badge className="bg-orange-100 text-orange-800 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Requiere Seguimiento
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exam.cost && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Costo</Label>
                  <p className="text-gray-900">${formatCost(exam.cost)}</p>
                </div>
              )}
              {exam.lab_reference && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Referencia del Laboratorio</Label>
                  <p className="text-gray-900">{exam.lab_reference}</p>
                </div>
              )}
              {exam.technician && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Técnico Responsable</Label>
                  <p className="text-gray-900">{exam.technician}</p>
                </div>
              )}
              {exam.insurance_provider && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Proveedor de Seguro</Label>
                  <p className="text-gray-900">{exam.insurance_provider}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-700">Cobertura de Seguro</Label>
                <Badge className={exam.insurance_coverage ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {exam.insurance_coverage ? 'Sí' : 'No'}
                </Badge>
              </div>
            </div>

            {exam.notes && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-700">Notas Adicionales</Label>
                <p className="text-gray-900 mt-1">{exam.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Archivos Adjuntos */}
        {exam.attachments && exam.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Download className="mr-2 h-5 w-5 text-blue-600" />
                Archivos Adjuntos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exam.attachments.map((attachment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    {/* Layout móvil: vertical */}
                    <div className="block sm:hidden">
                      <div className="flex items-start space-x-3 mb-4">
                        <FileText className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 medical-exam-file-long-name-mobile" title={attachment.originalname}>
                            {attachment.originalname}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatFileSize(attachment.size)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Button variant="outline" size="sm" className="w-full max-w-xs">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Archivo
                        </Button>
                      </div>
                    </div>
                    
                    {/* Layout desktop: horizontal */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 medical-exam-file-long-name-desktop" title={attachment.originalname}>
                            {attachment.originalname}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(attachment.size)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información del Paciente y Especialista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="mr-2 h-5 w-5 text-indigo-600" />
              Información de Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exam.patient && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Paciente</Label>
                  <div className="mt-1">
                    <p className="font-medium text-gray-900">{exam.patient.username}</p>
                    <p className="text-sm text-gray-500">{exam.patient.email}</p>
                    {exam.patient.identification_number && (
                      <p className="text-sm text-gray-500">ID: {exam.patient.identification_number}</p>
                    )}
                  </div>
                </div>
              )}
              {exam.specialist && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Especialista</Label>
                  <div className="mt-1">
                    <p className="font-medium text-gray-900">{exam.specialist.username}</p>
                    <p className="text-sm text-gray-500">{exam.specialist.email}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Examen Médico"
        description="¿Estás seguro de que quieres eliminar este examen médico? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </DashboardShell>
  );
} 