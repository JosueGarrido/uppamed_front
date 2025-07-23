export type UserRole = 'Super Admin' | 'Administrador' | 'Especialista' | 'Paciente';

export interface User {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
  tenant_id: number | null;
  area?: string;
  specialty?: string;
  identification_number?: string;
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