"use client";

import { useEffect, useState } from "react";
import PageHeader from '@/components/PageHeader';
import Table, { Column } from '@/components/Table';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { useAuth } from '@/context/AuthContext';
import { MedicalRecord } from '@/types/medicalRecord';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await medicalRecordService.getMyMedicalRecords(user?.role);
        setRecords(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError('Error al obtener los registros médicos');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?.role) fetchRecords();
  }, [user]);

  const columns: Column<MedicalRecord>[] = [
    { key: 'date', header: 'Fecha' },
    { key: 'diagnosis', header: 'Diagnóstico' }
  ];

  if (loading) return <div>Cargando registros médicos...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <PageHeader 
        title="Registros Médicos"
        description="Historial de registros médicos de pacientes"
      />
      <Table 
        columns={columns}
        data={records}
        title="Historial Médico"
        onRowClick={(row) => console.log('Registro seleccionado:', row)}
      />
    </>
  );
}