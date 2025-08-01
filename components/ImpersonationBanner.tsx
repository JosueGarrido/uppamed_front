"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export default function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    const checkImpersonation = () => {
      if (typeof window !== 'undefined') {
        setIsImpersonating(localStorage.getItem('isImpersonating') === 'true');
      }
    };
    
    checkImpersonation();
    const interval = setInterval(checkImpersonation, 500);
    return () => clearInterval(interval);
  }, []);

  // Durante SSR o si no está suplantando, no mostrar el banner
  if (!isMounted || !isImpersonating) return null;

  const handleRestore = async () => {
    try {
      console.log('🔄 Iniciando restauración de sesión...');
      await authService.restoreImpersonation();
      
      // Verificar que el usuario sea Super Admin
      const user = authService.getCurrentUser();
      if (user && user.role === 'Super Admin') {
        console.log('✅ Sesión restaurada correctamente, redirigiendo...');
        toast.success('Sesión de Super Admin restaurada');
        router.push('/dashboard/super-admin');
      } else {
        console.error('❌ Error: Usuario no es Super Admin después de la restauración');
        toast.error('No se pudo restaurar la sesión de Super Admin');
      }
    } catch (err) {
      console.error('❌ Error restaurando sesión:', err);
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
          onClick={() => void handleRestore()}
        >
          Volver a ser Super Admin
        </Button>
      </div>
    </div>
  );
} 