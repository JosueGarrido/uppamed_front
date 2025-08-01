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
};

export default nextConfig;
