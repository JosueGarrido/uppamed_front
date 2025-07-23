'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types/auth';

const SidebarWrapper = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const menuItems: Record<UserRole, Array<{ name: string; href: string; icon: string }>> = {
    'Super Admin': [
      { name: 'Dashboard', href: '/dashboard/super-admin', icon: '📊' },
      { name: 'Gestión de Tenants', href: '/dashboard/super-admin/tenants', icon: '🏢' },
    ],
    'Administrador': [
      { name: 'Dashboard', href: '/dashboard/admin', icon: '📊' },
      { name: 'Usuarios', href: '/dashboard/admin/users', icon: '👥' },
      { name: 'Especialistas', href: '/dashboard/admin/specialists', icon: '👨‍⚕️' },
      { name: 'Pacientes', href: '/dashboard/admin/patients', icon: '🏥' },
      { name: 'Citas', href: '/dashboard/admin/appointments', icon: '📅' },
    ],
    'Especialista': [
      { name: 'Dashboard', href: '/dashboard/specialist', icon: '📊' },
      { name: 'Mis Citas', href: '/appointments', icon: '📅' },
      { name: 'Pacientes', href: '/users', icon: '👥' },
      { name: 'Registros Médicos', href: '/medical-records', icon: '📝' },
      { name: 'Exámenes', href: '/medical-exams', icon: '🔬' },
    ],
    'Paciente': [
      { name: 'Dashboard', href: '/dashboard/paciente', icon: '📊' },
      { name: 'Mis Citas', href: '/dashboard/paciente/appointments', icon: '📅' },
      { name: 'Mi Historia', href: '/dashboard/paciente/history', icon: '📋' },
      { name: 'Mis Exámenes', href: '/dashboard/paciente/exams', icon: '🔬' },
    ],
  };

  const currentUserMenu = menuItems[user.role] || [];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <div className="mb-5 p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{user.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
        </div>
        <ul className="space-y-2">
          {currentUserMenu.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  pathname === item.href
                    ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={logout}
              className="flex w-full items-center p-2 text-base font-normal text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="mr-3">🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default SidebarWrapper;