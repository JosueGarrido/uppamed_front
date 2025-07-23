'use client';

import { Appointment } from '@/types/appointment';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface AppointmentListProps {
  appointments: Appointment[];
}

export function AppointmentList({ appointments }: AppointmentListProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-500';
      case 'confirmada':
        return 'bg-blue-500';
      case 'completada':
        return 'bg-green-500';
      case 'cancelada':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!appointments.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay citas programadas
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Link
          key={appointment.id}
          href={`/appointments/${appointment.id}`}
          className="block"
        >
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{appointment.patient.username}</h4>
                <p className="text-sm text-gray-500">
                  {formatDate(new Date(appointment.date))}
                </p>
              </div>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {appointment.reason}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
} 