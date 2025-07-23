"use client";

import { useEffect, useState } from "react";
import PageHeader from '@/components/PageHeader';
import Table from '@/components/Table';
import { medicalExamService } from '@/services/medicalExam.service';

export default function MedicalExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await medicalExamService.getMyMedicalExams();
        setExams(data);
      } catch (err) {
        setError('Error al obtener los exámenes médicos');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const columns = [
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
        onRowClick={(row) => console.log('Examen seleccionado:', row)}
      />
    </>
  );
}