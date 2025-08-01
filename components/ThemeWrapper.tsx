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

  // Renderizar un placeholder durante SSR
  if (!isMounted) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return <ThemeProvider>{children}</ThemeProvider>;
} 