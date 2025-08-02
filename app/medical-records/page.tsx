"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { medicalRecordService } from '@/services/medicalRecord.service';
import { useAuth } from '@/context/AuthContext';
import { MedicalRecord } from '@/types/medicalRecord';
import { toast } from 'sonner';
import { 
  FileText, 
  User, 
  Calendar, 
  Plus, 
  Eye, 
  Edit, 
  Search,
  Filter,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const data = await medicalRecordService.getMyMedicalRecords(user?.role);
        setRecords(data);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching records:', err);
        setError('Error al obtener los registros médicos');
        toast.error('Error al cargar los registros médicos');
        setLoading(false);
      }
    };
    
    if (user?.role) {
      fetchRecords();
    } else {
      setLoading(false);
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredRecords = records.filter(record => {
    return (
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando registros médicos...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Registros Médicos"
        text={`Historial de registros médicos. Total: ${records.length} registros`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/medical-records/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Registro
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5 text-blue-600" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por diagnóstico, notas o paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <div className="grid gap-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Registro #{record.id}
                          </h3>
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            Consulta
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(record.date)}</span>
                          </div>
                          {user?.role !== 'Paciente' && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              <span className="truncate">Paciente #{record.patient_id}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <strong className="text-sm text-gray-700">Diagnóstico:</strong>
                            <p className="text-sm text-gray-600 mt-1">{record.diagnosis}</p>
                          </div>
                          
                          {record.notes && (
                            <div>
                              <strong className="text-sm text-gray-700">Notas:</strong>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{record.notes}</p>
                            </div>
                          )}
                          
                          {record.treatment && (
                            <div>
                              <strong className="text-sm text-gray-700">Tratamiento:</strong>
                              <p className="text-sm text-gray-600 mt-1">{record.treatment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <div className="flex flex-col space-y-2">
                      <Link href={`/medical-records/${record.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Button>
                      </Link>
                      <Link href={`/medical-records/${record.id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron registros' : 'No hay registros médicos'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Los registros médicos aparecerán aquí cuando sean creados'
                }
              </p>
              <Link href="/medical-records/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Registro
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}