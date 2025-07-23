import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login'];

// Rutas protegidas por rol
const roleRoutes = {
  'Super Admin': ['/dashboard/super-admin', '/tenants', '/users'],
  'Administrador': ['/dashboard/admin', '/users', '/appointments'],
  'Especialista': ['/dashboard/specialist', '/appointments', '/medical-records'],
  'Paciente': ['/dashboard/paciente', '/appointments', '/medical-records'],
};

// Rutas por defecto para cada rol
const defaultRoutes = {
  'Super Admin': '/dashboard/super-admin',
  'Administrador': '/dashboard/admin',
  'Especialista': '/dashboard/specialist',
  'Paciente': '/dashboard/paciente',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const headers = new Headers(request.headers);
  headers.set('x-current-path', pathname);

  // Función para crear respuestas sin caché
  const createNoCacheResponse = (response: NextResponse) => {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  };

  console.log('🔍 Middleware - Verificando ruta:', pathname);
  
  // Permitir acceso a rutas públicas
  if (publicRoutes.includes(pathname)) {
    console.log('✅ Ruta pública, permitiendo acceso');
    return createNoCacheResponse(NextResponse.next());
  }

  // Verificar token
  const token = request.cookies.get('token')?.value;
  console.log('🔍 Middleware - Token encontrado:', !!token);

  if (!token) {
    console.log('❌ No hay token, redirigiendo a login');
    const url = new URL('/login', request.url);
    return createNoCacheResponse(NextResponse.redirect(url));
  }

  try {
    // Decodificar el token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;
    console.log('👤 Middleware - Rol del usuario:', userRole);
    console.log('🎯 Middleware - Ruta solicitada:', pathname);

    // Si estamos en la ruta raíz o /dashboard, redirigir a la ruta por defecto del rol
    if (pathname === '/' || pathname === '/dashboard') {
      const defaultRoute = defaultRoutes[userRole as keyof typeof defaultRoutes];
      console.log('🔄 Middleware - Redirigiendo a ruta por defecto:', defaultRoute);
      const url = new URL(defaultRoute, request.url);
      return createNoCacheResponse(NextResponse.redirect(url));
    }

    // Verificar acceso por rol
    const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

    console.log('🔍 Middleware - Rutas permitidas para', userRole, ':', allowedRoutes);
    console.log('🔍 Middleware - ¿Tiene acceso?', hasAccess);

    if (!hasAccess) {
      console.log('❌ Middleware - Acceso denegado a la ruta:', pathname);
      // Redirigir a la ruta por defecto del rol
      const defaultRoute = defaultRoutes[userRole as keyof typeof defaultRoutes];
      console.log('🔄 Middleware - Redirigiendo a ruta permitida:', defaultRoute);
      const url = new URL(defaultRoute, request.url);
      return createNoCacheResponse(NextResponse.redirect(url));
    }

    console.log('✅ Middleware - Acceso permitido a:', pathname);
    return createNoCacheResponse(NextResponse.next());
  } catch (error) {
    console.error('❌ Middleware - Error decodificando token:', error);
    // Si hay algún error con el token, redirigir al login
    const url = new URL('/login', request.url);
    return createNoCacheResponse(NextResponse.redirect(url));
  }
}

// Configurar las rutas que deben pasar por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 