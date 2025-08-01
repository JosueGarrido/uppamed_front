'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="hidden lg:flex lg:w-1/2 bg-medical-gradient relative overflow-hidden">
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
              <Heart className="h-12 w-12 mr-4 text-white" />
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

      {/* Panel derecho - Formulario de login */}
      <div className="flex-1 flex items-center justify-center p-8 bg-medical-gradient-soft">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 mr-3 text-medical-600" />
              <h1 className="text-3xl font-bold text-medical-900">UppaMed</h1>
            </div>
            <p className="text-medical-700">Sistema de Gestión Médica</p>
          </div>

          {/* Card de login */}
          <Card className="shadow-soft-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-3 bg-medical-gradient rounded-full w-16 h-16 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-medical-900">
                Bienvenido de vuelta
              </CardTitle>
              <CardDescription className="text-medical-600">
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-medical-700">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tucorreo@dominio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-medical-200 focus:border-medical-500 focus:ring-medical-500"
                      required
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-medical-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 border-medical-200 focus:border-medical-500 focus:ring-medical-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medical-400 hover:text-medical-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <Alert variant="destructive" className="border-danger-200 bg-danger-50">
                    <AlertDescription className="text-danger-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Botón de login */}
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold bg-medical-500 hover:bg-medical-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0"
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
                </Button>
              </form>

              {/* Información adicional */}
              <div className="text-center pt-4 border-t border-medical-100">
                <p className="text-sm text-medical-600">
                  ¿Necesitas ayuda? Contacta al administrador del sistema
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información de seguridad */}
          <div className="mt-6 text-center">
            <p className="text-xs text-medical-500">
              🔒 Tus datos están protegidos con encriptación de nivel bancario
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 