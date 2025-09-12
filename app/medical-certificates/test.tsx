'use client';

import { useAuth } from '@/context/AuthContext';

export default function TestPage() {
  const { user } = useAuth();

  if (user?.role !== 'Especialista') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">Solo los especialistas pueden acceder a esta sección.</p>
          <p className="text-sm text-gray-500 mt-2">Tu rol actual: {user?.role || 'No definido'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Certificados Médicos - Página de Prueba</h1>
        <p className="text-gray-600 mb-4">Esta es una página de prueba para verificar que el routing funciona correctamente.</p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-green-800 font-semibold mb-2">✅ Información del Usuario:</h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li><strong>Nombre:</strong> {user?.username}</li>
            <li><strong>Email:</strong> {user?.email}</li>
            <li><strong>Rol:</strong> {user?.role}</li>
            <li><strong>ID:</strong> {user?.id}</li>
          </ul>
        </div>

        <div className="mt-6">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => alert('¡El JavaScript funciona!')}
          >
            Probar Interactividad
          </button>
        </div>
      </div>
    </div>
  );
}
