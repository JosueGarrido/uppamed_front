'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { medicalExamService } from '@/services/medicalExam.service';
import { userService } from '@/services/user.service';
import { User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';

export default function NewMedicalExam() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    type: '',
    results: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  useState(() => {
    const loadPatients = async () => {
      try {
        if (!user?.tenant_id) return;
        const allUsers = await userService.getUsersByTenant(user.tenant_id);
        const patientsOnly = allUsers.filter(u => u.role === 'Paciente');
        setPatients(patientsOnly);
      } catch (error) {
        setError('Error al cargar pacientes');
      }
    };
    void loadPatients();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const examData = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        specialist_id: user?.id || 0,
        attachments: attachments.map(file => file.name) // Por ahora solo nombres
      };

      await medicalExamService.createMedicalExam(examData);
      router.push('/medical-exams');
    } catch (error) {
      setError('Error al crear el examen médico');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  return (
    <DashboardShell>
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
          <div>
            <Label htmlFor="patient_id">Paciente *</Label>
            <select
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Seleccionar paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.username} - {patient.identification_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="type">Tipo de Examen *</Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Análisis de Sangre">Análisis de Sangre</option>
              <option value="Rayos X">Rayos X</option>
              <option value="Resonancia Magnética">Resonancia Magnética</option>
              <option value="Tomografía">Tomografía</option>
              <option value="Electrocardiograma">Electrocardiograma</option>
              <option value="Análisis de Orina">Análisis de Orina</option>
              <option value="Ecografía">Ecografía</option>
              <option value="Endoscopia">Endoscopia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <Label htmlFor="date">Fecha del Examen *</Label>
            <Input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="results">Resultados *</Label>
            <Textarea
              id="results"
              name="results"
              value={formData.results}
              onChange={handleChange}
              placeholder="Ingrese los resultados del examen"
              required
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="attachments">Archivos Adjuntos</Label>
            <Input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileChange}
              className="w-full"
            />
            {attachments.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Archivos seleccionados:</p>
                <ul className="text-sm">
                  {attachments.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <Link href="/medical-exams">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar Examen'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
} 