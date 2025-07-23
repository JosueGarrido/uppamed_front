'use client';

import PageHeader from '@/components/PageHeader';
import Table, { Column } from '@/components/Table';

export default function AppointmentsPage() {
  const appointments = [
    { id: 1, date: '2025-05-15', specialist: 'Dr. Pérez', patient: 'Ana Herrera' },
    { id: 2, date: '2025-05-16', specialist: 'Dra. Ruiz', patient: 'Juan López' },
  ];

  const columns: Column<{ id: number; date: string; specialist: string; patient: string; }>[] = [
    { key: 'date', header: 'Fecha' },
    { key: 'specialist', header: 'Especialista' },
    { key: 'patient', header: 'Paciente' }
  ];

  return (
    <>
      <PageHeader 
        title="Citas Médicas"
        description="Gestiona las citas médicas del sistema"
      />
      <Table 
        columns={columns}
        data={appointments}
        title="Lista de Citas"
        onRowClick={(row) => console.log('Cita seleccionada:', row)}
      />
    </>
  );
}