'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { appointmentService } from '@/services/appointment.service';
import { Appointment } from '@/types/appointment';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { AppointmentList } from '@/app/components/appointments/appointment-list';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function SpecialistDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        if (!user?.id) {
          setError('No hay usuario autenticado');
          setLoading(false);
          return;
        }

        const today = new Date();
        
        const appointments = await appointmentService.getSpecialistAppointments();
        
        const today_appointments = appointments.filter(app => {
          const appDate = new Date(app.date);
          return appDate.toDateString() === today.toDateString();
        });

        const upcoming = appointments.filter(app => {
          const appDate = new Date(app.date);
          return appDate > today;
        }).slice(0, 5);

        setTodayAppointments(today_appointments);
        setUpcomingAppointments(upcoming);
        setLoading(false);
      } catch (error) {
        setError('Error al cargar las citas');
        setLoading(false);
      }
    };

    if (user?.id) {
      loadAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p>Cargando citas...</p>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
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
        heading="Panel del Especialista"
        text="Gestiona tus citas y registros médicos"
      >
        <div className="flex space-x-2">
          <Link href="/appointments/new">
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Nueva Cita
            </Button>
          </Link>
          <Link href="/medical-records">
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Historias Clínicas
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="font-semibold">Citas Hoy</h3>
          <div className="text-3xl font-bold">{todayAppointments.length}</div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Próximas Citas</h3>
          <div className="text-3xl font-bold">{upcomingAppointments.length}</div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Citas de Hoy</h3>
          <AppointmentList appointments={todayAppointments} />
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Próximas Citas</h3>
          <AppointmentList appointments={upcomingAppointments} />
        </Card>
      </div>
    </DashboardShell>
  );
} 