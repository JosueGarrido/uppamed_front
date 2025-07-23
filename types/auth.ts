export type UserRole = 'Super Admin' | 'Administrador' | 'Especialista' | 'Paciente';

export interface User {
  id: number;
  username: string;
  password?: string;
  role: UserRole;
  email: string;
  identification_number?: string;
  area?: string;
  specialty?: string;
  tenant_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  especialidad?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 