'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole, User } from '@/types/auth';
import { 
  BarChart3, 
  Building2, 
  Users, 
  Settings, 
  UserCheck, 
  User as UserIcon, 
  Calendar, 
  FileText, 
  Microscope, 
  ClipboardList, 
  LogOut,
  Menu,
  X,
  Clock
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const SidebarWrapper = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [logout, setLogout] = useState<(() => void) | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Verificar si estamos en el cliente y si hay datos de usuario
    if (typeof window !== 'undefined') {
      try {
        // Intentar obtener datos del localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
        
        // Configurar logout
        setLogout(() => () => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.location.href = '/login';
        });
      } catch (error) {
        console.log('Error loading user data:', error);
      }
    }
  }, []);

  // Durante SSR o si no hay usuario, no mostrar el sidebar
  if (!isMounted || !user) return null;

  const menuItems: Record<UserRole, MenuItem[]> = {
    'Super Admin': [
      { name: 'Dashboard', href: '/dashboard/super-admin', icon: <BarChart3 className="h-5 w-5" /> },
      { name: 'Gestión de Tenants', href: '/dashboard/super-admin/tenants', icon: <Building2 className="h-5 w-5" /> },
      { name: 'Gestión de Usuarios', href: '/dashboard/super-admin/users', icon: <Users className="h-5 w-5" /> },
      { name: 'Configuración', href: '/dashboard/super-admin/settings', icon: <Settings className="h-5 w-5" /> },
    ],
    'Administrador': [
      { name: 'Dashboard', href: '/dashboard/admin', icon: <BarChart3 className="h-5 w-5" /> },
      { name: 'Usuarios', href: '/dashboard/admin/users', icon: <Users className="h-5 w-5" /> },
      { name: 'Especialistas', href: '/dashboard/admin/specialists', icon: <UserCheck className="h-5 w-5" /> },
      { name: 'Pacientes', href: '/dashboard/admin/patients', icon: <UserIcon className="h-5 w-5" /> },
      { name: 'Citas', href: '/dashboard/admin/appointments', icon: <Calendar className="h-5 w-5" /> },
    ],
    'Especialista': [
      { name: 'Dashboard', href: '/dashboard/specialist', icon: <BarChart3 className="h-5 w-5" /> },
      { name: 'Mis Citas', href: '/dashboard/specialist/appointments', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Mis Pacientes', href: '/dashboard/specialist/patients', icon: <Users className="h-5 w-5" /> },
      { name: 'Disponibilidad', href: '/dashboard/specialist/availability', icon: <Clock className="h-5 w-5" /> },
      { name: 'Registros Médicos', href: '/medical-records', icon: <FileText className="h-5 w-5" /> },
      { name: 'Exámenes', href: '/medical-exams', icon: <Microscope className="h-5 w-5" /> },
              { name: 'Mi Perfil', href: '/dashboard/profile', icon: <UserCheck className="h-5 w-5" /> },
    ],
    'Paciente': [
      { name: 'Dashboard', href: '/dashboard/paciente', icon: <BarChart3 className="h-5 w-5" /> },
      { name: 'Mis Citas', href: '/appointments', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Historial Médico', href: '/medical-records', icon: <ClipboardList className="h-5 w-5" /> },
      { name: 'Mis Exámenes', href: '/medical-exams', icon: <Microscope className="h-5 w-5" /> },
    ],
  };

  const currentUserMenu = menuItems[user.role] || [];

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Botón hamburguesa para móviles */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Overlay para móviles */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-lg border-r border-medical-200
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="h-full px-3 py-4 overflow-y-auto">
        <div className="mb-5 p-4 bg-medical-gradient-light rounded-lg">
          <h2 className="text-lg font-semibold text-medical-900">{user.name}</h2>
          <p className="text-sm text-medical-600">{user.role}</p>
        </div>
        <ul className="space-y-2">
          {currentUserMenu.map((item: MenuItem) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-3 text-base font-normal rounded-lg transition-all duration-200 ${
                  (() => {
                    let active = false;
                    
                    if (user.role === 'Super Admin') {
                      active = (item.href === '/dashboard/super-admin' && pathname === '/dashboard/super-admin') ||
                              (item.href !== '/dashboard/super-admin' && (pathname === item.href || pathname.startsWith(item.href + '/')));
                    } else if (user.role === 'Administrador') {
                      active = (item.href === '/dashboard/admin' && pathname === '/dashboard/admin') ||
                              (item.href !== '/dashboard/admin' && (pathname === item.href || pathname.startsWith(item.href + '/')));
                    } else if (user.role === 'Especialista') {
                      active = (item.href === '/dashboard/specialist' && pathname === '/dashboard/specialist') ||
                              (item.href !== '/dashboard/specialist' && (pathname === item.href || pathname.startsWith(item.href + '/')));
                    } else if (user.role === 'Paciente') {
                      active = (item.href === '/dashboard/paciente' && pathname === '/dashboard/paciente') ||
                              (item.href !== '/dashboard/paciente' && (pathname === item.href || pathname.startsWith(item.href + '/')));
                    }
                    
                    return active;
                  })()
                    ? 'bg-blue-600 text-white shadow-lg border-l-4 border-blue-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          <li className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex w-full items-center p-3 text-base font-normal text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 hover:shadow-md"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Cerrar Sesión</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
    </>
  );
};

export default SidebarWrapper;