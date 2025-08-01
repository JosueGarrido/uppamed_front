'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/app/context/ThemeContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Durante SSR, renderizar sin el ThemeProvider para evitar errores
  if (!isMounted) {
    return <>{children}</>;
  }

  return <ThemeProvider>{children}</ThemeProvider>;
} 