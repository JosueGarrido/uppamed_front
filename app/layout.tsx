import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import SidebarWrapper from '@/components/SidebarWrapper';
import { Toaster } from 'sonner';
import ImpersonationBanner from '@/components/ImpersonationBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UppaMed - Sistema de gestión médica',
  description: 'Sistema CRM para la gestión de citas médicas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full bg-white`}>
        <AuthProvider>
          <ThemeWrapper>
            <div className="min-h-screen bg-medical-50">
              <ImpersonationBanner />
              <div className="flex min-h-screen">
                <SidebarWrapper />
                <main className="flex-1 p-6">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
            <Toaster richColors position="top-right" />
          </ThemeWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}