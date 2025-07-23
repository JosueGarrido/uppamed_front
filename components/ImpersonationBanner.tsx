"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export default function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    const checkImpersonation = () => {
      if (typeof window !== 'undefined') {
        setIsImpersonating(localStorage.getItem('isImpersonating') === 'true');
      }
    };
    checkImpersonation();
    const interval = setInterval(checkImpersonation, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isImpersonating) return null;

  const handleRestore = async () => {
    try {
      await authService.restoreImpersonation();
      localStorage.removeItem('isImpersonating');
      // Espera a que el usuario en el backend sea Super Admin antes de redirigir
      const user = await authService.fetchUserData();
      if (user.role === 'Super Admin') {
        window.location.href = '/dashboard/super-admin';
      } else {
        toast.error('No se pudo restaurar la sesión de Super Admin. Intenta cerrar sesión y volver a entrar.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al restaurar sesión: ${errorMessage}`);
    }
  };

  return (
    <div className="bg-yellow-400 border-b-4 border-yellow-600 text-black p-3 text-center font-semibold shadow-lg">
      <div className="flex items-center justify-center">
        <span className="mr-3">⚠️ Estás en modo de suplantación.</span>
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
          onClick={handleRestore}
        >
          Volver a ser Super Admin
        </Button>
      </div>
    </div>
  );
} 