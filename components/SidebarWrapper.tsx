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
  LogOut 
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
      { name: 'Mis Citas', href: '/appointments', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Registros Médicos', href: '/medical-records', icon: <FileText className="h-5 w-5" /> },
      { name: 'Exámenes', href: '/medical-exams', icon: <Microscope className="h-5 w-5" /> },
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

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-medical-200">
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
                  pathname === item.href
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
  );
};

export default SidebarWrapper;