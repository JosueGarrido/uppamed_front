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
  CheckCircle
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        width: '100%',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        {/* Patrón de fondo animado */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          animation: 'float 20s ease-in-out infinite'
        }}>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 70%)',
            borderRadius: '50%',
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 70%)',
            borderRadius: '50%',
            animation: 'pulse 6s ease-in-out infinite 2s'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 70%)',
            borderRadius: '50%',
            animation: 'pulse 5s ease-in-out infinite 1s'
          }}></div>
        </div>

        {/* Panel izquierdo - Información médica mejorada */}
        <div style={{
          display: 'none',
          width: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          position: 'relative',
          overflow: 'hidden'
        }} className="hidden lg:flex lg:w-1/2">
          {/* Patrón de fondo médico */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
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
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  marginRight: '20px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <Heart style={{ width: '56px', height: '56px', color: 'white' }} />
                </div>
                <h1 style={{
                  fontSize: '42px',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>UppaMed</h1>
              </div>
              <p style={{
                fontSize: '24px',
                color: 'white',
                marginBottom: '12px',
                fontWeight: '600',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>Sistema de Gestión Médica</p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                lineHeight: '1.6'
              }}>Administra citas médicas de manera eficiente y profesional</p>
            </div>

            {/* Características mejoradas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '50%',
                  marginRight: '20px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Calendar style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '20px',
                    color: 'white',
                    marginBottom: '6px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>Gestión de Citas</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.5'
                  }}>Programa y administra citas médicas de manera intuitiva</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '50%',
                  marginRight: '20px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Users style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '20px',
                    color: 'white',
                    marginBottom: '6px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>Pacientes y Doctores</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.5'
                  }}>Gestiona perfiles de pacientes y especialistas médicos</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '50%',
                  marginRight: '20px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Clock style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '20px',
                    color: 'white',
                    marginBottom: '6px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>Horarios Inteligentes</h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.5'
                  }}>Optimiza horarios y reduce tiempos de espera</p>
                </div>
              </div>
            </div>

            {/* Footer mejorado */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '40px'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                © 2024 UppaMed. Sistema integral de gestión médica.
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
            marginBottom: '40px'
          }} className="lg:hidden">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                marginRight: '16px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}>
                <Heart style={{ width: '36px', height: '36px', color: 'white' }} />
              </div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#2d3748',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>UppaMed</h1>
            </div>
            <p style={{ color: '#4a5568', fontSize: '16px' }}>Sistema de Gestión Médica</p>
          </div>

          {/* Formulario de login mejorado */}
          <div style={{ 
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {/* Header del formulario mejorado */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                margin: '0 auto 20px',
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                animation: 'float 3s ease-in-out infinite'
              }}>
                <Shield style={{ width: '40px', height: '40px', color: 'white' }} />
              </div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '12px',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                Bienvenido de vuelta
              </h2>
              <p style={{ 
                color: '#718096',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                Ingresa tus credenciales para acceder al sistema médico
              </p>
            </div>
            
            {/* Formulario mejorado */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '40px',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Campo Email mejorado */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="email" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '4px'
                  }}>
                    Correo Electrónico
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: '#a0aec0'
                    }} />
                    <input
                      id="email"
                      type="email"
                      placeholder="tucorreo@dominio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        height: '48px',
                        paddingLeft: '48px',
                        paddingRight: '16px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        color: '#2d3748',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="password" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '4px'
                  }}>
                    Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: '#a0aec0'
                    }} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '48px',
                        paddingLeft: '48px',
                        paddingRight: '48px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        color: '#2d3748',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
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
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#a0aec0',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#667eea';
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#a0aec0';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {showPassword ? 
                        <EyeOff style={{ width: '18px', height: '18px' }} /> : 
                        <Eye style={{ width: '18px', height: '18px' }} />
                      }
                    </button>
                  </div>
                </div>

                {/* Error mejorado */}
                {error && (
                  <div style={{
                    padding: '16px',
                    border: '2px solid #fed7d7',
                    borderRadius: '12px',
                    color: '#c53030',
                    fontSize: '14px',
                    background: 'rgba(254, 215, 215, 0.8)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#c53030',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>!</span>
                    </div>
                    {error}
                  </div>
                )}

                {/* Botón de login mejorado */}
                <button 
                  type="submit" 
                  style={{
                    width: '100%',
                    height: '52px',
                    fontSize: '18px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '12px'
                      }}></div>
                      Iniciando sesión...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Stethoscope style={{ width: '22px', height: '22px', marginRight: '10px' }} />
                      Iniciar Sesión
                    </div>
                  )}
                </button>
              </form>

              {/* Información adicional mejorada */}
              <div style={{
                textAlign: 'center',
                paddingTop: '24px',
                borderTop: '1px solid rgba(226, 232, 240, 0.5)',
                marginTop: '24px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#718096',
                  marginBottom: '8px'
                }}>
                  ¿Necesitas ayuda? Contacta al administrador del sistema
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#a0aec0'
                }}>
                  <CheckCircle style={{ width: '14px', height: '14px' }} />
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
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
      `}</style>
    </>
  );
} 