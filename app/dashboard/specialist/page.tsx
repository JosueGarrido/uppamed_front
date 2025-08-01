'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { appointmentService } from '@/services/appointment.service';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { medicalExamService } from '@/services/medicalExam.service';
import { Appointment } from '@/types/appointment';
import { MedicalRecord } from '@/types/medicalRecord';
import { MedicalExam } from '@/types/medicalExam';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { AppointmentList } from '@/app/components/appointments/appointment-list';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ClipboardList, FileText, Plus, Users, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SpecialistDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medicalExams, setMedicalExams] = useState<MedicalExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) {
          setError('No hay usuario autenticado');
          setLoading(false);
          return;
        }

        const [appointments, records, exams] = await Promise.all([
          appointmentService.getSpecialistAppointments(),
          medicalRecordService.getMyMedicalRecords('Especialista'),
          medicalExamService.getMyMedicalExams()
        ]);
        
        const today = new Date();
        
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
        setMedicalRecords(records);
        setMedicalExams(exams);
        setLoading(false);
      } catch (error) {
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pendiente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p>Cargando datos...</p>
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
        text="Gestiona tus citas, registros médicos y exámenes"
      >
        <div className="flex space-x-2">
          <Link href="/appointments/new">
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Nueva Cita
            </Button>
          </Link>
          <Link href="/medical-records/new">
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Nuevo Registro
            </Button>
          </Link>
          <Link href="/medical-exams/new">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Nuevo Examen
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="font-semibold">Citas Hoy</h3>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="font-semibold">Próximas Citas</h3>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <ClipboardList className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <h3 className="font-semibold">Registros</h3>
              <div className="text-2xl font-bold">{medicalRecords.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <h3 className="font-semibold">Exámenes</h3>
              <div className="text-2xl font-bold">{medicalExams.length}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Citas de Hoy</h3>
            <Link href="/appointments">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
          {todayAppointments.length > 0 ? (
            <div className="space-y-2">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">
                      {appointment.patient?.username || `Paciente ${appointment.patient_id}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1 text-xs">{appointment.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay citas programadas para hoy</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Próximas Citas</h3>
            <Link href="/appointments">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-2">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">
                      {appointment.patient?.username || `Paciente ${appointment.patient_id}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleDateString()} - {new Date(appointment.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1 text-xs">{appointment.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay citas próximas</p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Últimos Registros Médicos</h3>
            <Link href="/medical-records">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
          {medicalRecords.length > 0 ? (
            <div className="space-y-2">
              {medicalRecords.slice(0, 3).map((record) => (
                <div key={record.id} className="p-2 border rounded">
                  <p className="font-medium">{record.diagnosis}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay registros médicos</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Últimos Exámenes</h3>
            <Link href="/medical-exams">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
          {medicalExams.length > 0 ? (
            <div className="space-y-2">
              {medicalExams.slice(0, 3).map((exam) => (
                <div key={exam.id} className="p-2 border rounded">
                  <p className="font-medium">{exam.type}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(exam.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay exámenes registrados</p>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
} 