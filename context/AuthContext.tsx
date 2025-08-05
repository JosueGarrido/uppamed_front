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
  updateUser: (user: User) => void;
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
  const [isMounted, setIsMounted] = useState(false);

  const isImpersonating = isMounted && typeof window !== 'undefined' && authService.isImpersonating();

  // Función para verificar el estado de autenticación
  const checkAuth = async () => {
    if (!isMounted) return;
    
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

      // Solo redirigir si estamos en la página principal y no en login
      if (typeof window !== 'undefined' && 
          window.location.pathname === '/' && 
          !window.location.pathname.includes('/login')) {
        const dashboardRoute = DASHBOARD_ROUTES[user.role as keyof typeof DASHBOARD_ROUTES] || '/dashboard';
        router.push(dashboardRoute);
      }
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      // Si hay error, limpiar la sesión pero NO redirigir automáticamente
      authService.logout();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Sesión expirada'
      });
      // Solo redirigir si no estamos ya en login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        router.push('/login');
      }
    }
  };

  // Función para refrescar la autenticación (usada después de restaurar sesión)
  const refreshAuth = async () => {
    console.log('🔄 Refrescando estado de autenticación...');
    await checkAuth();
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
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

    // Agregar listeners solo si estamos en el cliente
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('focus', handleLocalChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('focus', handleLocalChange);
      };
    }
  }, [isMounted]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.login(credentials);
      
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Obtener la URL de redirección de los parámetros de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      
      // Determinar la ruta de destino
      let targetRoute = '/';
      if (redirectTo && redirectTo !== '/login') {
        targetRoute = redirectTo;
      } else {
        // Redirigir al dashboard correspondiente al rol
        const dashboardRoute = DASHBOARD_ROUTES[response.user.role as keyof typeof DASHBOARD_ROUTES] || '/dashboard';
        targetRoute = dashboardRoute;
      }

      console.log('✅ Login exitoso, redirigiendo a:', targetRoute);
      router.push(targetRoute);
    } catch (error) {
      console.error('❌ Error en login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error en la autenticación';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      // NO redirigir automáticamente cuando hay error de credenciales
      // El usuario debe ver el mensaje de error en la página de login
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

  const updateUser = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isImpersonating, refreshAuth, updateUser }}>
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