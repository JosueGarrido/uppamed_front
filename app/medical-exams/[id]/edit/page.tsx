'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { medicalExamService } from '@/services/medicalExam.service';
import { useAuth } from '@/context/AuthContext';
import { MedicalExam } from '@/types/medicalExam';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { ArrowLeft, Save, Upload, Microscope, Trash2, Edit, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditMedicalExamPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<MedicalExam | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    category: 'otros',
    description: '',
    results: '',
    status: 'pendiente',
    priority: 'normal',
    scheduled_date: '',
    performed_date: '',
    report_date: '',
    cost: '',
    insurance_coverage: false,
    insurance_provider: '',
    notes: '',
    is_abnormal: false,
    requires_followup: false,
    followup_date: '',
    lab_reference: '',
    technician: ''
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<string[]>([]);
  const [deletingAttachment, setDeletingAttachment] = useState(false);

  const examId = params.id as string;

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const data = await medicalExamService.getMedicalExamById(parseInt(examId));
        setExam(data);
        
        // Llenar el formulario con los datos existentes
        setFormData({
          title: data.title || '',
          type: data.type || '',
          category: data.category || 'otros',
          description: data.description || '',
          results: data.results || '',
          status: data.status || 'pendiente',
          priority: data.priority || 'normal',
          scheduled_date: data.scheduled_date ? new Date(data.scheduled_date).toISOString().slice(0, 16) : '',
          performed_date: data.performed_date ? new Date(data.performed_date).toISOString().slice(0, 16) : '',
          report_date: data.report_date ? new Date(data.report_date).toISOString().slice(0, 16) : '',
          cost: data.cost ? (typeof data.cost === 'string' ? data.cost : data.cost.toString()) : '',
          insurance_coverage: data.insurance_coverage || false,
          insurance_provider: data.insurance_provider || '',
          notes: data.notes || '',
          is_abnormal: data.is_abnormal || false,
          requires_followup: data.requires_followup || false,
          followup_date: data.followup_date ? new Date(data.followup_date).toISOString().slice(0, 16) : '',
          lab_reference: data.lab_reference || '',
          technician: data.technician || ''
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) return;

    setSaving(true);
    try {
      const examData = {
        ...formData,
        category: formData.category as 'laboratorio' | 'imagenologia' | 'cardiologia' | 'neurologia' | 'gastroenterologia' | 'otorrinolaringologia' | 'oftalmologia' | 'dermatologia' | 'otros',
        status: formData.status as 'pendiente' | 'en_proceso' | 'completado' | 'cancelado',
        priority: formData.priority as 'baja' | 'normal' | 'alta' | 'urgente',
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        scheduled_date: formData.scheduled_date || undefined,
        performed_date: formData.performed_date || undefined,
        report_date: formData.report_date || undefined,
        followup_date: formData.followup_date || undefined,
        attachmentsToDelete: attachmentsToDelete // Agregar archivos a eliminar
      };

      await medicalExamService.updateMedicalExam(exam.id, examData, attachments);
      toast.success('Examen médico actualizado exitosamente');
      router.push(`/medical-exams/${exam.id}`);
    } catch (error) {
      console.error('Error updating exam:', error);
      setError('Error al actualizar el examen médico');
      toast.error('Error al actualizar el examen médico');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingAttachment = async (filename: string) => {
    if (!exam) return;
    
    setDeletingAttachment(true);
    try {
      // Agregar el filename a la lista de archivos a eliminar
      setAttachmentsToDelete(prev => [...prev, filename as any]);
      
      // Actualizar el estado local para remover el archivo de la vista
      setExam(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          attachments: prev.attachments?.filter(att => att.filename !== filename) || []
        };
      });
      
      toast.success('Archivo marcado para eliminación');
    } catch (error) {
      console.error('Error marking attachment for deletion:', error);
      toast.error('Error al marcar el archivo para eliminación');
    } finally {
      setDeletingAttachment(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando examen...</p>
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
        heading={`Editar Examen: ${exam.title}`}
        text="Modificar los detalles del examen médico"
      >
        <div className="flex space-x-2">
          <Link href={`/medical-exams/${exam.id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Label htmlFor="title">Título del Examen *</Label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ej: Análisis de sangre completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Examen *</Label>
                  <Input
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    placeholder="Ej: Análisis de sangre, Rayos X, etc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laboratorio">Laboratorio</SelectItem>
                      <SelectItem value="imagenologia">Imagenología</SelectItem>
                      <SelectItem value="cardiologia">Cardiología</SelectItem>
                      <SelectItem value="neurologia">Neurología</SelectItem>
                      <SelectItem value="gastroenterologia">Gastroenterología</SelectItem>
                      <SelectItem value="otorrinolaringologia">Otorrinolaringología</SelectItem>
                      <SelectItem value="oftalmologia">Oftalmología</SelectItem>
                      <SelectItem value="dermatologia">Dermatología</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descripción detallada del examen"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Estado y Prioridad */}
          <Card>
            <CardHeader>
              <CardTitle>Estado y Prioridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="scheduled_date">Fecha Programada</Label>
                  <Input
                    type="datetime-local"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="performed_date">Fecha Realizada</Label>
                  <Input
                    type="datetime-local"
                    name="performed_date"
                    value={formData.performed_date}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="report_date">Fecha de Reporte</Label>
                  <Input
                    type="datetime-local"
                    name="report_date"
                    value={formData.report_date}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="followup_date">Fecha de Seguimiento</Label>
                  <Input
                    type="datetime-local"
                    name="followup_date"
                    value={formData.followup_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="results">Resultados *</Label>
                <Textarea
                  name="results"
                  value={formData.results}
                  onChange={handleChange}
                  placeholder="Resultados del examen"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_abnormal"
                    checked={formData.is_abnormal}
                    onCheckedChange={(checked) => handleCheckboxChange('is_abnormal', checked as boolean)}
                  />
                  <Label htmlFor="is_abnormal">Resultados Anormales</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_followup"
                    checked={formData.requires_followup}
                    onCheckedChange={(checked) => handleCheckboxChange('requires_followup', checked as boolean)}
                  />
                  <Label htmlFor="requires_followup">Requiere Seguimiento</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost">Costo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="lab_reference">Referencia del Laboratorio</Label>
                  <Input
                    name="lab_reference"
                    value={formData.lab_reference}
                    onChange={handleChange}
                    placeholder="Ref. del laboratorio"
                  />
                </div>

                <div>
                  <Label htmlFor="technician">Técnico Responsable</Label>
                  <Input
                    name="technician"
                    value={formData.technician}
                    onChange={handleChange}
                    placeholder="Nombre del técnico"
                  />
                </div>

                <div>
                  <Label htmlFor="insurance_provider">Proveedor de Seguro</Label>
                  <Input
                    name="insurance_provider"
                    value={formData.insurance_provider}
                    onChange={handleChange}
                    placeholder="Nombre del seguro"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance_coverage"
                  checked={formData.insurance_coverage}
                  onCheckedChange={(checked) => handleCheckboxChange('insurance_coverage', checked as boolean)}
                />
                <Label htmlFor="insurance_coverage">Cobertura de Seguro</Label>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Notas adicionales sobre el examen"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Archivos Adjuntos */}
          <Card>
            <CardHeader>
              <CardTitle>Archivos Adjuntos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="attachments">Adjuntar Nuevos Archivos</Label>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                />
              </div>

              {attachments.length > 0 && (
                <div>
                  <Label>Nuevos Archivos Seleccionados:</Label>
                  <div className="mt-2 space-y-4">
                    {attachments.map((file, index) => (
                      <div key={index} className="bg-gray-50 rounded p-4">
                        {/* Layout móvil: vertical */}
                        <div className="block sm:hidden">
                          <div className="flex items-start space-x-3 mb-4">
                            <FileText className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="medical-exam-file-long-name-mobile" title={file.name}>
                                {file.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="w-full max-w-xs"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                        
                        {/* Layout desktop: horizontal */}
                        <div className="hidden sm:flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="medical-exam-file-long-name-desktop" title={file.name}>
                                {file.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {exam.attachments && exam.attachments.length > 0 && (
                <div>
                  <Label>Archivos Existentes:</Label>
                  <div className="mt-2 space-y-4">
                    {exam.attachments.map((attachment, index) => (
                      <div key={index} className="bg-blue-50 rounded p-4">
                        {/* Layout móvil: vertical */}
                        <div className="block sm:hidden">
                          <div className="flex items-start space-x-3 mb-4">
                            <FileText className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="medical-exam-file-long-name-mobile" title={attachment.originalname}>
                                {attachment.originalname}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(() => {
                                  const size = typeof attachment.size === 'string' ? parseInt(attachment.size) : attachment.size;
                                  return isNaN(size) ? '0.00' : (size / 1024 / 1024).toFixed(2);
                                })()} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteExistingAttachment(attachment.filename)}
                              disabled={deletingAttachment}
                              className="medical-exam-delete-button-mobile"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingAttachment ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Layout desktop: horizontal */}
                        <div className="hidden sm:flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="medical-exam-file-long-name-desktop" title={attachment.originalname}>
                                {attachment.originalname}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(() => {
                                  const size = typeof attachment.size === 'string' ? parseInt(attachment.size) : attachment.size;
                                  return isNaN(size) ? '0.00' : (size / 1024 / 1024).toFixed(2);
                                })()} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteExistingAttachment(attachment.filename)}
                              disabled={deletingAttachment}
                              className="medical-exam-delete-button"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingAttachment ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Link href={`/medical-exams/${exam.id}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}
        </form>
      </Card>
    </DashboardShell>
  );
} 