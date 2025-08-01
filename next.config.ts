import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuración básica
  output: 'standalone',
  
  // Configuración de tipos - DESHABILITADA
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuración de ESLint - DESHABILITADA
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuración de imágenes
  images: {
    unoptimized: true,
  },
  
  // Configuración de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
