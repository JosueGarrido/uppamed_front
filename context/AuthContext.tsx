'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { User, AuthState, LoginCredentials } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isImpersonating: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mapeo de roles a rutas de dashboard
const DASHBOARD_ROUTES = {
  'Super Admin': '/dashboard/super-admin',
  'Administrador': '/dashboard/admin',
  'Especialista': '/dashboard/specialist',
  'Paciente': '/dashboard/paciente'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const isImpersonating = typeof window !== 'undefined' && authService.isImpersonating();

  // Función para verificar el estado de autenticación
  const checkAuth = async () => {
    console.log('🔍 Verificando autenticación...');
    const token = authService.getToken();
    const user = authService.getCurrentUser();

    console.log('🔍 Estado de autenticación:', {
      hasToken: !!token,
      hasUser: !!user,
      userRole: user?.role
    });

    if (!token || !user) {
      console.log('❌ No hay sesión activa');
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      return;
    }

    try {
      // Verificar si el token es válido haciendo una petición al backend
      await authService.fetchUserData();
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Redirigir al dashboard correspondiente si estamos en la página principal
      if (window.location.pathname === '/') {
        const dashboardRoute = DASHBOARD_ROUTES[user.role as keyof typeof DASHBOARD_ROUTES] || '/dashboard';
        router.push(dashboardRoute);
      }
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      // Si hay error, limpiar la sesión
      authService.logout();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Sesión expirada'
      });
      router.push('/login');
    }
  };

  // Función para refrescar la autenticación (usada después de restaurar sesión)
  const refreshAuth = async () => {
    console.log('🔄 Refrescando estado de autenticación...');
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();

    // Listener para detectar cambios en localStorage (como restauración de sesión)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token' || e.key === 'isImpersonating') {
        console.log('🔄 Cambio detectado en localStorage:', e.key);
        // Esperar un poco para que los cambios se propaguen
        setTimeout(() => {
          checkAuth();
        }, 100);
      }
    };

    // También escuchar cambios locales (misma pestaña)
    const handleLocalChange = () => {
      console.log('🔄 Cambio local detectado, refrescando autenticación...');
      setTimeout(() => {
        checkAuth();
      }, 100);
    };

    // Agregar listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleLocalChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleLocalChange);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log('🚀 Iniciando login...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login(credentials);
      console.log('✅ Login exitoso:', { 
        userId: response.user.id,
        role: response.user.role
      });
      
      // Actualizar estado inmediatamente con los datos del login
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Redirigir al dashboard correspondiente según el rol
      const dashboardRoute = DASHBOARD_ROUTES[response.user.role as keyof typeof DASHBOARD_ROUTES] || '/dashboard';
      console.log('🔄 Redirigiendo a:', dashboardRoute);
      
      // Usar setTimeout para asegurar que el estado se actualice antes de la redirección
      setTimeout(() => {
        router.push(dashboardRoute);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error en la autenticación'
      }));
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    authService.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isImpersonating, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
} 