'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { medicalExamService } from '@/services/medicalExam.service';
import { userService } from '@/services/user.service';
import { User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { ArrowLeft, Save, Upload, Microscope, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewMedicalExam() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
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

  useEffect(() => {
    const loadPatients = async () => {
      try {
        if (!user?.tenant_id) return;
        const allUsers = await userService.getUsersByTenant(user.tenant_id);
        const patientsOnly = allUsers.filter(u => u.role === 'Paciente');
        setPatients(patientsOnly);
      } catch (error) {
        setError('Error al cargar pacientes');
        toast.error('Error al cargar la lista de pacientes');
      }
    };
    void loadPatients();
  }, [user?.tenant_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const examData = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        specialist_id: user?.id || 0,
        category: formData.category as 'laboratorio' | 'imagenologia' | 'cardiologia' | 'neurologia' | 'gastroenterologia' | 'otorrinolaringologia' | 'oftalmologia' | 'dermatologia' | 'otros',
        status: formData.status as 'pendiente' | 'en_proceso' | 'completado' | 'cancelado',
        priority: formData.priority as 'baja' | 'normal' | 'alta' | 'urgente',
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        scheduled_date: formData.scheduled_date || undefined,
        performed_date: formData.performed_date || undefined,
        report_date: formData.report_date || undefined,
        followup_date: formData.followup_date || undefined
      };

      await medicalExamService.createMedicalExam(examData, attachments);
      toast.success('Examen médico creado exitosamente');
      router.push('/medical-exams');
    } catch (error) {
      console.error('Error creating exam:', error);
      setError('Error al crear el examen médico');
      toast.error('Error al crear el examen médico');
    } finally {
      setLoading(false);
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

  return (
    <DashboardShell className="medical-exams-responsive">
      <DashboardHeader
        heading="Nuevo Examen Médico"
        text="Crear un nuevo examen médico para un paciente"
      >
        <Link href="/medical-exams">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
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
            <Label htmlFor="patient_id">Paciente *</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => handleSelectChange('patient_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.username} - {patient.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                <Label htmlFor="attachments">Adjuntar Archivos</Label>
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                />
              </div>

              {attachments.length > 0 && (
                <div>
                  <Label>Archivos Seleccionados:</Label>
                  <div className="mt-2 space-y-3">
                    {attachments.map((file, index) => (
                      <div key={index} className="medical-exam-file-container">
                        {/* Layout móvil: vertical */}
                        <div className="medical-exam-file-mobile">
                          <div className="medical-exam-file-info-mobile mb-3">
                            <FileText className="h-5 w-5 text-gray-500 medical-exam-file-icon medical-exam-file-icon-mobile" />
                            <div className="medical-exam-file-details">
                              <p className="text-sm medical-exam-file-name-mobile" title={file.name}>
                                {file.name}
                              </p>
                            </div>
                          </div>
                          <div className="medical-exam-file-actions-mobile">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="medical-exam-file-button-mobile"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
          </div>

                        {/* Layout desktop: horizontal */}
                        <div className="medical-exam-file-desktop items-center justify-between">
                          <div className="medical-exam-file-info-desktop">
                            <FileText className="h-5 w-5 text-gray-500 medical-exam-file-icon" />
                            <div className="medical-exam-file-details">
                              <p className="text-sm medical-exam-file-name-desktop" title={file.name}>
                                {file.name}
                              </p>
                            </div>
                          </div>
                          <div className="medical-exam-file-actions-desktop">
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
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Link href="/medical-exams">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : (
                <>
              <Save className="mr-2 h-4 w-4" />
                  Crear Examen
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