export interface TestCredentials {
  email: string;
  password: string;
  role: string;
  description: string;
}

export const testCredentials: Record<string, TestCredentials> = {
  superAdmin: {
    email: 'superadmin@sistema.com',
    password: 'password',
    role: 'Super Admin',
    description: 'Super Administrador del sistema'
  },
  admin: {
    email: 'admin@hospital.com',
    password: 'password',
    role: 'Administrador',
    description: 'Administrador del hospital'
  },
  specialist: {
    email: 'doctor@hospital.com',
    password: 'password',
    role: 'Especialista',
    description: 'Médico especialista'
  },
  patient: {
    email: 'paciente@email.com',
    password: 'password',
    role: 'Paciente',
    description: 'Paciente del hospital'
  }
};

export const getCredentialsByRole = (role: string): TestCredentials | null => {
  const entry = Object.entries(testCredentials).find(([_, creds]) => creds.role === role);
  return entry ? entry[1] : null;
}; 