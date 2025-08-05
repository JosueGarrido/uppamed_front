'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, 
  Building2, 
  Users, 
  Activity,
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield,
  Key,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, isLoading } = useAuth();

  // Detectar si es desktop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Limpiar errores cuando cambian los campos
  useEffect(() => {
    if (email) setEmailError('');
    if (password) setPasswordError('');
    if (email || password) setError('');
  }, [email, password]);

  const validateForm = () => {
    let isValid = true;
    
    // Validar email
    if (!email) {
      setEmailError('El correo electrónico es requerido');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validar contraseña
    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login({ email, password });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      
      // Auto-limpiar el error después de 5 segundos
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
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
      
      {/* Contenedor principal responsive */}
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
        {/* Panel izquierdo - Solo visible en desktop y tablet */}
        {isDesktop && (
          <div style={{
            width: '33.33%',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}>
            {/* Burbujas de fondo */}
            <div style={{
              position: 'absolute',
              top: '20%',
              right: '-5%',
              width: '120px',
              height: '120px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '30%',
              left: '-3%',
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite 1s'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '60%',
              right: '10%',
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '50%',
              animation: 'float 7s ease-in-out infinite 2s'
            }}></div>
            
            {/* Logo UppaMed */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '40px',
              zIndex: 10
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <Heart style={{ 
                  width: '32px', 
                  height: '32px', 
                  color: 'white',
                  strokeWidth: 2,
                  marginRight: '8px'
                }} />
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: 'white',
                  letterSpacing: '-0.02em'
                }}>UppaMed</h1>
              </div>
            </div>
            
            {/* Título principal */}
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              textAlign: 'center',
              marginBottom: '16px',
              lineHeight: '1.2',
              zIndex: 10
            }}>Sistema de Gestión Médica</h2>
            
            {/* Descripción */}
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              marginBottom: '40px',
              lineHeight: '1.5',
              maxWidth: '280px',
              zIndex: 10
            }}>Administra centros médicos de manera eficiente y profesional</p>
            
            {/* Características */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              width: '100%',
              maxWidth: '280px',
              zIndex: 10
            }}>
              {/* Gestión de Centros */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Building2 style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: 'white', 
                  marginRight: '16px',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '4px'
                  }}>Gestión de Centros</div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.4'
                  }}>Administra múltiples centros médicos desde una sola plataforma</div>
                </div>
              </div>
              
              {/* Usuarios Multirol */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Users style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: 'white', 
                  marginRight: '16px',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '4px'
                  }}>Usuarios Multirol</div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.4'
                  }}>Super Admin, Administradores, Especialistas y Pacientes</div>
                </div>
              </div>
              
              {/* Dashboard Intuitivo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Activity style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: 'white', 
                  marginRight: '16px',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '4px'
                  }}>Dashboard Intuitivo</div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.4'
                  }}>Monitorea métricas y gestiona citas de manera eficiente</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panel derecho - Formulario de login */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          background: 'white',
          overflowY: 'auto',
          width: '100%'
        }} className="px-4 sm:px-6 lg:px-8">
          {/* Logo móvil y tablet */}
          <div style={{
            display: 'flex',
            textAlign: 'center',
            marginBottom: '32px',
            flexDirection: 'column',
            alignItems: 'center'
          }} className="lg:hidden">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <Heart style={{ 
                width: '28px', 
                height: '28px', 
                color: '#1e40af',
                marginRight: '8px'
              }} />
              <h1 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1e293b'
              }}>UppaMed</h1>
            </div>
            <p style={{ 
              color: '#64748b', 
              fontSize: '14px',
              marginBottom: '8px'
            }}>Sistema de Gestión Médica</p>
            {/* Línea decorativa */}
            <div style={{
              width: '40px',
              height: '2px',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              borderRadius: '1px'
            }}></div>
          </div>

          {/* Formulario de login */}
          <div style={{ 
            width: '100%',
            maxWidth: '400px'
          }}>
            {/* Header del formulario */}
            <div style={{
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield style={{ 
                    width: '24px', 
                    height: '24px', 
                    color: 'white' 
                  }} />
                </div>
              </div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '8px'
              }}>
                Bienvenido de vuelta
              </h2>
              <p style={{ 
                color: '#64748b',
                fontSize: '15px'
              }}>
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>
            
            {/* Formulario */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Campo Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
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
                      height: '44px',
                      padding: '0 14px 0 40px',
                      border: emailError ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'white',
                      boxShadow: emailError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = emailError ? '#ef4444' : '#6366f1';
                      e.target.style.boxShadow = emailError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = emailError ? '#ef4444' : '#d1d5db';
                      e.target.style.boxShadow = emailError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none';
                    }}
                    required
                  />
                </div>
                {emailError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{emailError}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    color: '#9ca3af'
                  }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px 0 40px',
                      paddingRight: '44px',
                      border: passwordError ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#1f2937',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'white',
                      boxShadow: passwordError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = passwordError ? '#ef4444' : '#6366f1';
                      e.target.style.boxShadow = passwordError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = passwordError ? '#ef4444' : '#d1d5db';
                      e.target.style.boxShadow = passwordError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none';
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
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
                {passwordError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{passwordError}</p>
                )}
              </div>

              {/* Error general */}
              {error && (
                <div style={{
                  padding: '12px',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '14px',
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626' }} />
                  {error}
                </div>
              )}

              {/* Botón de login */}
              <button 
                type="submit" 
                style={{
                  width: '100%',
                  height: '44px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(99, 102, 241, 0.3)';
                }}
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px'
                    }}></div>
                    {isLoading ? 'Iniciando sesión...' : 'Iniciando sesión...'}
                  </div>
                ) : (
                  <>
                    <Key style={{ width: '16px', height: '16px' }} />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            {/* Información de ayuda */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Shield style={{ width: '16px', height: '16px', color: '#6366f1' }} />
                ¿Necesitas ayuda?
              </h4>
              <ul style={{
                fontSize: '13px',
                color: '#64748b',
                lineHeight: '1.5',
                paddingLeft: '16px'
              }}>
                <li>Verifica que tu correo electrónico esté escrito correctamente</li>
                <li>Asegúrate de que tu contraseña tenga al menos 6 caracteres</li>
                <li>Si olvidaste tu contraseña, contacta al administrador</li>
                <li>Si tienes problemas de conexión, verifica tu internet</li>
              </ul>
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
        
        /* Responsive breakpoints */
        @media (max-width: 640px) {
          /* Mobile styles */
          .px-4 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1023px) {
          /* Tablet styles */
          .px-6 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          /* Desktop styles */
          .px-8 {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }
      `}</style>
    </>
  );
} 