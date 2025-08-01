import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuración para manejar mejor el prerenderizado
  experimental: {
    // Deshabilitar la optimización de imágenes para evitar problemas en build
    optimizePackageImports: ['lucide-react'],
  },
  
  // Configuración de imágenes
  images: {
    unoptimized: true,
  },
  
  // Configuración de compilación
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuración de webpack
  webpack: (config, { isServer }) => {
    // Configuración específica para el servidor
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'react': 'react',
        'react-dom': 'react-dom',
      });
    }
    
    return config;
  },
  
  // Configuración de prerenderizado
  output: 'standalone',
  
  // Configuración de tipos
  typescript: {
    // Ignorar errores de TypeScript durante el build
    ignoreBuildErrors: false,
  },
  
  // Configuración de ESLint
  eslint: {
    // Ignorar errores de ESLint durante el build
    ignoreDuringBuilds: true,
  },
  
  // Configuración de páginas estáticas
  trailingSlash: false,
  
  // Configuración de exportación
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};

export default nextConfig;
