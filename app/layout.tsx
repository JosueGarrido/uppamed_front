import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
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
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}