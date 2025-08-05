'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

export default function AuthWrapper({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: AuthWrapperProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si aún está cargando, esperar
    if (isLoading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !user) {
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Si se requiere un rol específico, verificar
    if (requiredRole) {
      const userRole = user.role;
      const hasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(userRole)
        : userRole === requiredRole;

      if (!hasRequiredRole) {
        // Redirigir al dashboard correspondiente al rol del usuario
        const dashboardRoutes = {
          'Super Admin': '/dashboard/super-admin',
          'Administrador': '/dashboard/admin',
          'Especialista': '/dashboard/specialist',
          'Paciente': '/dashboard/paciente'
        };
        
        const userDashboard = dashboardRoutes[userRole as keyof typeof dashboardRoutes] || '/dashboard';
        router.push(userDashboard);
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, redirectTo, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar contenido
  if (!isAuthenticated || !user) {
    return null;
  }

  // Si se requiere un rol específico y no lo tiene, no mostrar contenido
  if (requiredRole) {
    const userRole = user.role;
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;

    if (!hasRequiredRole) {
      return null;
    }
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return <>{children}</>;
} 