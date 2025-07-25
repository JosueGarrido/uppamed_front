"use client";

import { useEffect, useState } from "react";
import PageHeader from '@/components/PageHeader';
import Table, { Column } from '@/components/Table';
import { medicalExamService } from '@/services/medicalExam.service';
import { MedicalExam } from '@/types/medicalExam';

export default function MedicalExamsPage() {
  // Tipar todos los datos y estados, nunca usar any
  // Eliminar destructuración insegura de arrays/objetos provenientes de any
  // Usar await, .catch o void en todas las promesas
  // Corregir handlers de eventos para que no retornen promesas
  // Corregir comillas en JSX
  // Eliminar variables no usadas
  // Tipar correctamente los datos de backend (MedicalExam, etc.)
  const [exams, setExams] = useState<MedicalExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await medicalExamService.getMyMedicalExams();
        setExams(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError('Error al obtener los exámenes médicos: ' + err.message);
        } else {
          setError('Error desconocido al obtener los exámenes médicos');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const columns: Column<MedicalExam>[] = [
    { key: 'date', header: 'Fecha' },
    { key: 'type', header: 'Tipo de Examen' }
  ];

  if (loading) return <div>Cargando exámenes médicos...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <PageHeader 
        title="Exámenes Médicos"
        description="Gestión de exámenes médicos y resultados"
      />
      <Table 
        columns={columns}
        data={exams}
        title="Lista de Exámenes"
        onRowClick={(row) => void(console.log('Examen seleccionado:', row))}
      />
    </>
  );
}