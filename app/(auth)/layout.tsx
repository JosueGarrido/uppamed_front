import type { Metadata } from 'next';
import { AuthProvider } from '../../context/AuthContext';

export const metadata: Metadata = {
  title: 'UppaMed - Sistema de gestión médica',
  description: 'Sistema CRM para la gestión de citas médicas',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 