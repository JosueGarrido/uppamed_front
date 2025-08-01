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
      `}</style>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
        width: '100%',
        height: '100vh'
      }}>
        {/* Panel izquierdo - Información médica */}
        <div style={{
          display: 'none',
          width: '50%',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
          position: 'relative',
          overflow: 'hidden'
        }} className="hidden lg:flex lg:w-1/2">
          {/* Patrón de fondo */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1
          }}>
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              width: '80px',
              height: '80px',
              background: 'white',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '128px',
              right: '80px',
              width: '64px',
              height: '64px',
              background: 'white',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '80px',
              left: '80px',
              width: '48px',
              height: '48px',
              background: 'white',
              borderRadius: '50%'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '128px',
              right: '40px',
              width: '96px',
              height: '96px',
              background: 'white',
              borderRadius: '50%'
            }}></div>
          </div>
          
          {/* Contenido del panel */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 48px',
            color: 'white'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  marginRight: '16px'
                }}>
                  <Heart style={{ width: '48px', height: '48px', color: 'white' }} />
                </div>
                <h1 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>UppaMed</h1>
              </div>
              <p style={{
                fontSize: '20px',
                color: 'white',
                marginBottom: '8px',
                fontWeight: '600'
              }}>Sistema de Gestión Médica</p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px'
              }}>Administra centros médicos de manera eficiente y profesional</p>
            </div>

            {/* Características */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  marginRight: '16px'
                }}>
                  <Building2 style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '18px',
                    color: 'white',
                    marginBottom: '4px'
                  }}>Gestión de Centros</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}>Administra múltiples centros médicos desde una sola plataforma</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  marginRight: '16px'
                }}>
                  <Users style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '18px',
                    color: 'white',
                    marginBottom: '4px'
                  }}>Usuarios Multirol</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}>Super Admin, Administradores, Especialistas y Pacientes</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  marginRight: '16px'
                }}>
                  <Activity style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '18px',
                    color: 'white',
                    marginBottom: '4px'
                  }}>Dashboard Intuitivo</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}>Monitorea métricas y gestiona citas de manera eficiente</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '32px'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px'
              }}>
                © 2024 UppaMed. Sistema de gestión médica integral.
              </p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de login - PANTALLA COMPLETA REAL */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '32px',
          width: '100%'
        }}>
          {/* Logo móvil */}
          <div style={{
            display: 'none',
            textAlign: 'center',
            marginBottom: '32px'
          }} className="lg:hidden">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                padding: '8px',
                background: '#2563eb',
                borderRadius: '50%',
                marginRight: '12px'
              }}>
                <Heart style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h1 style={{
                fontSize: '30px',
                fontWeight: 'bold',
                color: '#111827'
              }}>UppaMed</h1>
            </div>
            <p style={{ color: '#6b7280' }}>Sistema de Gestión Médica</p>
          </div>

          {/* Formulario de login - PANTALLA COMPLETA SIN RESTRICCIONES */}
          <div style={{ width: '100%' }}>
            {/* Header del formulario */}
            <div style={{
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <div style={{
                margin: '0 auto 16px',
                padding: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Bienvenido de vuelta
              </h2>
              <p style={{ color: '#6b7280' }}>
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>
            
            {/* Formulario - OCUPA TODO EL ANCHO DISPONIBLE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Campo Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="email" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Correo Electrónico
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      color: '#9ca3af'
                    }} />
                    <input
                      id="email"
                      type="email"
                      placeholder="tucorreo@dominio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        paddingLeft: '40px',
                        paddingRight: '12px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        color: '#111827',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="password" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      color: '#9ca3af'
                    }} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        paddingLeft: '40px',
                        paddingRight: '40px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        color: '#111827',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? 
                        <EyeOff style={{ width: '16px', height: '16px' }} /> : 
                        <Eye style={{ width: '16px', height: '16px' }} />
                      }
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding: '12px',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
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
                    fontSize: '18px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    color: 'white',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)';
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></div>
                      Iniciando sesión...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Stethoscope style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                      Iniciar Sesión
                    </div>
                  )}
                </button>
              </form>

              {/* Información adicional */}
              <div style={{
                textAlign: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  ¿Necesitas ayuda? Contacta al administrador del sistema
                </p>
              </div>
            </div>

            {/* Información de seguridad */}
            <div style={{
              marginTop: '24px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                Tus datos están protegidos con encriptación de nivel bancario
              </p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 