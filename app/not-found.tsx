import Link from 'next/link';
import { Heart, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '40px'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <Heart style={{ 
            width: '32px', 
            height: '32px', 
            color: '#1e40af',
            marginRight: '8px'
          }} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e293b'
          }}>UppaMed</h1>
        </div>

        {/* Error 404 */}
        <div style={{
          fontSize: '120px',
          fontWeight: '900',
          color: '#1e40af',
          lineHeight: '1',
          marginBottom: '24px'
        }}>
          404
        </div>

        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '16px'
        }}>
          Página no encontrada
        </h2>

        <p style={{
          fontSize: '18px',
          color: '#64748b',
          lineHeight: '1.6',
          marginBottom: '40px'
        }}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(59, 130, 246, 0.4)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
          }}>
            <Home style={{ width: '18px', height: '18px' }} />
            Ir al Inicio
          </Link>

          <button onClick={() => window.history.back()} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f9fafb';
            e.currentTarget.style.borderColor = '#9ca3af';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}>
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            Volver Atrás
          </button>
        </div>

        {/* Información adicional */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            ¿Necesitas ayuda?
          </p>
          <p style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Contacta al administrador del sistema si crees que esto es un error.
          </p>
        </div>
      </div>
    </div>
  );
} 