'use client';

import PageHeader from '@/components/PageHeader';
import Table, { Column } from '@/components/Table';
import Link from 'next/link';

export default function TenantsPage() {
  const tenants = [
    { id: 1, name: 'Hospital Central' },
    { id: 2, name: 'Clínica Norte' },
  ];

  const columns: Column<{ id: number; name: string }>[] = [
    { key: 'name', header: 'Nombre' }
  ];

  return (
    <>
      <PageHeader 
        title="Tenants"
        description="Gestión de organizaciones médicas"
      />
      <Table 
        columns={columns}
        data={tenants}
        title="Lista de Organizaciones"
        onRowClick={(row) => console.log('Organización seleccionada:', row)}
        actions={(tenant) => (
          <Link href={`/tenants/${tenant.id}/users`} className="text-blue-600 hover:underline">Ver usuarios</Link>
        )}
      />
    </>
  );
}