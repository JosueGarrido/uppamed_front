'use client';

import PageHeader from '@/components/PageHeader';
import Table from '@/components/Table';

export default function UsersPage() {
  const users = [
    { id: 1, username: 'superadmin', role: 'Administrador' },
    { id: 2, username: 'medruiz', role: 'Especialista' },
    { id: 3, username: 'juanp', role: 'Paciente' },
  ];

  const columns = [
    { key: 'username', header: 'Usuario' },
    { key: 'role', header: 'Rol' }
  ];

  return (
    <>
      <PageHeader 
        title="Usuarios"
        description="Gestión de usuarios del sistema"
      />
      <Table 
        columns={columns}
        data={users}
        title="Lista de Usuarios"
        onRowClick={(row) => console.log('Usuario seleccionado:', row)}
      />
    </>
  );
}