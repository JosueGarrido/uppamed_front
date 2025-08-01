export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '40px'
      }}>
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

        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '16px'
        }}>
          Página no encontrada
        </h1>

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
          <a 
            href="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#1e40af',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            Ir al Inicio
          </a>

          <a 
            href="/login" 
            style={{
              display: 'inline-flex',
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
            Ir al Login
          </a>
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