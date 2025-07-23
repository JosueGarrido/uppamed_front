'use client';

import { useState } from 'react';
import { useRouter }  from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email,    setEmail]    = useState('');
  const [error,    setError]    = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación mínima mock
    if (!username || !password || !email) {
      setError('Debes completar todos los campos para registrarte.');
      return;
    }
    // Simula creación de usuario y login automático
    localStorage.setItem('token', 'mock-token-123');
    localStorage.setItem('user', JSON.stringify({ username, email }));
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-lg shadow"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Crear Cuenta
        </h2>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        <label className="block mb-2 text-sm font-medium">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="tucorreo@ejemplo.com"
          />
        </label>

        <label className="block mb-2 text-sm font-medium">
          Usuario
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="tu_usuario"
          />
        </label>

        <label className="block mb-4 text-sm font-medium">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Registrarme
        </button>

        <div className="mt-6 text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/auth/login"
            className="text-green-600 hover:underline"
          >
            Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
}
