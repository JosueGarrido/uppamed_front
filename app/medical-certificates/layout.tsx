'use client';

import { AuthProvider } from '@/context/AuthContext';
import SidebarWrapper from '@/components/SidebarWrapper';
import { Toaster } from 'sonner';

export default function MedicalCertificatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <SidebarWrapper>
          <main className="flex-1 overflow-x-hidden">
            <div className="p-6">
              {children}
            </div>
          </main>
        </SidebarWrapper>
        <Toaster richColors position="top-right" />
      </div>
    </AuthProvider>
  );
}
