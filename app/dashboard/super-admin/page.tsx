'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { dashboardService } from '@/services/dashboard.service';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export default function SuperAdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantsActivity, setTenantsActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'Super Admin') {
      if (user.role === 'Administrador') router.replace('/dashboard/admin');
      else if (user.role === 'Especialista') router.replace('/dashboard/specialist');
      else if (user.role === 'Paciente') router.replace('/dashboard/paciente');
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading && user && user.role === 'Super Admin') {
      const fetchSummary = async () => {
        try {
          const data = await dashboardService.getSuperAdminSummary();
          setSummary(data);
          setError(null);
        } catch (err: any) {
          setError('Error al cargar el dashboard');
        } finally {
          setLoading(false);
        }
      };
      const fetchActivity = async () => {
        try {
          const data = await dashboardService.getTenantsActivity();
          setTenantsActivity(data);
        } catch {}
      };
      fetchSummary();
      fetchActivity();
    }
  }, [user, isLoading]);

  if (isLoading || !user) return <div className="p-8 text-center">Cargando...</div>;
  if (user.role !== 'Super Admin') return null;
  if (loading) return <div className="p-8 text-center">Cargando dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Super Admin</h1>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{summary.kpis.totalTenants}</div>
          <div className="text-gray-600 dark:text-gray-300">Tenants</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{summary.kpis.totalUsers}</div>
          <div className="text-gray-600 dark:text-gray-300">Usuarios</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{summary.kpis.totalEspecialistas}</div>
          <div className="text-gray-600 dark:text-gray-300">Especialistas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{summary.kpis.totalPacientes}</div>
          <div className="text-gray-600 dark:text-gray-300">Pacientes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{summary.kpis.totalCitas}</div>
          <div className="text-gray-600 dark:text-gray-300">Citas</div>
        </div>
      </div>
      {/* Últimos registros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Últimos Tenants</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {summary.ultimosTenants.map((t: any) => (
              <li key={t.id} className="py-2">{t.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Últimos Usuarios</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {summary.ultimosUsuarios.map((u: any) => (
              <li key={u.id} className="py-2">{u.username} <span className="text-xs text-gray-500">({u.role})</span></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Últimas Citas</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {summary.ultimasCitas.map((c: any) => (
              <li key={c.id} className="py-2">{new Date(c.date).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      </div>
      {/* Gráficas de actividad por tenant */}
      <div className="mt-12 space-y-8">
        <h2 className="text-xl font-bold mb-4">Actividad por Tenant</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">Citas por Tenant</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tenantsActivity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tenantName" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="citas" fill="#6366f1" name="Citas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">Usuarios por Tenant</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tenantsActivity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tenantName" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#10b981" name="Usuarios" />
                <Bar dataKey="especialistas" fill="#f59e42" name="Especialistas" />
                <Bar dataKey="pacientes" fill="#6366f1" name="Pacientes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 