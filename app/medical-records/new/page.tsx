'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { userService } from '@/services/user.service';
import { User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewMedicalRecord() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    treatment: '',
    observations: ''
  });

  useEffect(() => {
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
  }, [user?.tenant_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await medicalRecordService.createMedicalRecord({
        ...formData,
        patient_id: parseInt(formData.patient_id),
        specialist_id: user?.id || 0
      });
      router.push('/medical-records');
    } catch (error) {
      setError('Error al crear el registro médico');
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

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Nuevo Registro Médico"
        text="Crear un nuevo registro médico para un paciente"
      >
        <Link href="/medical-records">
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
            <Label htmlFor="diagnosis">Diagnóstico *</Label>
            <Textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Ingrese el diagnóstico del paciente"
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="treatment">Tratamiento *</Label>
            <Textarea
              id="treatment"
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Ingrese el tratamiento prescrito"
              required
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              placeholder="Observaciones adicionales"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <Link href="/medical-records">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar Registro'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
} 