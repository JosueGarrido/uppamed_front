'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, 
  Stethoscope, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2,
  Shield,
  Activity,
  Users
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Información médica */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        {/* Contenido del panel */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-white/20 rounded-full mr-4">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">UppaMed</h1>
            </div>
            <p className="text-xl text-white mb-2 font-semibold">Sistema de Gestión Médica</p>
            <p className="text-white/90 text-lg">Administra centros médicos de manera eficiente y profesional</p>
          </div>

          {/* Características */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-full mr-4">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Gestión de Centros</h3>
                <p className="text-white/90">Administra múltiples centros médicos desde una sola plataforma</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-full mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Usuarios Multirol</h3>
                <p className="text-white/90">Super Admin, Administradores, Especialistas y Pacientes</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-full mr-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Dashboard Intuitivo</h3>
                <p className="text-white/90">Monitorea métricas y gestiona citas de manera eficiente</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8">
            <p className="text-white/80 text-sm">
              © 2024 UppaMed. Sistema de gestión médica integral.
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario de login - HTML PURO SIN COMPONENTES */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col justify-center p-8 lg:p-12 xl:p-16">
        {/* Logo móvil */}
        <div className="lg:hidden text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-2 bg-blue-600 rounded-full mr-3">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">UppaMed</h1>
          </div>
          <p className="text-gray-600">Sistema de Gestión Médica</p>
        </div>

        {/* Formulario de login - HTML PURO SIN FONDOS */}
        <div className="w-full">
          {/* Header del formulario */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-16 h-16 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>
          
          {/* Formulario - HTML PURO SIN SOMBRAS NI FONDOS */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="tucorreo@dominio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error - HTML PURO SIN FONDOS */}
              {error && (
                <div className="p-3 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Botón de login - HTML PURO SIN SOMBRAS */}
              <button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md transition-all duration-200 border-0 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Iniciar Sesión
                  </div>
                )}
              </button>
            </form>

            {/* Información adicional */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                ¿Necesitas ayuda? Contacta al administrador del sistema
              </p>
            </div>
          </div>

          {/* Información de seguridad */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Shield className="h-3 w-3 mr-1" />
              Tus datos están protegidos con encriptación de nivel bancario
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 