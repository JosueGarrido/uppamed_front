// Credenciales de prueba para desarrollo
export const testCredentials = {
  superAdmin: {
    email: 'admin@test.com',
    password: 'password123'
  },
  admin: {
    email: 'admin@hospital.com',
    password: 'password123'
  },
  specialist: {
    email: 'doctor@hospital.com',
    password: 'password123'
  },
  patient: {
    email: 'paciente@email.com',
    password: 'password123'
  }
};

// Función helper para obtener credenciales por rol
export const getCredentialsByRole = (role: string) => {
  switch (role.toLowerCase()) {
    case 'super admin':
      return testCredentials.superAdmin;
    case 'administrador':
      return testCredentials.admin;
    case 'especialista':
      return testCredentials.specialist;
    case 'paciente':
      return testCredentials.patient;
    default:
      return testCredentials.superAdmin;
  }
}; 