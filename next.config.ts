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
  
  // Configuración de prerenderizado - STANDALONE
  output: 'standalone',
  
  // Configuración de tipos - DESHABILITADA
  typescript: {
    // Ignorar errores de TypeScript durante el build
    ignoreBuildErrors: true,
  },
  
  // Configuración de ESLint - DESHABILITADA
  eslint: {
    // Ignorar errores de ESLint durante el build
    ignoreDuringBuilds: true,
  },
  
  // Configuración de páginas estáticas
  trailingSlash: false,
  
  // Configuración de exportación
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // Deshabilitar la validación de páginas estáticas
  distDir: '.next',
  
  // Configuración para evitar prerenderizado problemático
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  // Configuración de timeout para generación estática (30 segundos)
  staticPageGenerationTimeout: 30000,
};

export default nextConfig;
