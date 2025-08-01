'use client';

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
          <Link 
            href="/" 
            className="not-found-link-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
            }}
          >
            <Home style={{ width: '18px', height: '18px' }} />
            Ir al Inicio
          </Link>

          <Link 
            href="/login" 
            className="not-found-link-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            Ir al Login
          </Link>
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