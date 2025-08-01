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
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Zap
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
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #8b5cf6 50%, #a855f7 75%, #ec4899 100%)',
        width: '100%',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        {/* Patrón de fondo animado mejorado */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.08,
          animation: 'float 25s ease-in-out infinite'
        }}>
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 70%)',
            borderRadius: '50%',
            animation: 'pulse 8s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '45%',
            right: '10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 70%)',
            borderRadius: '50%',
            animation: 'pulse 10s ease-in-out infinite 3s'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '25%',
            left: '15%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 70%)',
            borderRadius: '50%',
            animation: 'pulse 12s ease-in-out infinite 2s'
          }}></div>
        </div>

        {/* Panel izquierdo - Información médica mejorada */}
        <div style={{
          display: 'none',
          width: '50%',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 30%, #8b5cf6 60%, #a855f7 85%, #ec4899 100%)',
          position: 'relative',
          overflow: 'hidden'
        }} className="hidden lg:flex lg:w-1/2">
          {/* Patrón de fondo médico mejorado */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.15,
            background: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.15"%3E%3Ccircle cx="40" cy="40" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
          
          {/* Contenido del panel */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 60px',
            color: 'white'
          }}>
            <div style={{ marginBottom: '50px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '35px'
              }}>
                <div style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '50%',
                  marginRight: '24px',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <Heart style={{ width: '64px', height: '64px', color: 'white' }} />
                </div>
                <div>
                  <h1 style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    color: 'white',
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    letterSpacing: '-0.02em'
                  }}>UppaMed</h1>
                  <p style={{
                    fontSize: '18px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>Sistema de Gestión Médica Integral</p>
                </div>
              </div>
              <p style={{
                fontSize: '26px',
                color: 'white',
                marginBottom: '16px',
                fontWeight: '700',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                lineHeight: '1.3'
              }}>Administra citas médicas de manera eficiente y profesional</p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '18px',
                lineHeight: '1.6',
                fontWeight: '400'
              }}>La plataforma más avanzada para la gestión integral de centros médicos y hospitales</p>
            </div>

            {/* Características mejoradas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '18px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  marginRight: '24px',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}>
                  <Calendar style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '700',
                    fontSize: '22px',
                    color: 'white',
                    marginBottom: '8px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>Gestión de Citas Inteligente</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.6',
                    fontSize: '16px',
                    fontWeight: '400'
                  }}>Programa y administra citas médicas con algoritmos de optimización avanzados</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '18px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  marginRight: '24px',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}>
                  <Users style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '700',
                    fontSize: '22px',
                    color: 'white',
                    marginBottom: '8px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>Pacientes y Especialistas</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.6',
                    fontSize: '16px',
                    fontWeight: '400'
                  }}>Gestiona perfiles completos de pacientes y especialistas médicos</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '18px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  marginRight: '24px',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}>
                  <Zap style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '700',
                    fontSize: '22px',
                    color: 'white',
                    marginBottom: '8px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>Optimización Automática</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.6',
                    fontSize: '16px',
                    fontWeight: '400'
                  }}>Reduce tiempos de espera y optimiza horarios automáticamente</p>
                </div>
              </div>
            </div>

            {/* Footer mejorado */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '50px'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '15px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                © 2024 UppaMed. Sistema integral de gestión médica de última generación.
              </p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de login mejorado */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px',
          width: '100%',
          position: 'relative'
        }}>
          {/* Logo móvil mejorado */}
          <div style={{
            display: 'none',
            textAlign: 'center',
            marginBottom: '50px'
          }} className="lg:hidden">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
                borderRadius: '50%',
                marginRight: '20px',
                boxShadow: '0 8px 25px rgba(30, 58, 138, 0.4)'
              }}>
                <Heart style={{ width: '40px', height: '40px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '42px',
                  fontWeight: '800',
                  color: 'white',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.02em'
                }}>UppaMed</h1>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: '16px',
                  fontWeight: '500',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>Sistema de Gestión Médica Integral</p>
              </div>
            </div>
          </div>

          {/* Formulario de login mejorado */}
          <div style={{ 
            width: '100%',
            maxWidth: '450px',
            margin: '0 auto'
          }}>
            {/* Header del formulario mejorado */}
            <div style={{
              textAlign: 'center',
              marginBottom: '45px'
            }}>
              <div style={{
                margin: '0 auto 25px',
                padding: '20px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
                borderRadius: '50%',
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 35px rgba(30, 58, 138, 0.4)',
                animation: 'float 4s ease-in-out infinite'
              }}>
                <Shield style={{ width: '48px', height: '48px', color: 'white' }} />
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '800',
                color: 'white',
                marginBottom: '16px',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                letterSpacing: '-0.02em'
              }}>
                Bienvenido de vuelta
              </h2>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                lineHeight: '1.6',
                fontWeight: '500',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                Ingresa tus credenciales para acceder al sistema médico
              </p>
            </div>
            
            {/* Formulario mejorado */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '45px',
              borderRadius: '24px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {/* Campo Email mejorado */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label htmlFor="email" style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '6px'
                  }}>
                    Correo Electrónico
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{
                      position: 'absolute',
                      left: '18px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      color: '#64748b'
                    }} />
                    <input
                      id="email"
                      type="email"
                      placeholder="tucorreo@dominio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        height: '52px',
                        paddingLeft: '52px',
                        paddingRight: '18px',
                        paddingTop: '14px',
                        paddingBottom: '14px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '14px',
                        color: '#1e293b',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        fontWeight: '500'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translateY(0)';
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Campo Contraseña mejorado */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label htmlFor="password" style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '6px'
                  }}>
                    Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{
                      position: 'absolute',
                      left: '18px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      color: '#64748b'
                    }} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '52px',
                        paddingLeft: '52px',
                        paddingRight: '52px',
                        paddingTop: '14px',
                        paddingBottom: '14px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '14px',
                        color: '#1e293b',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        fontWeight: '500'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translateY(0)';
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '18px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#3b82f6';
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#64748b';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {showPassword ? 
                        <EyeOff style={{ width: '20px', height: '20px' }} /> : 
                        <Eye style={{ width: '20px', height: '20px' }} />
                      }
                    </button>
                  </div>
                </div>

                {/* Error mejorado */}
                {error && (
                  <div style={{
                    padding: '18px',
                    border: '2px solid #fecaca',
                    borderRadius: '14px',
                    color: '#dc2626',
                    fontSize: '15px',
                    background: 'rgba(254, 202, 202, 0.9)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '600'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>!</span>
                    </div>
                    {error}
                  </div>
                )}

                {/* Botón de login mejorado */}
                <button 
                  type="submit" 
                  style={{
                    width: '100%',
                    height: '56px',
                    fontSize: '18px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
                    color: 'white',
                    borderRadius: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(30, 58, 138, 0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '0.02em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(30, 58, 138, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(30, 58, 138, 0.4)';
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '14px'
                      }}></div>
                      Iniciando sesión...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Stethoscope style={{ width: '24px', height: '24px', marginRight: '12px' }} />
                      Iniciar Sesión
                    </div>
                  )}
                </button>
              </form>

              {/* Información adicional mejorada */}
              <div style={{
                textAlign: 'center',
                paddingTop: '28px',
                borderTop: '1px solid rgba(226, 232, 240, 0.6)',
                marginTop: '28px'
              }}>
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  marginBottom: '10px',
                  fontWeight: '500'
                }}>
                  ¿Necesitas ayuda? Contacta al administrador del sistema
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#94a3b8',
                  fontWeight: '500'
                }}>
                  <CheckCircle style={{ width: '16px', height: '16px' }} />
                  Tus datos están protegidos con encriptación de nivel bancario
                </div>
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
          50% { transform: translateY(-15px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.1); }
        }
      `}</style>
    </>
  );
} 