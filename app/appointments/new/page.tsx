'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { appointmentService } from '@/services/appointment.service';
import { userService } from '@/services/user.service';
import { User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { ArrowLeft, Save, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NewAppointment() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [specialists, setSpecialists] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    specialist_id: '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (!user?.tenant_id) return;
        const allUsers = await userService.getUsersByTenant(user.tenant_id);
        const patientsOnly = allUsers.filter(u => u.role === 'Paciente');
        const specialistsOnly = allUsers.filter(u => u.role === 'Especialista');
        setPatients(patientsOnly);
        setSpecialists(specialistsOnly);
      } catch (error) {
        setError('Error al cargar usuarios');
      }
    };
    void loadUsers();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const appointmentData = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        specialist_id: parseInt(formData.specialist_id),
        date: `${formData.date}T${formData.time}:00`,
        tenant_id: user?.tenant_id || undefined
      };

      await appointmentService.createAppointment(appointmentData);
      router.push('/appointments');
    } catch (error) {
      setError('Error al crear la cita');
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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinTime = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    return currentTime;
  };

  const validateDateTime = (date: string, time: string) => {
    if (!date || !time) return true;
    
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    return selectedDateTime > now;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
    
    // Si la fecha seleccionada es hoy, validar que la hora no sea pasada
    if (newDate === getMinDate() && formData.time) {
      if (!validateDateTime(newDate, formData.time)) {
        setFormData(prev => ({
          ...prev,
          time: ''
        }));
      }
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setFormData(prev => ({
      ...prev,
      time: newTime
    }));
  };

  const isDateTimeValid = validateDateTime(formData.date, formData.time);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Nueva Cita Médica"
        text="Programar una nueva cita médica"
      >
        <Link href="/appointments">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </DashboardHeader>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="specialist_id">Especialista *</Label>
              <select
                id="specialist_id"
                name="specialist_id"
                value={formData.specialist_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Seleccionar especialista</option>
                {specialists.map(specialist => (
                  <option key={specialist.id} value={specialist.id}>
                    {specialist.username} - {specialist.specialty || specialist.especialidad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleDateChange}
                min={getMinDate()}
                required
              />
            </div>

            <div>
              <Label htmlFor="time">Hora *</Label>
              <Input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleTimeChange}
                min={formData.date === getMinDate() ? getMinTime() : undefined}
                required
              />
              {formData.date && formData.time && !isDateTimeValid && (
                <p className="text-red-500 text-sm mt-1">
                  La fecha y hora seleccionada no puede ser en el pasado
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Motivo de la Consulta *</Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Describa el motivo de la consulta"
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notas adicionales sobre la cita"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <Link href="/appointments">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !isDateTimeValid}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar Cita'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
} 