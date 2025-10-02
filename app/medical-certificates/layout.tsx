'use client';

import { Toaster } from 'sonner';

export default function MedicalCertificatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}