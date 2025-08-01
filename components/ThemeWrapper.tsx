'use client';

import { ThemeProvider } from '@/app/context/ThemeContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  return <ThemeProvider>{children}</ThemeProvider>;
} 