import type { Metadata } from 'next';
import AuthWrapper from '@/components/AuthWrapper';
import ThemeWrapper from '@/components/ThemeWrapper';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'UppaMed - Autenticación',
  description: 'Acceso al sistema de gestión médica',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <ThemeWrapper>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeWrapper>
    </AuthWrapper>
  );
} 