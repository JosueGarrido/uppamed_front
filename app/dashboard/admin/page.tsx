"use client";
import React, { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { dashboardService } from '@/services/dashboard.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth';
import { Appointment } from '@/types/appointment';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [especialistas, setEspecialistas] = useState<User[]>([]);
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [citas, setCitas] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'Administrador') {
      if (user.role === 'Super Admin') router.replace('/dashboard/super-admin');
      else if (user.role === 'Especialista') router.replace('/dashboard/specialist');
      else if (user.role === 'Paciente') router.replace('/dashboard/paciente');
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading && user && user.role === 'Administrador') {
      const fetchData = async () => {
        setLoading(true);
        try {
          const userData = await authService.fetchUserData();
          if (!userData.tenant_id) throw new Error('No se encontró tenant_id');
          const allUsers = await userService.getUsersByTenant(userData.tenant_id);
          setUsuarios(allUsers);
          setEspecialistas(allUsers.filter((u: User) => u.role === 'Especialista'));
          setPacientes(allUsers.filter((u: User) => u.role === 'Paciente'));
          const allCitas = await dashboardService.getAppointmentsForTenant(userData.tenant_id);
          setCitas(allCitas);
          setError(null);
        } catch (err: unknown) {
          if (err instanceof Error) setError('Error al cargar el dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, isLoading]);

  if (isLoading || !user) return <div className="p-8 text-center">Cargando...</div>;
  if (user.role !== 'Administrador') return null;
  if (loading) return <div className="p-8 text-center">Cargando dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Administrador de Tenant</h1>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{usuarios.length}</div>
          <div className="text-gray-600 dark:text-gray-300">Usuarios</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{especialistas.length}</div>
          <div className="text-gray-600 dark:text-gray-300">Especialistas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{pacientes.length}</div>
          <div className="text-gray-600 dark:text-gray-300">Pacientes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{citas.length}</div>
          <div className="text-gray-600 dark:text-gray-300">Citas</div>
        </div>
      </div>
      {/* Últimos registros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Últimos Usuarios</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {usuarios.slice(0, 5).map((u: User) => (
              <li key={u.id} className="py-2">{u.username} <span className="text-xs text-gray-500">({u.role})</span></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Últimos Especialistas</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {especialistas.slice(0, 5).map((e: User) => (
              <li key={e.id} className="py-2">{e.username} <span className="text-xs text-gray-500">({e.specialty || e.especialidad})</span></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Últimos Pacientes</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {pacientes.slice(0, 5).map((p: User) => (
              <li key={p.id} className="py-2">{p.username} <span className="text-xs text-gray-500">({p.identification_number})</span></li>
            ))}
          </ul>
        </div>
      </div>
      {/* Últimas Citas */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Últimas Citas</h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {citas.slice(0, 5).map((c: Appointment) => (
            <li key={c.id} className="py-2">
              {c.patient?.username || c.patient_id} con {c.specialist?.username || c.specialist_id} - {new Date(c.date).toLocaleString()} <span className="text-xs text-gray-500">({c.status})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 