'use client';

import AuthWrapper from '@/components/AuthWrapper';
import ThemeWrapper from '@/components/ThemeWrapper';
import SidebarWrapper from '@/components/SidebarWrapper';
import { Toaster } from 'sonner';
import ImpersonationBanner from '@/components/ImpersonationBanner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
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
    </AuthWrapper>
  );
} 