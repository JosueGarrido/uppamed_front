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
import { Button } from '@/components/ui/button';
import { CalendarIcon, ClipboardList, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PacienteDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

        const [appointmentsData, recordsData, examsData] = await Promise.all([
          appointmentService.getPatientAppointments(),
          medicalRecordService.getMyMedicalRecords(),
          medicalExamService.getMyMedicalExams()
        ]);

        setAppointments(appointmentsData);
        setMedicalRecords(recordsData);
        setMedicalExams(examsData);
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

  const upcomingAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    return appDate > new Date() && app.status !== 'cancelada';
  }).slice(0, 5);

  const todayAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    return appDate.toDateString() === new Date().toDateString();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelada':
        return <XCircle className="h-4 w-4 text-red-500" />;
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
        heading="Panel del Paciente"
        text="Gestiona tus citas y revisa tu historial médico"
      >
        <div className="flex space-x-2">
          <Link href="/appointments">
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Mis Citas
            </Button>
          </Link>
          <Link href="/medical-records">
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Historial Médico
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
        <Card className="p-4">
          <h3 className="font-semibold">Historial Médico</h3>
          <div className="text-3xl font-bold">{medicalRecords.length}</div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Exámenes</h3>
          <div className="text-3xl font-bold">{medicalExams.length}</div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Próximas Citas</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-2">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">
                      {appointment.specialist?.username || `Especialista ${appointment.specialist_id}`}
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
            <p className="text-gray-500">No tienes citas próximas</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Últimos Registros Médicos</h3>
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
            <p className="text-gray-500">No hay registros médicos</p>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Últimos Exámenes</h3>
        {medicalExams.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {medicalExams.slice(0, 4).map((exam) => (
              <div key={exam.id} className="p-2 border rounded">
                <p className="font-medium">{exam.type}</p>
                <p className="text-sm text-gray-600">
                  {new Date(exam.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay exámenes registrados</p>
        )}
      </Card>
    </DashboardShell>
  );
} 