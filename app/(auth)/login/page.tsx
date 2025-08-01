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
  Shield,
  Activity,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Zap,
  Plus
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
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          height: 100%;
          width: 100%;
          background: transparent !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #__next {
          height: 100%;
          width: 100%;
          background: transparent !important;
        }
        
        body {
          background: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        html {
          background: transparent !important;
        }
        
        /* Sobrescribir cualquier layout principal */
        main {
          padding: 0 !important;
          max-width: none !important;
          margin: 0 !important;
        }
        
        main > div {
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        width: '100%',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        {/* Panel izquierdo - Fondo azul con formas orgánicas */}
        <div style={{
          display: 'none',
          width: '40%',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          position: 'relative',
          overflow: 'hidden'
        }} className="hidden lg:flex lg:w-2/5">
          {/* Formas orgánicas de fondo */}
          <div style={{
            position: 'absolute',
            top: '10%',
            right: '-20%',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '-15%',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            animation: 'float 12s ease-in-out infinite 2s'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '60%',
            right: '10%',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '50%',
            animation: 'float 10s ease-in-out infinite 1s'
          }}></div>
          
          {/* Contenido del panel izquierdo */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 40px',
            color: 'white',
            textAlign: 'center'
          }}>
            {/* Logo y branding */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <Heart style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'white',
                letterSpacing: '-0.02em'
              }}>UppaMed</h1>
            </div>
            
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '12px'
            }}>Sistema de Gestión Médica</h2>
            
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.6',
              maxWidth: '300px'
            }}>La plataforma más avanzada para administrar citas médicas y gestionar centros de salud de manera eficiente y profesional.</p>
            
            {/* Características destacadas */}
            <div style={{
              marginTop: '40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              width: '100%',
              maxWidth: '280px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Calendar style={{ width: '20px', height: '20px', color: 'white', marginRight: '12px' }} />
                <span style={{ fontSize: '14px', color: 'white' }}>Gestión inteligente de citas</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Users style={{ width: '20px', height: '20px', color: 'white', marginRight: '12px' }} />
                <span style={{ fontSize: '14px', color: 'white' }}>Pacientes y especialistas</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Zap style={{ width: '20px', height: '20px', color: 'white', marginRight: '12px' }} />
                <span style={{ fontSize: '14px', color: 'white' }}>Optimización automática</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de login */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          background: '#f8fafc'
        }}>
          {/* Logo móvil */}
          <div style={{
            display: 'none',
            textAlign: 'center',
            marginBottom: '40px'
          }} className="lg:hidden">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <Heart style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b'
              }}>UppaMed</h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Sistema de Gestión Médica</p>
          </div>

          {/* Formulario de login */}
          <div style={{ 
            width: '100%',
            maxWidth: '400px'
          }}>
            {/* Header del formulario */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px'
              }}>
                Bienvenido
              </h2>
              <p style={{ 
                color: '#64748b',
                fontSize: '16px'
              }}>
                Inicia sesión en tu cuenta para continuar
              </p>
            </div>
            
            {/* Formulario */}
            <div style={{ 
              background: 'white',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Campo Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                {/* Campo Contraseña */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 16px',
                        paddingRight: '48px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#1e293b',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: '#f8fafc'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {showPassword ? 
                        <EyeOff style={{ width: '18px', height: '18px' }} /> : 
                        <Eye style={{ width: '18px', height: '18px' }} />
                      }
                    </button>
                  </div>
                </div>

                {/* Enlace "Olvidé mi contraseña" */}
                <div style={{
                  textAlign: 'right'
                }}>
                  <a href="#" style={{
                    color: '#3b82f6',
                    fontSize: '14px',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding: '12px',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '14px',
                    background: '#fef2f2'
                  }}>
                    {error}
                  </div>
                )}

                {/* Botón de login */}
                <button 
                  type="submit" 
                  style={{
                    width: '100%',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></div>
                      Iniciando sesión...
                    </div>
                  ) : (
                    'INICIAR SESIÓN'
                  )}
                </button>
              </form>

              {/* Footer del formulario */}
              <div style={{
                textAlign: 'center',
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  ¿No tienes una cuenta?{' '}
                  <a href="#" style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    Regístrate
                  </a>
                </p>
              </div>
            </div>

            {/* Información de seguridad */}
            <div style={{
              textAlign: 'center',
              marginTop: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                <CheckCircle style={{ width: '14px', height: '14px' }} />
                Tus datos están protegidos con encriptación de nivel bancario
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
} 